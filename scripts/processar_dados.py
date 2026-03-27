#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script standalone para processar dados financeiros - Dashboard Tesouraria Sisloc
Sem dependências externas, usa apenas biblioteca padrão Python
"""

import json
import csv
from datetime import datetime, timedelta
from typing import List, Dict
from dataclasses import dataclass, asdict
from collections import defaultdict

# ============================================================================
# MODELOS DE DADOS
# ============================================================================

@dataclass
class Transacao:
    """Representa uma transação financeira"""
    data: str
    tipo: str
    categoria: str
    valor: float
    descricao: str
    cliente_fornecedor: str
    vencimento: str = None

@dataclass
class IndicadorHistorico:
    """Indicadores históricos calculados"""
    receitas_por_vencimento: Dict
    despesas_por_vencimento: Dict
    despesas_por_categoria: Dict
    receita_por_categoria: Dict
    fluxo_caixa_diario: Dict
    maiores_clientes: List[Dict]
    lucro_bruto_por_mes: Dict
    posicao_estoque: Dict

@dataclass
class IndicadorPrevisibilidade:
    """Indicadores de previsibilidade"""
    perpetuidade_caixa: float
    ponto_equilibrio: float
    ebitda: float
    saldo_caixa_atual: float
    receita_media_diaria: float
    despesa_media_diaria: float
    dias_de_caixa: float

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def parse_date(date_str: str) -> str:
    """Valida e normaliza data para formato YYYY-MM-DD"""
    formatos = ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"]
    for fmt in formatos:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    raise ValueError(f"Formato de data não reconhecido: {date_str}")

def converter_valor(valor_str: str) -> float:
    """Converte string de valor monetário para float"""
    if not valor_str:
        return 0.0
    valor = valor_str.replace('R$', '').replace(' ', '').replace('.', '').replace(',', '.')
    try:
        return abs(float(valor))
    except ValueError:
        return 0.0

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
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                self.saldo_atual += tx.valor
            else:
                self.saldo_atual -= tx.valor
    
    def receitas_por_vencimento(self) -> Dict:
        resultado = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita' and tx.vencimento:
                resultado[tx.vencimento] += tx.valor
        return dict(resultado)
    
    def despesas_por_vencimento(self) -> Dict:
        resultado = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'despesa' and tx.vencimento:
                resultado[tx.vencimento] += tx.valor
        return dict(resultado)
    
    def despesas_por_categoria(self) -> Dict:
        resultado = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'despesa':
                resultado[tx.categoria] += tx.valor
        return dict(resultado)
    
    def receita_por_categoria(self) -> Dict:
        resultado = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                resultado[tx.categoria] += tx.valor
        return dict(resultado)
    
    def fluxo_caixa_diario(self) -> Dict:
        resultado = defaultdict(lambda: {'receitas': 0, 'despesas': 0, 'saldo': 0})
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                resultado[tx.data]['receitas'] += tx.valor
            else:
                resultado[tx.data]['despesas'] += tx.valor
        
        saldo_acumulado = 0
        for data in sorted(resultado.keys()):
            saldo_acumulado += resultado[data]['receitas'] - resultado[data]['despesas']
            resultado[data]['saldo'] = saldo_acumulado
        
        return dict(resultado)
    
    def maiores_clientes(self, top_n: int = 10) -> List[Dict]:
        clientes = defaultdict(lambda: {'total': 0, 'transacoes': 0})
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                clientes[tx.cliente_fornecedor]['total'] += tx.valor
                clientes[tx.cliente_fornecedor]['transacoes'] += 1
        
        resultado = []
        for cliente, dados in clientes.items():
            ticket_medio = dados['total'] / dados['transacoes'] if dados['transacoes'] > 0 else 0
            resultado.append({
                'cliente': cliente,
                'total': round(dados['total'], 2),
                'transacoes': dados['transacoes'],
                'ticket_medio': round(ticket_medio, 2)
            })
        
        return sorted(resultado, key=lambda x: x['total'], reverse=True)[:top_n]
    
    def lucro_bruto_por_mes(self) -> Dict:
        resultado = defaultdict(lambda: {'receitas': 0, 'despesas': 0})
        for tx in self.transacoes:
            data_obj = datetime.strptime(tx.data, '%Y-%m-%d')
            mes = data_obj.strftime('%Y-%m')
            if tx.tipo.lower() == 'receita':
                resultado[mes]['receitas'] += tx.valor
            else:
                resultado[mes]['despesas'] += tx.valor
        
        for mes in resultado:
            resultado[mes]['lucro'] = resultado[mes]['receitas'] - resultado[mes]['despesas']
            if resultado[mes]['receitas'] > 0:
                resultado[mes]['margem'] = (resultado[mes]['lucro'] / resultado[mes]['receitas']) * 100
        
        return dict(resultado)
    
    def posicao_estoque(self) -> Dict:
        estoque = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                estoque[tx.categoria] += tx.valor
            else:
                estoque[tx.categoria] -= tx.valor
        return dict(estoque)
    
    def perpetuidade_caixa(self) -> float:
        if not self.transacoes:
            return 0
        dias = len(set(tx.data for tx in self.transacoes))
        receita_total = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'receita')
        return (receita_total / dias * 30) / 0.10 if dias > 0 else 0
    
    def ponto_equilibrio(self) -> float:
        receita_total = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'receita')
        despesa_fixa = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'despesa' and tx.categoria in ['Fixa', 'Operacional'])
        return despesa_fixa
    
    def ebitda(self) -> float:
        receita_total = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'receita')
        despesa_operacional = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'despesa' and tx.categoria in ['Operacional', 'Variável'])
        return receita_total - despesa_operacional
    
    def calcular_indicadores_previsibilidade(self) -> IndicadorPrevisibilidade:
        fluxo = self.fluxo_caixa_diario()
        dias = len(fluxo)
        receita_total = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'receita')
        despesa_total = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'despesa')
        receita_media_diaria = receita_total / dias if dias > 0 else 0
        despesa_media_diaria = despesa_total / dias if dias > 0 else 0
        dias_de_caixa = self.saldo_atual / despesa_media_diaria if despesa_media_diaria > 0 else 0
        
        return IndicadorPrevisibilidade(
            perpetuidade_caixa=self.perpetuidade_caixa(),
            ponto_equilibrio=self.ponto_equilibrio(),
            ebitda=self.ebitda(),
            saldo_caixa_atual=self.saldo_atual,
            receita_media_diaria=receita_media_diaria,
            despesa_media_diaria=despesa_media_diaria,
            dias_de_caixa=dias_de_caixa
        )
    
    def calcular_indicadores_historico(self) -> IndicadorHistorico:
        return IndicadorHistorico(
            receitas_por_vencimento=self.receitas_por_vencimento(),
            despesas_por_vencimento=self.despesas_por_vencimento(),
            despesas_por_categoria=self.despesas_por_categoria(),
            receita_por_categoria=self.receita_por_categoria(),
            fluxo_caixa_diario=self.fluxo_caixa_diario(),
            maiores_clientes=self.maiores_clientes(),
            lucro_bruto_por_mes=self.lucro_bruto_por_mes(),
            posicao_estoque=self.posicao_estoque()
        )

# ============================================================================
# PROCESSAMENTO
# ============================================================================

def carregar_csv(caminho: str) -> List[Transacao]:
    transacoes = []
    try:
        with open(caminho, 'r', encoding='utf-8') as f:
            leitor = csv.DictReader(f, delimiter=',')
            for i, linha in enumerate(leitor):
                try:
                    data = parse_date(linha['data'].strip())
                    vencimento = parse_date(linha.get('vencimento', linha['data']).strip())
                    tx = Transacao(
                        data=data,
                        tipo=linha['tipo'].strip().lower(),
                        categoria=linha['categoria'].strip(),
                        valor=converter_valor(linha['valor'].strip()),
                        descricao=linha['descricao'].strip(),
                        cliente_fornecedor=linha['cliente_fornecedor'].strip(),
                        vencimento=vencimento
                    )
                    transacoes.append(tx)
                except Exception as e:
                    print(f"[AVISO] Linha {i+1}: {e}")
                    continue
    except FileNotFoundError:
        print(f"[ERRO] Arquivo '{caminho}' não encontrado")
    except Exception as e:
        print(f"[ERRO] {e}")
    return transacoes

def processar_arquivo(caminho: str) -> Dict:
    print(f"\n{'='*80}")
    print(f"PROCESSAMENTO DE DADOS FINANCEIROS - DASHBOARD TESOURARIA")
    print(f"{'='*80}\n")
    
    print(f"Carregando: {caminho}")
    transacoes = carregar_csv(caminho)
    
    if not transacoes:
        print("[ERRO] Nenhuma transação carregada")
        return {}
    
    print(f"Transações carregadas: {len(transacoes)}\n")
    
    calc = CalculadoraFinanceira(transacoes)
    historico = calc.calcular_indicadores_historico()
    previsibilidade = calc.calcular_indicadores_previsibilidade()
    
    resultado = {
        'timestamp': datetime.now().isoformat(),
        'total_transacoes': len(transacoes),
        'indicadores_historico': {
            'receitas_por_vencimento': historico.receitas_por_vencimento,
            'despesas_por_vencimento': historico.despesas_por_vencimento,
            'despesas_por_categoria': historico.despesas_por_categoria,
            'receita_por_categoria': historico.receita_por_categoria,
            'fluxo_caixa_diario': historico.fluxo_caixa_diario,
            'maiores_clientes': historico.maiores_clientes,
            'lucro_bruto_por_mes': historico.lucro_bruto_por_mes,
            'posicao_estoque': historico.posicao_estoque,
        },
        'indicadores_previsibilidade': asdict(previsibilidade)
    }
    
    return resultado

def exibir_relatorio(resultado: Dict):
    if not resultado:
        return
    
    print(f"{'='*80}")
    print("RELATÓRIO DE INDICADORES FINANCEIROS")
    print(f"{'='*80}\n")
    
    print(f"Data: {resultado['timestamp']}")
    print(f"Transações: {resultado['total_transacoes']}\n")
    
    historico = resultado['indicadores_historico']
    prev = resultado['indicadores_previsibilidade']
    
    print(f"{'─'*80}\nINDICADORES HISTÓRICOS\n{'─'*80}\n")
    
    print("📊 RECEITAS POR VENCIMENTO:")
    for data, valor in sorted(historico['receitas_por_vencimento'].items())[-5:]:
        print(f"  {data}: R$ {valor:,.2f}")
    
    print("\n📊 DESPESAS POR VENCIMENTO:")
    for data, valor in sorted(historico['despesas_por_vencimento'].items())[-5:]:
        print(f"  {data}: R$ {valor:,.2f}")
    
    print("\n💰 RECEITA POR CATEGORIA:")
    for cat, valor in sorted(historico['receita_por_categoria'].items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {cat}: R$ {valor:,.2f}")
    
    print("\n💸 DESPESA POR CATEGORIA:")
    for cat, valor in sorted(historico['despesas_por_categoria'].items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {cat}: R$ {valor:,.2f}")
    
    print("\n🏆 MAIORES CLIENTES:")
    for cli in historico['maiores_clientes'][:5]:
        print(f"  {cli['cliente']}: R$ {cli['total']:,.2f} ({cli['transacoes']} transações, ticket médio R$ {cli['ticket_medio']:,.2f})")
    
    print(f"\n{'─'*80}\nINDICADORES DE PREVISIBILIDADE\n{'─'*80}\n")
    
    print(f"Saldo Caixa: R$ {prev['saldo_caixa_atual']:,.2f}")
    print(f"Receita Média Diária: R$ {prev['receita_media_diaria']:,.2f}")
    print(f"Despesa Média Diária: R$ {prev['despesa_media_diaria']:,.2f}")
    print(f"Dias de Caixa: {prev['dias_de_caixa']:.2f} dias")
    print(f"Perpetuidade: R$ {prev['perpetuidade_caixa']:,.2f}")
    print(f"Ponto Equilíbrio: R$ {prev['ponto_equilibrio']:,.2f}")
    print(f"EBITDA: R$ {prev['ebitda']:,.2f}")
    
    print(f"\n{'='*80}\n")

def salvar_json(resultado: Dict, caminho: str = 'resultado.json'):
    try:
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, indent=2, ensure_ascii=False)
        print(f"✓ Resultado salvo: {caminho}\n")
    except Exception as e:
        print(f"[ERRO] {e}\n")

if __name__ == "__main__":
    import sys
    arquivo = sys.argv[1] if len(sys.argv) > 1 else 'dados_exemplo.csv'
    resultado = processar_arquivo(arquivo)
    exibir_relatorio(resultado)
    salvar_json(resultado)
    print("✓ Processamento concluído!")
