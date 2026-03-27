#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dashboard de Tesouraria - Processador de Dados Financeiros
Processa dados de receitas e despesas, calcula todos os indicadores
Uso: python processar_dados.py
"""

import json
import csv
from datetime import datetime, timedelta
from typing import List, Dict
from collections import defaultdict

# ============================================================================
# MODELOS DE DADOS
# ============================================================================

class Transacao:
    def __init__(self, data, tipo, categoria, valor, descricao, cliente, vencimento=None):
        self.data = data
        self.tipo = tipo
        self.categoria = categoria
        self.valor = valor
        self.descricao = descricao
        self.cliente = cliente
        self.vencimento = vencimento or data

def parse_date(date_str):
    """Converte string para data no formato YYYY-MM-DD"""
    formatos = ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"]
    for fmt in formatos:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime('%Y-%m-%d')
        except:
            continue
    return date_str

def converter_valor(valor_str):
    """Converte string de valor para float"""
    if not valor_str:
        return 0.0
    valor = valor_str.replace('R$', '').strip().replace('.', '').replace(',', '.')
    try:
        return float(valor)
    except:
        return 0.0

# ============================================================================
# CALCULADORA FINANCEIRA
# ============================================================================

class CalculadoraFinanceira:
    """Calcula todos os indicadores financeiros"""
    
    def __init__(self, transacoes):
        self.transacoes = transacoes
        self.saldo_atual = 0
        self.calcular_saldo()
    
    def calcular_saldo(self):
        """Calcula saldo atual"""
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                self.saldo_atual += tx.valor
            else:
                self.saldo_atual -= tx.valor
    
    # ========== INDICADORES HISTÓRICOS ==========
    
    def receitas_por_vencimento(self):
        """Receitas agrupadas por vencimento"""
        resultado = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                resultado[tx.vencimento] += tx.valor
        return dict(sorted(resultado.items()))
    
    def despesas_por_vencimento(self):
        """Despesas agrupadas por vencimento"""
        resultado = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'despesa':
                resultado[tx.vencimento] += tx.valor
        return dict(sorted(resultado.items()))
    
    def despesas_por_categoria(self):
        """Despesas por categoria"""
        resultado = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'despesa':
                resultado[tx.categoria] += tx.valor
        return dict(sorted(resultado.items(), key=lambda x: x[1], reverse=True))
    
    def receita_por_categoria(self):
        """Receitas por categoria"""
        resultado = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                resultado[tx.categoria] += tx.valor
        return dict(sorted(resultado.items(), key=lambda x: x[1], reverse=True))
    
    def fluxo_caixa_diario(self):
        """Fluxo de caixa diário"""
        resultado = defaultdict(lambda: {'receitas': 0, 'despesas': 0})
        
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                resultado[tx.data]['receitas'] += tx.valor
            else:
                resultado[tx.data]['despesas'] += tx.valor
        
        # Calcular saldo acumulado
        saldo = 0
        for data in sorted(resultado.keys()):
            saldo += resultado[data]['receitas'] - resultado[data]['despesas']
            resultado[data]['saldo'] = saldo
        
        return dict(sorted(resultado.items()))
    
    def maiores_clientes(self, top_n=10):
        """Top N maiores clientes"""
        clientes = defaultdict(lambda: {'total': 0, 'transacoes': 0, 'valores': []})
        
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                clientes[tx.cliente]['total'] += tx.valor
                clientes[tx.cliente]['transacoes'] += 1
                clientes[tx.cliente]['valores'].append(tx.valor)
        
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
    
    def lucro_bruto_por_mes(self):
        """Lucro bruto e margem por mês"""
        resultado = defaultdict(lambda: {'receitas': 0, 'despesas': 0})
        
        for tx in self.transacoes:
            try:
                dt = datetime.strptime(tx.data, '%Y-%m-%d')
                mes = dt.strftime('%Y-%m')
                
                if tx.tipo.lower() == 'receita':
                    resultado[mes]['receitas'] += tx.valor
                else:
                    resultado[mes]['despesas'] += tx.valor
            except:
                continue
        
        # Calcular lucro e margem
        saida = {}
        for mes in sorted(resultado.keys()):
            lucro = resultado[mes]['receitas'] - resultado[mes]['despesas']
            margem = (lucro / resultado[mes]['receitas'] * 100) if resultado[mes]['receitas'] > 0 else 0
            saida[mes] = {
                'receitas': round(resultado[mes]['receitas'], 2),
                'despesas': round(resultado[mes]['despesas'], 2),
                'lucro': round(lucro, 2),
                'margem': round(margem, 2)
            }
        
        return saida
    
    def posicao_estoque(self):
        """Posição de estoque por categoria"""
        estoque = defaultdict(float)
        for tx in self.transacoes:
            if tx.tipo.lower() == 'receita':
                estoque[tx.categoria] += tx.valor
            else:
                estoque[tx.categoria] -= tx.valor
        return dict(sorted(estoque.items(), key=lambda x: x[1], reverse=True))
    
    # ========== INDICADORES DE PREVISIBILIDADE ==========
    
    def perpetuidade_caixa(self, taxa_desconto=0.10):
        """Perpetuidade do caixa"""
        if not self.transacoes:
            return 0
        
        try:
            datas = [datetime.strptime(tx.data, '%Y-%m-%d') for tx in self.transacoes]
            dias = (max(datas) - min(datas)).days or 1
        except:
            dias = 1
        
        receita_total = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'receita')
        receita_mensal = receita_total / (dias / 30) if dias > 0 else 0
        
        return round(receita_mensal / taxa_desconto if taxa_desconto > 0 else 0, 2)
    
    def ponto_equilibrio(self):
        """Ponto de equilíbrio"""
        receita_total = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'receita')
        despesa_fixa = sum(tx.valor for tx in self.transacoes 
                          if tx.tipo.lower() == 'despesa' and tx.categoria in ['Fixa', 'Operacional'])
        
        try:
            datas = [datetime.strptime(tx.data, '%Y-%m-%d') for tx in self.transacoes]
            dias = (max(datas) - min(datas)).days or 1
        except:
            dias = 1
        
        despesa_fixa_mensal = despesa_fixa / (dias / 30) if dias > 0 else 0
        receita_mensal = receita_total / (dias / 30) if dias > 0 else 0
        
        if receita_mensal > despesa_fixa_mensal:
            return round(despesa_fixa_mensal, 2)
        return round(receita_mensal, 2)
    
    def ebitda(self):
        """EBITDA"""
        receita_total = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'receita')
        despesa_operacional = sum(tx.valor for tx in self.transacoes 
                                 if tx.tipo.lower() == 'despesa' and tx.categoria in ['Operacional', 'Variável'])
        return round(receita_total - despesa_operacional, 2)
    
    def dias_de_caixa(self):
        """Dias de caixa disponível"""
        despesa_total = sum(tx.valor for tx in self.transacoes if tx.tipo.lower() == 'despesa')
        try:
            datas = [datetime.strptime(tx.data, '%Y-%m-%d') for tx in self.transacoes]
            dias = (max(datas) - min(datas)).days or 1
        except:
            dias = 1
        
        despesa_diaria = despesa_total / dias if dias > 0 else 0
        return round(self.saldo_atual / despesa_diaria if despesa_diaria > 0 else 0, 2)
    
    def calcular_todos_indicadores(self):
        """Calcula todos os indicadores"""
        return {
            'indicadores_historico': {
                'receitas_por_vencimento': self.receitas_por_vencimento(),
                'despesas_por_vencimento': self.despesas_por_vencimento(),
                'despesas_por_categoria': self.despesas_por_categoria(),
                'receita_por_categoria': self.receita_por_categoria(),
                'fluxo_caixa_diario': self.fluxo_caixa_diario(),
                'maiores_clientes': self.maiores_clientes(),
                'lucro_bruto_por_mes': self.lucro_bruto_por_mes(),
                'posicao_estoque': self.posicao_estoque(),
            },
            'indicadores_previsibilidade': {
                'perpetuidade_caixa': self.perpetuidade_caixa(),
                'ponto_equilibrio': self.ponto_equilibrio(),
                'ebitda': self.ebitda(),
                'dias_de_caixa': self.dias_de_caixa(),
                'saldo_caixa_atual': round(self.saldo_atual, 2),
            }
        }

# ============================================================================
# PROCESSADOR DE DADOS
# ============================================================================

def carregar_csv(arquivo):
    """Carrega dados de arquivo CSV"""
    transacoes = []
    try:
        with open(arquivo, 'r', encoding='utf-8') as f:
            leitor = csv.DictReader(f)
            for linha in leitor:
                try:
                    tx = Transacao(
                        data=parse_date(linha['data']),
                        tipo=linha['tipo'].strip(),
                        categoria=linha['categoria'].strip(),
                        valor=converter_valor(linha['valor']),
                        descricao=linha['descricao'].strip(),
                        cliente=linha['cliente_fornecedor'].strip(),
                        vencimento=parse_date(linha.get('vencimento', linha['data']))
                    )
                    transacoes.append(tx)
                except Exception as e:
                    print(f"[AVISO] Erro ao processar linha: {e}")
                    continue
    except FileNotFoundError:
        print(f"[ERRO] Arquivo '{arquivo}' não encontrado")
    except Exception as e:
        print(f"[ERRO] Erro ao carregar dados: {e}")
    
    return transacoes

def gerar_dados_teste():
    """Gera dados de teste"""
    from random import random, randint, choice
    
    transacoes = []
    clientes = ["Cliente A", "Cliente B", "Cliente C", "Cliente D", "Cliente E"]
    categorias_receita = ["Vendas", "Locação", "Serviços"]
    categorias_despesa = ["Operacional", "Variável", "Fixa"]
    
    data_base = datetime.now()
    
    # Gerar 50 transações aleatórias
    for i in range(50):
        dias_offset = randint(-90, 0)
        data = (data_base + timedelta(days=dias_offset)).strftime('%Y-%m-%d')
        
        if random() > 0.4:  # 60% receitas
            tx = Transacao(
                data=data,
                tipo='receita',
                categoria=choice(categorias_receita),
                valor=randint(1000, 50000),
                descricao=f"Receita {i}",
                cliente=choice(clientes),
                vencimento=data
            )
        else:  # 40% despesas
            tx = Transacao(
                data=data,
                tipo='despesa',
                categoria=choice(categorias_despesa),
                valor=randint(500, 20000),
                descricao=f"Despesa {i}",
                cliente="Fornecedor",
                vencimento=data
            )
        transacoes.append(tx)
    
    return transacoes

def main():
    print("\n" + "="*80)
    print("PROCESSAMENTO DE DADOS FINANCEIROS - DASHBOARD TESOURARIA")
    print("="*80 + "\n")
    
    # Tentar carregar dados do CSV
    arquivo = 'dados_exemplo.csv'
    print(f"Carregando: {arquivo}")
    transacoes = carregar_csv(arquivo)
    
    # Se não carregou, usar dados de teste
    if not transacoes:
        print("[INFO] Gerando dados de teste...")
        transacoes = gerar_dados_teste()
    
    if not transacoes:
        print("[ERRO] Nenhuma transação carregada")
        return
    
    print(f"[OK] Total de transações: {len(transacoes)}\n")
    
    # Calcular indicadores
    print("Calculando indicadores...")
    calc = CalculadoraFinanceira(transacoes)
    resultado = calc.calcular_todos_indicadores()
    
    # Adicionar timestamp
    resultado['timestamp'] = datetime.now().isoformat()
    resultado['total_transacoes'] = len(transacoes)
    
    # Exibir resumo
    print("\n" + "="*80)
    print("RESUMO DOS INDICADORES")
    print("="*80 + "\n")
    
    hist = resultado['indicadores_historico']
    prev = resultado['indicadores_previsibilidade']
    
    print("HISTÓRICO:")
    print(f"  Receitas por categoria: {len(hist['receita_por_categoria'])} categorias")
    print(f"  Despesas por categoria: {len(hist['despesas_por_categoria'])} categorias")
    print(f"  Dias com movimento: {len(hist['fluxo_caixa_diario'])} dias")
    print(f"  Maiores clientes: {len(hist['maiores_clientes'])} clientes")
    print(f"  Meses processados: {len(hist['lucro_bruto_por_mes'])} meses")
    
    print("\nPREVISIBILIDADE:")
    print(f"  Saldo Caixa: R$ {prev['saldo_caixa_atual']:,.2f}")
    print(f"  Perpetuidade Caixa: R$ {prev['perpetuidade_caixa']:,.2f}")
    print(f"  Ponto de Equilíbrio: R$ {prev['ponto_equilibrio']:,.2f}")
    print(f"  EBITDA: R$ {prev['ebitda']:,.2f}")
    print(f"  Dias de Caixa: {prev['dias_de_caixa']:.1f} dias")
    
    # Salvar em JSON
    with open('resultado_indicadores.json', 'w', encoding='utf-8') as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)
    
    print("\n[OK] Resultado salvo: resultado_indicadores.json")
    print("\n" + "="*80 + "\n")

if __name__ == '__main__':
    main()
