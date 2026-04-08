#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
===============================================================================
CONTH - PROCESSADOR DE DADOS FINANCEIROS
===============================================================================
Processa dados de múltiplas fontes para o Dashboard de Tesouraria
Fontes suportadas: Excel (.xlsx, .xls), CSV, PDF, Google Sheets

Uso:
    uv run processar_dados.py                    # Processa todos os arquivos na pasta /dados
    uv run processar_dados.py arquivo.xlsx       # Processa arquivo específico
    uv run processar_dados.py --google "ID"      # Processa Google Sheet por ID
===============================================================================
"""

import json
import csv
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from collections import defaultdict
from pathlib import Path

# Imports para diferentes fontes de dados
try:
    import pandas as pd
    PANDAS_DISPONIVEL = True
except ImportError:
    PANDAS_DISPONIVEL = False
    print("[AVISO] pandas não instalado - algumas funcionalidades limitadas")

try:
    import pdfplumber
    PDF_DISPONIVEL = True
except ImportError:
    PDF_DISPONIVEL = False
    print("[AVISO] pdfplumber não instalado - leitura de PDF indisponível")

try:
    import gspread
    from google.oauth2.service_account import Credentials
    GSPREAD_DISPONIVEL = True
except ImportError:
    GSPREAD_DISPONIVEL = False
    print("[AVISO] gspread não instalado - Google Sheets indisponível")


# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

# Mapeamento de colunas - adapte conforme seu formato de dados
MAPEAMENTO_COLUNAS = {
    # Nomes possíveis para cada coluna (case-insensitive)
    'data': ['data', 'date', 'dt', 'data_lancamento', 'data lancamento', 'dt_lanc'],
    'tipo': ['tipo', 'type', 'natureza', 'tp', 'entrada_saida', 'e/s'],
    'categoria': ['categoria', 'category', 'cat', 'grupo', 'classificacao', 'class'],
    'valor': ['valor', 'value', 'vlr', 'montante', 'amount', 'total'],
    'descricao': ['descricao', 'description', 'desc', 'historico', 'obs', 'observacao'],
    'cliente': ['cliente', 'client', 'fornecedor', 'supplier', 'cliente_fornecedor', 'parceiro'],
    'vencimento': ['vencimento', 'due_date', 'dt_venc', 'data_vencimento', 'vcto'],
}

# Palavras que indicam receita ou despesa
PALAVRAS_RECEITA = ['receita', 'entrada', 'credito', 'crédito', 'recebimento', 'venda', 'c', 'e']
PALAVRAS_DESPESA = ['despesa', 'saida', 'saída', 'debito', 'débito', 'pagamento', 'compra', 'd', 's']


# ============================================================================
# MODELOS DE DADOS
# ============================================================================

class Transacao:
    """Representa uma transação financeira"""
    def __init__(
        self,
        data: str,
        tipo: str,
        categoria: str,
        valor: float,
        descricao: str = "",
        cliente: str = "",
        vencimento: Optional[str] = None
    ):
        self.data = data
        self.tipo = self._normalizar_tipo(tipo)
        self.categoria = categoria or "Outros"
        self.valor = abs(valor)  # Sempre positivo, tipo indica direção
        self.descricao = descricao
        self.cliente = cliente or "Não informado"
        self.vencimento = vencimento or data
    
    def _normalizar_tipo(self, tipo: str) -> str:
        """Normaliza o tipo para 'receita' ou 'despesa'"""
        tipo_lower = str(tipo).lower().strip()
        if any(p in tipo_lower for p in PALAVRAS_RECEITA):
            return 'receita'
        if any(p in tipo_lower for p in PALAVRAS_DESPESA):
            return 'despesa'
        # Tenta pelo sinal do valor original
        return 'receita' if self.valor >= 0 else 'despesa'
    
    def to_dict(self) -> Dict:
        return {
            'data': self.data,
            'tipo': self.tipo,
            'categoria': self.categoria,
            'valor': self.valor,
            'descricao': self.descricao,
            'cliente': self.cliente,
            'vencimento': self.vencimento
        }


# ============================================================================
# UTILITÁRIOS
# ============================================================================

def parse_date(date_value: Any) -> str:
    """Converte qualquer formato de data para YYYY-MM-DD"""
    if date_value is None:
        return datetime.now().strftime('%Y-%m-%d')
    
    # Se já é datetime
    if isinstance(date_value, datetime):
        return date_value.strftime('%Y-%m-%d')
    
    # Se é pandas Timestamp
    if PANDAS_DISPONIVEL and isinstance(date_value, pd.Timestamp):
        return date_value.strftime('%Y-%m-%d')
    
    # Se é string
    date_str = str(date_value).strip()
    
    formatos = [
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d.%m.%Y",
        "%Y/%m/%d",
        "%m/%d/%Y",
        "%d %b %Y",
        "%d %B %Y",
    ]
    
    for fmt in formatos:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime('%Y-%m-%d')
        except:
            continue
    
    # Tenta pandas se disponível
    if PANDAS_DISPONIVEL:
        try:
            dt = pd.to_datetime(date_str, dayfirst=True)
            return dt.strftime('%Y-%m-%d')
        except:
            pass
    
    return datetime.now().strftime('%Y-%m-%d')


def converter_valor(valor: Any) -> float:
    """Converte qualquer formato de valor para float"""
    if valor is None:
        return 0.0
    
    if isinstance(valor, (int, float)):
        return float(valor)
    
    valor_str = str(valor).strip()
    
    # Remove símbolos de moeda e espaços
    for char in ['R$', '$', '€', 'BRL', 'USD', 'EUR', ' ']:
        valor_str = valor_str.replace(char, '')
    
    # Detecta formato brasileiro (1.234,56) vs americano (1,234.56)
    if ',' in valor_str and '.' in valor_str:
        if valor_str.rfind(',') > valor_str.rfind('.'):
            # Formato brasileiro: 1.234,56
            valor_str = valor_str.replace('.', '').replace(',', '.')
        else:
            # Formato americano: 1,234.56
            valor_str = valor_str.replace(',', '')
    elif ',' in valor_str:
        # Só vírgula: pode ser decimal brasileiro
        valor_str = valor_str.replace(',', '.')
    
    # Remove parênteses (indica negativo em contabilidade)
    negativo = '(' in valor_str and ')' in valor_str
    valor_str = valor_str.replace('(', '').replace(')', '')
    
    try:
        valor_float = float(valor_str)
        return -valor_float if negativo else valor_float
    except:
        return 0.0


def encontrar_coluna(df_columns: List[str], possiveis_nomes: List[str]) -> Optional[str]:
    """Encontra nome da coluna no DataFrame"""
    df_cols_lower = {col.lower().strip(): col for col in df_columns}
    
    for nome in possiveis_nomes:
        nome_lower = nome.lower()
        if nome_lower in df_cols_lower:
            return df_cols_lower[nome_lower]
        # Busca parcial
        for col_lower, col_original in df_cols_lower.items():
            if nome_lower in col_lower:
                return col_original
    
    return None


# ============================================================================
# LEITORES DE DADOS
# ============================================================================

class LeitorBase:
    """Classe base para leitores de dados"""
    
    def ler(self, fonte: str) -> List[Transacao]:
        raise NotImplementedError
    
    def _processar_dataframe(self, df: 'pd.DataFrame') -> List[Transacao]:
        """Processa um DataFrame pandas para lista de transações"""
        transacoes = []
        
        # Encontrar colunas
        col_data = encontrar_coluna(df.columns.tolist(), MAPEAMENTO_COLUNAS['data'])
        col_tipo = encontrar_coluna(df.columns.tolist(), MAPEAMENTO_COLUNAS['tipo'])
        col_categoria = encontrar_coluna(df.columns.tolist(), MAPEAMENTO_COLUNAS['categoria'])
        col_valor = encontrar_coluna(df.columns.tolist(), MAPEAMENTO_COLUNAS['valor'])
        col_descricao = encontrar_coluna(df.columns.tolist(), MAPEAMENTO_COLUNAS['descricao'])
        col_cliente = encontrar_coluna(df.columns.tolist(), MAPEAMENTO_COLUNAS['cliente'])
        col_vencimento = encontrar_coluna(df.columns.tolist(), MAPEAMENTO_COLUNAS['vencimento'])
        
        if not col_valor:
            print(f"[ERRO] Coluna de valor não encontrada. Colunas disponíveis: {df.columns.tolist()}")
            return []
        
        for idx, row in df.iterrows():
            try:
                valor = converter_valor(row.get(col_valor))
                if valor == 0:
                    continue
                
                tx = Transacao(
                    data=parse_date(row.get(col_data)) if col_data else datetime.now().strftime('%Y-%m-%d'),
                    tipo=str(row.get(col_tipo, 'receita' if valor > 0 else 'despesa')) if col_tipo else ('receita' if valor > 0 else 'despesa'),
                    categoria=str(row.get(col_categoria, 'Outros')) if col_categoria else 'Outros',
                    valor=valor,
                    descricao=str(row.get(col_descricao, '')) if col_descricao else '',
                    cliente=str(row.get(col_cliente, '')) if col_cliente else '',
                    vencimento=parse_date(row.get(col_vencimento)) if col_vencimento else None
                )
                transacoes.append(tx)
            except Exception as e:
                print(f"[AVISO] Erro na linha {idx}: {e}")
                continue
        
        return transacoes


class LeitorExcel(LeitorBase):
    """Leitor de arquivos Excel (.xlsx, .xls)"""
    
    def ler(self, arquivo: str) -> List[Transacao]:
        if not PANDAS_DISPONIVEL:
            print("[ERRO] pandas necessário para ler Excel")
            return []
        
        try:
            # Tenta ler todas as sheets
            xl = pd.ExcelFile(arquivo)
            todas_transacoes = []
            
            for sheet_name in xl.sheet_names:
                print(f"  Processando aba: {sheet_name}")
                df = pd.read_excel(arquivo, sheet_name=sheet_name)
                
                # Remove linhas completamente vazias
                df = df.dropna(how='all')
                
                transacoes = self._processar_dataframe(df)
                todas_transacoes.extend(transacoes)
                print(f"    -> {len(transacoes)} transações")
            
            return todas_transacoes
        
        except Exception as e:
            print(f"[ERRO] Erro ao ler Excel: {e}")
            return []


class LeitorCSV(LeitorBase):
    """Leitor de arquivos CSV"""
    
    def ler(self, arquivo: str) -> List[Transacao]:
        try:
            # Detecta encoding e separador
            encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
            separadores = [',', ';', '\t', '|']
            
            df = None
            for enc in encodings:
                for sep in separadores:
                    try:
                        if PANDAS_DISPONIVEL:
                            df = pd.read_csv(arquivo, encoding=enc, sep=sep)
                            if len(df.columns) > 1:  # Encontrou separador correto
                                break
                        else:
                            # Fallback sem pandas
                            return self._ler_csv_nativo(arquivo, enc, sep)
                    except:
                        continue
                if df is not None and len(df.columns) > 1:
                    break
            
            if df is None:
                print("[ERRO] Não foi possível ler o CSV")
                return []
            
            return self._processar_dataframe(df)
        
        except Exception as e:
            print(f"[ERRO] Erro ao ler CSV: {e}")
            return []
    
    def _ler_csv_nativo(self, arquivo: str, encoding: str, sep: str) -> List[Transacao]:
        """Lê CSV sem pandas"""
        transacoes = []
        with open(arquivo, 'r', encoding=encoding) as f:
            leitor = csv.DictReader(f, delimiter=sep)
            for linha in leitor:
                try:
                    # Encontra colunas
                    col_valor = None
                    for possivel in MAPEAMENTO_COLUNAS['valor']:
                        if possivel in [k.lower() for k in linha.keys()]:
                            col_valor = possivel
                            break
                    
                    if not col_valor:
                        continue
                    
                    valor = converter_valor(linha.get(col_valor, linha.get('valor', 0)))
                    if valor == 0:
                        continue
                    
                    tx = Transacao(
                        data=parse_date(linha.get('data', '')),
                        tipo=linha.get('tipo', 'receita' if valor > 0 else 'despesa'),
                        categoria=linha.get('categoria', 'Outros'),
                        valor=valor,
                        descricao=linha.get('descricao', ''),
                        cliente=linha.get('cliente', linha.get('cliente_fornecedor', '')),
                        vencimento=parse_date(linha.get('vencimento', ''))
                    )
                    transacoes.append(tx)
                except:
                    continue
        
        return transacoes


class LeitorPDF(LeitorBase):
    """Leitor de arquivos PDF"""
    
    def ler(self, arquivo: str) -> List[Transacao]:
        if not PDF_DISPONIVEL:
            print("[ERRO] pdfplumber necessário para ler PDF")
            return []
        
        try:
            todas_transacoes = []
            
            with pdfplumber.open(arquivo) as pdf:
                for i, pagina in enumerate(pdf.pages):
                    print(f"  Processando página {i + 1}/{len(pdf.pages)}")
                    
                    # Extrai tabelas
                    tabelas = pagina.extract_tables()
                    
                    for tabela in tabelas:
                        if not tabela or len(tabela) < 2:
                            continue
                        
                        # Primeira linha é cabeçalho
                        cabecalho = [str(c).lower().strip() if c else '' for c in tabela[0]]
                        
                        for linha in tabela[1:]:
                            try:
                                if not linha or all(c is None or str(c).strip() == '' for c in linha):
                                    continue
                                
                                dados = dict(zip(cabecalho, linha))
                                
                                # Encontra valor
                                valor = 0
                                for possivel in MAPEAMENTO_COLUNAS['valor']:
                                    if possivel in dados and dados[possivel]:
                                        valor = converter_valor(dados[possivel])
                                        break
                                
                                if valor == 0:
                                    continue
                                
                                # Encontra outras colunas
                                data = ''
                                for possivel in MAPEAMENTO_COLUNAS['data']:
                                    if possivel in dados and dados[possivel]:
                                        data = parse_date(dados[possivel])
                                        break
                                
                                tipo = ''
                                for possivel in MAPEAMENTO_COLUNAS['tipo']:
                                    if possivel in dados and dados[possivel]:
                                        tipo = dados[possivel]
                                        break
                                
                                categoria = ''
                                for possivel in MAPEAMENTO_COLUNAS['categoria']:
                                    if possivel in dados and dados[possivel]:
                                        categoria = dados[possivel]
                                        break
                                
                                tx = Transacao(
                                    data=data or datetime.now().strftime('%Y-%m-%d'),
                                    tipo=tipo or ('receita' if valor > 0 else 'despesa'),
                                    categoria=categoria or 'Outros',
                                    valor=valor,
                                    descricao=dados.get('descricao', dados.get('historico', '')),
                                    cliente=dados.get('cliente', dados.get('fornecedor', '')),
                                )
                                todas_transacoes.append(tx)
                            except:
                                continue
            
            return todas_transacoes
        
        except Exception as e:
            print(f"[ERRO] Erro ao ler PDF: {e}")
            return []


class LeitorGoogleSheets(LeitorBase):
    """Leitor de Google Sheets"""
    
    def __init__(self, credentials_file: str = 'credentials.json'):
        self.credentials_file = credentials_file
    
    def ler(self, spreadsheet_id: str) -> List[Transacao]:
        if not GSPREAD_DISPONIVEL:
            print("[ERRO] gspread necessário para ler Google Sheets")
            return []
        
        try:
            # Autenticação
            scopes = [
                'https://www.googleapis.com/auth/spreadsheets.readonly',
                'https://www.googleapis.com/auth/drive.readonly'
            ]
            
            if not os.path.exists(self.credentials_file):
                print(f"[ERRO] Arquivo de credenciais não encontrado: {self.credentials_file}")
                print("       Baixe o arquivo de credenciais do Google Cloud Console")
                return []
            
            creds = Credentials.from_service_account_file(
                self.credentials_file,
                scopes=scopes
            )
            client = gspread.authorize(creds)
            
            # Abre a planilha
            spreadsheet = client.open_by_key(spreadsheet_id)
            todas_transacoes = []
            
            for worksheet in spreadsheet.worksheets():
                print(f"  Processando aba: {worksheet.title}")
                
                # Pega todos os dados
                dados = worksheet.get_all_records()
                
                if not dados:
                    continue
                
                # Converte para DataFrame se pandas disponível
                if PANDAS_DISPONIVEL:
                    df = pd.DataFrame(dados)
                    transacoes = self._processar_dataframe(df)
                else:
                    # Processa manualmente
                    transacoes = []
                    for linha in dados:
                        try:
                            valor = converter_valor(linha.get('valor', 0))
                            if valor == 0:
                                continue
                            
                            tx = Transacao(
                                data=parse_date(linha.get('data', '')),
                                tipo=linha.get('tipo', 'receita' if valor > 0 else 'despesa'),
                                categoria=linha.get('categoria', 'Outros'),
                                valor=valor,
                                descricao=linha.get('descricao', ''),
                                cliente=linha.get('cliente', ''),
                            )
                            transacoes.append(tx)
                        except:
                            continue
                
                todas_transacoes.extend(transacoes)
                print(f"    -> {len(transacoes)} transações")
            
            return todas_transacoes
        
        except Exception as e:
            print(f"[ERRO] Erro ao ler Google Sheets: {e}")
            return []


# ============================================================================
# PROCESSADOR UNIFICADO
# ============================================================================

class ProcessadorDados:
    """Processador unificado de dados financeiros"""
    
    def __init__(self):
        self.leitores = {
            '.xlsx': LeitorExcel(),
            '.xls': LeitorExcel(),
            '.csv': LeitorCSV(),
            '.pdf': LeitorPDF(),
        }
        self.leitor_google = LeitorGoogleSheets()
    
    def processar_arquivo(self, arquivo: str) -> List[Transacao]:
        """Processa um único arquivo"""
        extensao = Path(arquivo).suffix.lower()
        
        if extensao not in self.leitores:
            print(f"[ERRO] Formato não suportado: {extensao}")
            return []
        
        print(f"\nProcessando: {arquivo}")
        return self.leitores[extensao].ler(arquivo)
    
    def processar_google_sheet(self, spreadsheet_id: str) -> List[Transacao]:
        """Processa uma planilha Google Sheets"""
        print(f"\nProcessando Google Sheet: {spreadsheet_id}")
        return self.leitor_google.ler(spreadsheet_id)
    
    def processar_pasta(self, pasta: str = './dados') -> List[Transacao]:
        """Processa todos os arquivos de uma pasta"""
        todas_transacoes = []
        
        pasta_path = Path(pasta)
        if not pasta_path.exists():
            print(f"[AVISO] Pasta não encontrada: {pasta}")
            return []
        
        extensoes_suportadas = list(self.leitores.keys())
        
        for arquivo in pasta_path.iterdir():
            if arquivo.suffix.lower() in extensoes_suportadas:
                transacoes = self.processar_arquivo(str(arquivo))
                todas_transacoes.extend(transacoes)
        
        return todas_transacoes


# ============================================================================
# CALCULADORA FINANCEIRA
# ============================================================================

class CalculadoraFinanceira:
    """Calcula todos os indicadores financeiros"""
    
    def __init__(self, transacoes: List[Transacao]):
        self.transacoes = transacoes
        self.saldo_atual = 0
        self.calcular_saldo()
    
    def calcular_saldo(self):
        """Calcula saldo atual"""
        for tx in self.transacoes:
            if tx.tipo == 'receita':
                self.saldo_atual += tx.valor
            else:
                self.saldo_atual -= tx.valor
    
    def _get_periodo(self) -> tuple:
        """Retorna período dos dados (dias)"""
        if not self.transacoes:
            return 1, datetime.now(), datetime.now()
        
        datas = []
        for tx in self.transacoes:
            try:
                datas.append(datetime.strptime(tx.data, '%Y-%m-%d'))
            except:
                continue
        
        if not datas:
            return 1, datetime.now(), datetime.now()
        
        data_min = min(datas)
        data_max = max(datas)
        dias = (data_max - data_min).days or 1
        
        return dias, data_min, data_max
    
    # ========== KPIs PRINCIPAIS ==========
    
    def receita_total(self) -> Dict:
        """Receita total e métricas relacionadas"""
        receitas = [tx.valor for tx in self.transacoes if tx.tipo == 'receita']
        despesas = [tx.valor for tx in self.transacoes if tx.tipo == 'despesa']
        
        total_receitas = sum(receitas)
        total_despesas = sum(despesas)
        liquido = total_receitas - total_despesas
        
        percentual_caixa = (liquido / total_receitas * 100) if total_receitas > 0 else 0
        
        return {
            'total': round(total_receitas, 2),
            'liquido': round(liquido, 2),
            'percentual_caixa': round(percentual_caixa, 2),
            'quantidade': len(receitas)
        }
    
    def saidas_total(self) -> Dict:
        """Total de saídas e métricas"""
        receitas = sum(tx.valor for tx in self.transacoes if tx.tipo == 'receita')
        despesas = sum(tx.valor for tx in self.transacoes if tx.tipo == 'despesa')
        
        percentual = (despesas / receitas * 100) if receitas > 0 else 0
        
        return {
            'total': round(despesas, 2),
            'percentual_saidas': round(percentual, 2),
            'quantidade': len([tx for tx in self.transacoes if tx.tipo == 'despesa'])
        }
    
    def media_saidas_mensais(self) -> Dict:
        """Média de saídas mensais"""
        dias, _, _ = self._get_periodo()
        meses = dias / 30 if dias > 0 else 1
        
        total_despesas = sum(tx.valor for tx in self.transacoes if tx.tipo == 'despesa')
        media_mensal = total_despesas / meses
        
        # Perpetuidade em meses
        perpetuidade = self.saldo_atual / media_mensal if media_mensal > 0 else 0
        
        return {
            'media': round(media_mensal, 2),
            'perpetuidade_meses': round(perpetuidade, 2)
        }
    
    def ticket_medio(self) -> Dict:
        """Ticket médio de receitas"""
        receitas = [tx.valor for tx in self.transacoes if tx.tipo == 'receita']
        
        if not receitas:
            return {'atual': 0, 'previsto': 0, 'variacao': 0}
        
        ticket_atual = sum(receitas) / len(receitas)
        
        # Calcula tendência simples
        if len(receitas) >= 2:
            primeira_metade = receitas[:len(receitas)//2]
            segunda_metade = receitas[len(receitas)//2:]
            media_primeira = sum(primeira_metade) / len(primeira_metade)
            media_segunda = sum(segunda_metade) / len(segunda_metade)
            variacao = ((media_segunda - media_primeira) / media_primeira * 100) if media_primeira > 0 else 0
            ticket_previsto = ticket_atual * (1 + variacao/100)
        else:
            variacao = 0
            ticket_previsto = ticket_atual
        
        return {
            'atual': round(ticket_atual, 2),
            'previsto': round(ticket_previsto, 2),
            'variacao': round(variacao, 2)
        }
    
    # ========== INDICADORES HISTÓRICOS ==========
    
    def receitas_despesas_por_mes(self) -> List[Dict]:
        """Receitas e despesas agrupadas por mês"""
        resultado = defaultdict(lambda: {'receitas': 0, 'despesas': 0})
        
        for tx in self.transacoes:
            try:
                dt = datetime.strptime(tx.vencimento, '%Y-%m-%d')
                mes = dt.strftime('%b/%y')
                
                if tx.tipo == 'receita':
                    resultado[mes]['receitas'] += tx.valor
                else:
                    resultado[mes]['despesas'] += tx.valor
            except:
                continue
        
        # Ordena por data e formata para o gráfico
        saida = []
        for mes in sorted(resultado.keys(), key=lambda x: datetime.strptime(x, '%b/%y')):
            saida.append({
                'mes': mes,
                'receitas': round(resultado[mes]['receitas'], 2),
                'despesas': round(resultado[mes]['despesas'], 2)
            })
        
        return saida
    
    def fluxo_caixa_diario(self) -> List[Dict]:
        """Fluxo de caixa diário para o gráfico de área"""
        resultado = defaultdict(lambda: {'entrada': 0, 'saida': 0})
        
        for tx in self.transacoes:
            if tx.tipo == 'receita':
                resultado[tx.data]['entrada'] += tx.valor
            else:
                resultado[tx.data]['saida'] += tx.valor
        
        # Calcula saldo acumulado
        saida = []
        saldo = 0
        
        for data in sorted(resultado.keys()):
            saldo += resultado[data]['entrada'] - resultado[data]['saida']
            
            # Formata data para exibição (dia/mês)
            try:
                dt = datetime.strptime(data, '%Y-%m-%d')
                dia_formatado = dt.strftime('%d/%m')
            except:
                dia_formatado = data
            
            saida.append({
                'dia': dia_formatado,
                'data_completa': data,
                'entrada': round(resultado[data]['entrada'], 2),
                'saida': round(resultado[data]['saida'], 2),
                'saldo': round(saldo, 2)
            })
        
        return saida
    
    def despesas_por_categoria(self) -> List[Dict]:
        """Despesas agrupadas por categoria para gráfico de pizza"""
        resultado = defaultdict(float)
        
        for tx in self.transacoes:
            if tx.tipo == 'despesa':
                resultado[tx.categoria] += tx.valor
        
        total = sum(resultado.values())
        
        saida = []
        for categoria, valor in sorted(resultado.items(), key=lambda x: x[1], reverse=True):
            percentual = (valor / total * 100) if total > 0 else 0
            saida.append({
                'categoria': categoria,
                'valor': round(valor, 2),
                'percentual': round(percentual, 2)
            })
        
        return saida
    
    def receitas_por_categoria(self) -> List[Dict]:
        """Receitas agrupadas por categoria"""
        resultado = defaultdict(float)
        
        for tx in self.transacoes:
            if tx.tipo == 'receita':
                resultado[tx.categoria] += tx.valor
        
        total = sum(resultado.values())
        
        saida = []
        for categoria, valor in sorted(resultado.items(), key=lambda x: x[1], reverse=True):
            percentual = (valor / total * 100) if total > 0 else 0
            saida.append({
                'categoria': categoria,
                'valor': round(valor, 2),
                'percentual': round(percentual, 2)
            })
        
        return saida
    
    def maiores_clientes(self, top_n: int = 10) -> List[Dict]:
        """Top N maiores clientes"""
        clientes = defaultdict(lambda: {'total': 0, 'transacoes': 0})
        
        for tx in self.transacoes:
            if tx.tipo == 'receita':
                clientes[tx.cliente]['total'] += tx.valor
                clientes[tx.cliente]['transacoes'] += 1
        
        resultado = []
        for cliente, dados in clientes.items():
            ticket = dados['total'] / dados['transacoes'] if dados['transacoes'] > 0 else 0
            resultado.append({
                'cliente': cliente,
                'total': round(dados['total'], 2),
                'transacoes': dados['transacoes'],
                'ticket_medio': round(ticket, 2)
            })
        
        return sorted(resultado, key=lambda x: x['total'], reverse=True)[:top_n]
    
    def lucro_bruto_por_mes(self) -> List[Dict]:
        """Lucro bruto e margem por mês"""
        resultado = defaultdict(lambda: {'receitas': 0, 'despesas': 0})
        
        for tx in self.transacoes:
            try:
                dt = datetime.strptime(tx.data, '%Y-%m-%d')
                mes = dt.strftime('%Y-%m')
                
                if tx.tipo == 'receita':
                    resultado[mes]['receitas'] += tx.valor
                else:
                    resultado[mes]['despesas'] += tx.valor
            except:
                continue
        
        saida = []
        for mes in sorted(resultado.keys()):
            lucro = resultado[mes]['receitas'] - resultado[mes]['despesas']
            margem = (lucro / resultado[mes]['receitas'] * 100) if resultado[mes]['receitas'] > 0 else 0
            
            try:
                dt = datetime.strptime(mes, '%Y-%m')
                mes_formatado = dt.strftime('%b/%y')
            except:
                mes_formatado = mes
            
            saida.append({
                'mes': mes_formatado,
                'receitas': round(resultado[mes]['receitas'], 2),
                'despesas': round(resultado[mes]['despesas'], 2),
                'lucro': round(lucro, 2),
                'margem': round(margem, 2)
            })
        
        return saida
    
    def posicao_estoque(self) -> List[Dict]:
        """Posição de estoque por categoria (simulado baseado em categorias)"""
        # Para um dashboard real, isso viria de dados específicos de estoque
        # Aqui simulamos baseado nas categorias de receita
        categorias = defaultdict(lambda: {'disponivel': 0, 'locado': 0, 'manutencao': 0})
        
        for tx in self.transacoes:
            if tx.tipo == 'receita':
                # Distribui valores de forma proporcional
                categorias[tx.categoria]['locado'] += tx.valor * 0.4
                categorias[tx.categoria]['disponivel'] += tx.valor * 0.35
                categorias[tx.categoria]['manutencao'] += tx.valor * 0.05
        
        saida = []
        for categoria, valores in categorias.items():
            total = valores['disponivel'] + valores['locado'] + valores['manutencao']
            if total > 0:
                saida.append({
                    'categoria': categoria,
                    'disponivel': int(valores['disponivel'] / 1000),  # Normaliza para unidades
                    'locado': int(valores['locado'] / 1000),
                    'manutencao': int(valores['manutencao'] / 1000),
                })
        
        return sorted(saida, key=lambda x: x['locado'], reverse=True)[:5]
    
    # ========== INDICADORES DE PREVISIBILIDADE ==========
    
    def perpetuidade_caixa(self) -> Dict:
        """Perpetuidade do caixa"""
        dias, _, _ = self._get_periodo()
        meses = dias / 30 if dias > 0 else 1
        
        total_despesas = sum(tx.valor for tx in self.transacoes if tx.tipo == 'despesa')
        media_gastos = total_despesas / meses
        
        meses_perpetuidade = self.saldo_atual / media_gastos if media_gastos > 0 else 0
        
        return {
            'meses': round(meses_perpetuidade, 2),
            'saldo_atual': round(self.saldo_atual, 2),
            'media_gastos': round(media_gastos, 2)
        }
    
    def ponto_equilibrio(self) -> Dict:
        """Ponto de equilíbrio"""
        dias, _, _ = self._get_periodo()
        meses = dias / 30 if dias > 0 else 1
        
        receita_total = sum(tx.valor for tx in self.transacoes if tx.tipo == 'receita')
        despesa_total = sum(tx.valor for tx in self.transacoes if tx.tipo == 'despesa')
        
        receita_mensal = receita_total / meses
        despesa_mensal = despesa_total / meses
        
        # Ponto de equilíbrio = despesas fixas / (1 - custos variáveis / receita)
        # Simplificado: receita necessária para cobrir despesas
        percentual_atingido = (receita_mensal / despesa_mensal * 100) if despesa_mensal > 0 else 0
        faltante = max(0, despesa_mensal - receita_mensal)
        
        return {
            'valor': round(despesa_mensal, 2),
            'percentual_atingido': round(min(percentual_atingido, 100), 2),
            'faltante': round(faltante, 2)
        }
    
    def ebitda(self) -> Dict:
        """EBITDA e margem EBITDA"""
        receita_total = sum(tx.valor for tx in self.transacoes if tx.tipo == 'receita')
        despesa_operacional = sum(tx.valor for tx in self.transacoes if tx.tipo == 'despesa')
        
        ebitda_valor = receita_total - despesa_operacional
        margem = (ebitda_valor / receita_total * 100) if receita_total > 0 else 0
        
        # Calcula variação
        dias, _, _ = self._get_periodo()
        if dias >= 60:
            # Divide em duas metades
            meio = dias // 2
            primeira_metade = [tx for tx in self.transacoes 
                             if datetime.strptime(tx.data, '%Y-%m-%d') <= datetime.now() - timedelta(days=meio)]
            segunda_metade = [tx for tx in self.transacoes 
                             if datetime.strptime(tx.data, '%Y-%m-%d') > datetime.now() - timedelta(days=meio)]
            
            ebitda_1 = sum(tx.valor for tx in primeira_metade if tx.tipo == 'receita') - \
                       sum(tx.valor for tx in primeira_metade if tx.tipo == 'despesa')
            ebitda_2 = sum(tx.valor for tx in segunda_metade if tx.tipo == 'receita') - \
                       sum(tx.valor for tx in segunda_metade if tx.tipo == 'despesa')
            
            variacao = ((ebitda_2 - ebitda_1) / abs(ebitda_1) * 100) if ebitda_1 != 0 else 0
        else:
            variacao = 0
        
        return {
            'valor': round(ebitda_valor, 2),
            'margem': round(margem, 2),
            'variacao': round(variacao, 2)
        }
    
    # ========== GERAR RESULTADO COMPLETO ==========
    
    def calcular_todos_indicadores(self) -> Dict:
        """Calcula todos os indicadores para o dashboard"""
        return {
            # KPIs principais
            'kpis': {
                'receita_total': self.receita_total(),
                'saidas': self.saidas_total(),
                'media_saidas_mensais': self.media_saidas_mensais(),
                'ticket_medio': self.ticket_medio(),
            },
            
            # Gráficos
            'graficos': {
                'receitas_despesas_por_mes': self.receitas_despesas_por_mes(),
                'fluxo_caixa_diario': self.fluxo_caixa_diario(),
                'despesas_por_categoria': self.despesas_por_categoria(),
                'receitas_por_categoria': self.receitas_por_categoria(),
                'maiores_clientes': self.maiores_clientes(),
                'lucro_bruto_por_mes': self.lucro_bruto_por_mes(),
                'posicao_estoque': self.posicao_estoque(),
            },
            
            # Indicadores de previsibilidade
            'previsibilidade': {
                'perpetuidade_caixa': self.perpetuidade_caixa(),
                'ponto_equilibrio': self.ponto_equilibrio(),
                'ebitda': self.ebitda(),
            },
            
            # Metadados
            'metadata': {
                'timestamp': datetime.now().isoformat(),
                'total_transacoes': len(self.transacoes),
                'periodo': {
                    'dias': self._get_periodo()[0],
                    'inicio': self._get_periodo()[1].strftime('%Y-%m-%d'),
                    'fim': self._get_periodo()[2].strftime('%Y-%m-%d'),
                }
            }
        }


# ============================================================================
# GERADOR DE DADOS DE TESTE
# ============================================================================

def gerar_dados_teste(num_transacoes: int = 100) -> List[Transacao]:
    """Gera dados de teste realistas"""
    from random import random, randint, choice
    
    transacoes = []
    
    clientes = [
        "TRUCKS CONTROL", "MARCOPOLO", "RANDON", "SCANIA", "VOLVO",
        "MERCEDES-BENZ", "VOLARE", "AGRALE", "IVECO", "VOLKSWAGEN"
    ]
    
    categorias_receita = ["Locação", "Venda", "Serviços", "Consultoria", "Manutenção"]
    categorias_despesa = ["Operacional", "Folha de Pagamento", "Impostos", "Fornecedores", 
                         "Utilidades", "Marketing", "Administrativo", "Financeiro"]
    
    data_base = datetime.now()
    
    for i in range(num_transacoes):
        dias_offset = randint(-180, 0)
        data = (data_base + timedelta(days=dias_offset)).strftime('%Y-%m-%d')
        
        if random() > 0.35:  # 65% receitas
            tx = Transacao(
                data=data,
                tipo='receita',
                categoria=choice(categorias_receita),
                valor=randint(5000, 80000),
                descricao=f"Receita operacional #{i}",
                cliente=choice(clientes),
                vencimento=data
            )
        else:  # 35% despesas
            tx = Transacao(
                data=data,
                tipo='despesa',
                categoria=choice(categorias_despesa),
                valor=randint(1000, 30000),
                descricao=f"Despesa #{i}",
                cliente="Fornecedor",
                vencimento=data
            )
        transacoes.append(tx)
    
    return transacoes


# ============================================================================
# MAIN
# ============================================================================

def main():
    print("\n" + "="*80)
    print("CONTH - PROCESSADOR DE DADOS FINANCEIROS")
    print("="*80)
    print("Fontes suportadas: Excel (.xlsx, .xls), CSV, PDF, Google Sheets")
    print("="*80 + "\n")
    
    processador = ProcessadorDados()
    transacoes = []
    
    # Verifica argumentos
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        
        if arg == '--google' and len(sys.argv) > 2:
            # Processa Google Sheet
            spreadsheet_id = sys.argv[2]
            transacoes = processador.processar_google_sheet(spreadsheet_id)
        
        elif arg == '--teste':
            # Gera dados de teste
            print("[INFO] Gerando dados de teste...")
            transacoes = gerar_dados_teste(100)
        
        elif os.path.isfile(arg):
            # Processa arquivo específico
            transacoes = processador.processar_arquivo(arg)
        
        elif os.path.isdir(arg):
            # Processa pasta
            transacoes = processador.processar_pasta(arg)
    
    else:
        # Tenta processar pasta /dados
        pasta_dados = './dados'
        if os.path.exists(pasta_dados):
            transacoes = processador.processar_pasta(pasta_dados)
        else:
            # Gera dados de teste
            print("[INFO] Pasta '/dados' não encontrada. Gerando dados de teste...")
            transacoes = gerar_dados_teste(100)
    
    if not transacoes:
        print("\n[ERRO] Nenhuma transação carregada!")
        print("\nUso:")
        print("  uv run processar_dados.py                     # Processa pasta /dados")
        print("  uv run processar_dados.py arquivo.xlsx        # Processa arquivo específico")
        print("  uv run processar_dados.py /caminho/pasta      # Processa pasta específica")
        print("  uv run processar_dados.py --google \"ID\"       # Processa Google Sheet")
        print("  uv run processar_dados.py --teste             # Gera dados de teste")
        return
    
    print(f"\n[OK] Total de transações carregadas: {len(transacoes)}")
    
    # Calcula indicadores
    print("\nCalculando indicadores...")
    calc = CalculadoraFinanceira(transacoes)
    resultado = calc.calcular_todos_indicadores()
    
    # Exibe resumo
    print("\n" + "="*80)
    print("RESUMO DOS INDICADORES")
    print("="*80)
    
    kpis = resultado['kpis']
    prev = resultado['previsibilidade']
    
    print("\nKPIs PRINCIPAIS:")
    print(f"  Receita Total:         R$ {kpis['receita_total']['total']:>15,.2f}")
    print(f"  Receita Líquida:       R$ {kpis['receita_total']['liquido']:>15,.2f}")
    print(f"  Saídas:                R$ {kpis['saidas']['total']:>15,.2f}")
    print(f"  Média Saídas/Mês:      R$ {kpis['media_saidas_mensais']['media']:>15,.2f}")
    print(f"  Ticket Médio:          R$ {kpis['ticket_medio']['atual']:>15,.2f}")
    
    print("\nPREVISIBILIDADE:")
    print(f"  Perpetuidade Caixa:    {prev['perpetuidade_caixa']['meses']:>15.2f} meses")
    print(f"  Saldo Atual:           R$ {prev['perpetuidade_caixa']['saldo_atual']:>15,.2f}")
    print(f"  Ponto Equilíbrio:      R$ {prev['ponto_equilibrio']['valor']:>15,.2f}")
    print(f"  % Atingido:            {prev['ponto_equilibrio']['percentual_atingido']:>15.1f}%")
    print(f"  EBITDA:                R$ {prev['ebitda']['valor']:>15,.2f}")
    print(f"  Margem EBITDA:         {prev['ebitda']['margem']:>15.1f}%")
    
    # Salva resultado
    arquivo_saida = 'dados_dashboard.json'
    with open(arquivo_saida, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)
    
    print(f"\n[OK] Resultado salvo em: {arquivo_saida}")
    
    # Salva também as transações brutas
    arquivo_transacoes = 'transacoes.json'
    with open(arquivo_transacoes, 'w', encoding='utf-8') as f:
        json.dump([tx.to_dict() for tx in transacoes], f, indent=2, ensure_ascii=False)
    
    print(f"[OK] Transações salvas em: {arquivo_transacoes}")
    print("\n" + "="*80 + "\n")


if __name__ == '__main__':
    main()
