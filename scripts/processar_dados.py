#!/usr/bin/env python3
"""
Script para processamento de dados financeiros do Dashboard de Tesouraria.
Pode ser executado standalone para processar arquivos CSV/JSON e gerar relatórios.

Uso:
    python processar_dados.py --arquivo dados.csv --saida resultado.json
    python processar_dados.py --exemplo  # Gera dados de exemplo
"""

import json
import csv
import argparse
from datetime import date, datetime, timedelta
from pathlib import Path
import random
from typing import Optional

from models import (
    DadosFinanceiros, Transacao, TipoTransacao, CategoriaReceita,
    CategoriaDespesa, StatusPagamento, Cliente, ItemEstoque
)
from calculadora import CalculadoraFinanceira


def parse_date(date_str: str) -> date:
    """Converte string de data para objeto date."""
    formatos = ["%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"]
    for fmt in formatos:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Formato de data não reconhecido: {date_str}")


def carregar_csv(caminho: str) -> list[dict]:
    """Carrega dados de um arquivo CSV."""
    with open(caminho, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f, delimiter=';')
        return list(reader)


def carregar_json(caminho: str) -> dict:
    """Carrega dados de um arquivo JSON."""
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def mapear_categoria_receita(categoria: str) -> Optional[CategoriaReceita]:
    """Mapeia string de categoria para enum de receita."""
    mapa = {
        'locacao': CategoriaReceita.LOCACAO,
        'locação': CategoriaReceita.LOCACAO,
        'venda': CategoriaReceita.VENDA,
        'servico': CategoriaReceita.SERVICOS,
        'serviço': CategoriaReceita.SERVICOS,
        'servicos': CategoriaReceita.SERVICOS,
        'serviços': CategoriaReceita.SERVICOS,
        'outros': CategoriaReceita.OUTROS,
    }
    return mapa.get(categoria.lower().strip(), CategoriaReceita.OUTROS)


def mapear_categoria_despesa(categoria: str) -> Optional[CategoriaDespesa]:
    """Mapeia string de categoria para enum de despesa."""
    mapa = {
        'folha': CategoriaDespesa.FOLHA_PAGAMENTO,
        'folha de pagamento': CategoriaDespesa.FOLHA_PAGAMENTO,
        'salario': CategoriaDespesa.FOLHA_PAGAMENTO,
        'salários': CategoriaDespesa.FOLHA_PAGAMENTO,
        'aluguel': CategoriaDespesa.ALUGUEL,
        'imposto': CategoriaDespesa.IMPOSTOS,
        'impostos': CategoriaDespesa.IMPOSTOS,
        'tributos': CategoriaDespesa.IMPOSTOS,
        'manutencao': CategoriaDespesa.MANUTENCAO,
        'manutenção': CategoriaDespesa.MANUTENCAO,
        'combustivel': CategoriaDespesa.COMBUSTIVEL,
        'combustível': CategoriaDespesa.COMBUSTIVEL,
        'fornecedor': CategoriaDespesa.FORNECEDORES,
        'fornecedores': CategoriaDespesa.FORNECEDORES,
        'outros': CategoriaDespesa.OUTROS,
    }
    return mapa.get(categoria.lower().strip(), CategoriaDespesa.OUTROS)


def mapear_status(status: str) -> StatusPagamento:
    """Mapeia string de status para enum."""
    mapa = {
        'pago': StatusPagamento.PAGO,
        'pendente': StatusPagamento.PENDENTE,
        'atrasado': StatusPagamento.ATRASADO,
        'vencido': StatusPagamento.ATRASADO,
        'em aberto': StatusPagamento.PENDENTE,
    }
    return mapa.get(status.lower().strip(), StatusPagamento.PENDENTE)


def converter_valor(valor_str: str) -> float:
    """Converte string de valor monetário para float."""
    if not valor_str:
        return 0.0
    # Remove R$, espaços e pontos de milhar, substitui vírgula por ponto
    valor = valor_str.replace('R$', '').replace(' ', '').replace('.', '').replace(',', '.')
    try:
        return abs(float(valor))
    except ValueError:
        return 0.0


def processar_csv_transacoes(linhas: list[dict]) -> list[Transacao]:
    """
    Processa linhas de CSV e converte para lista de Transações.
    
    Espera colunas como:
    - data ou data_lancamento
    - data_vencimento ou vencimento
    - valor
    - tipo (receita/despesa)
    - categoria
    - descricao
    - cliente_fornecedor ou entidade
    - status
    - empresa (opcional)
    """
    transacoes = []
    
    for i, linha in enumerate(linhas):
        # Normaliza chaves para minúsculas
        linha = {k.lower().strip(): v for k, v in linha.items()}
        
        # Data
        data_str = linha.get('data') or linha.get('data_lancamento') or linha.get('dt_lancamento')
        data_venc_str = linha.get('data_vencimento') or linha.get('vencimento') or linha.get('dt_vencimento') or data_str
        
        if not data_str:
            print(f"Aviso: Linha {i+1} sem data, pulando...")
            continue
        
        try:
            data = parse_date(data_str)
            data_vencimento = parse_date(data_venc_str)
        except ValueError as e:
            print(f"Aviso: Linha {i+1} com data inválida ({e}), pulando...")
            continue
        
        # Valor
        valor = converter_valor(linha.get('valor', '0'))
        if valor == 0:
            continue
        
        # Tipo
        tipo_str = linha.get('tipo', '').lower()
        if 'receita' in tipo_str or 'entrada' in tipo_str or 'credito' in tipo_str:
            tipo = TipoTransacao.RECEITA
        elif 'despesa' in tipo_str or 'saida' in tipo_str or 'debito' in tipo_str:
            tipo = TipoTransacao.DESPESA
        else:
            # Tenta inferir pelo valor (negativo = despesa)
            valor_original = linha.get('valor', '0')
            if '-' in valor_original:
                tipo = TipoTransacao.DESPESA
            else:
                tipo = TipoTransacao.RECEITA
        
        # Categoria
        categoria_str = linha.get('categoria', 'outros')
        categoria_receita = None
        categoria_despesa = None
        
        if tipo == TipoTransacao.RECEITA:
            categoria_receita = mapear_categoria_receita(categoria_str)
        else:
            categoria_despesa = mapear_categoria_despesa(categoria_str)
        
        # Outros campos
        descricao = linha.get('descricao') or linha.get('historico') or f"Transação {i+1}"
        cliente_fornecedor = linha.get('cliente_fornecedor') or linha.get('entidade') or linha.get('nome') or "N/D"
        status = mapear_status(linha.get('status', 'pendente'))
        empresa = linha.get('empresa') or linha.get('empresa_origem')
        
        transacoes.append(Transacao(
            id=linha.get('id') or f"TRX-{i+1:06d}",
            data=data,
            data_vencimento=data_vencimento,
            valor=valor,
            tipo=tipo,
            categoria_receita=categoria_receita,
            categoria_despesa=categoria_despesa,
            descricao=descricao,
            cliente_fornecedor=cliente_fornecedor,
            status=status,
            empresa_origem=empresa
        ))
    
    return transacoes


def gerar_dados_exemplo() -> DadosFinanceiros:
    """Gera conjunto de dados de exemplo para testes."""
    data_fim = date.today()
    data_inicio = data_fim - timedelta(days=120)
    
    clientes = [
        "VANNUCCI IMPORTADORA", "TRUCKS CONTROL", "VLP TRANSPORTES",
        "CARBONI DISTRIBUIDORA", "ROBSON MACAGNANI", "MASA DISTRIBUIDORA",
        "RG COMERCIO DE PECAS", "CUNHADOS DISTRIBUIDORA", "CARRETAO CURITIBA",
        "BIANCO COMERCIO", "PNEUTEK COMERCIO", "FORTPEL COMERCIO"
    ]
    
    fornecedores = [
        "POSTO COMBUSTIVEL", "ENERGIA ELETRICA", "ALUGUEL SEDE",
        "FOLHA PAGAMENTO", "IMPOSTOS FEDERAIS", "MANUTENCAO VEICULOS",
        "FORNECEDOR PECAS", "SERVICOS TERCEIROS"
    ]
    
    empresas = ["PR TRUCKS", "SIDER TRUCKS", "PR TRUCKS SERVICOS"]
    
    transacoes = []
    
    # Gerar receitas
    for i in range(80):
        dias_offset = random.randint(0, 120)
        data = data_inicio + timedelta(days=dias_offset)
        valor = random.uniform(1000, 50000)
        
        transacoes.append(Transacao(
            id=f"REC-{i:04d}",
            data=data,
            data_vencimento=data + timedelta(days=random.randint(0, 30)),
            valor=round(valor, 2),
            tipo=TipoTransacao.RECEITA,
            categoria_receita=random.choice(list(CategoriaReceita)),
            descricao=f"Receita {i}",
            cliente_fornecedor=random.choice(clientes),
            status=random.choice(list(StatusPagamento)),
            empresa_origem=random.choice(empresas)
        ))
    
    # Gerar despesas
    for i in range(60):
        dias_offset = random.randint(0, 120)
        data = data_inicio + timedelta(days=dias_offset)
        valor = random.uniform(500, 30000)
        
        transacoes.append(Transacao(
            id=f"DESP-{i:04d}",
            data=data,
            data_vencimento=data + timedelta(days=random.randint(0, 15)),
            valor=round(valor, 2),
            tipo=TipoTransacao.DESPESA,
            categoria_despesa=random.choice(list(CategoriaDespesa)),
            descricao=f"Despesa {i}",
            cliente_fornecedor=random.choice(fornecedores),
            status=random.choice(list(StatusPagamento)),
            empresa_origem=random.choice(empresas)
        ))
    
    # Gerar estoque
    categorias_estoque = ["Caminhões", "Empilhadeiras", "Plataformas", "Geradores", "Compressores"]
    estoque = []
    
    for i, cat in enumerate(categorias_estoque):
        estoque.append(ItemEstoque(
            id=f"EST-{i:04d}",
            nome=f"Equipamento {cat}",
            categoria=cat,
            quantidade_disponivel=random.randint(5, 20),
            quantidade_locada=random.randint(10, 40),
            quantidade_manutencao=random.randint(1, 5),
            valor_unitario=random.uniform(50000, 200000)
        ))
    
    return DadosFinanceiros(
        transacoes=transacoes,
        clientes=[
            Cliente(
                id=f"CLI-{i:04d}",
                nome=nome,
                total_compras=random.uniform(50000, 500000),
                quantidade_compras=random.randint(5, 50),
                ticket_medio=random.uniform(5000, 20000)
            )
            for i, nome in enumerate(clientes)
        ],
        estoque=estoque,
        saldo_inicial=500000,
        data_inicio=data_inicio,
        data_fim=data_fim,
        empresa="Todas"
    )


def processar_arquivo(caminho: str, saldo_inicial: float = 0) -> DadosFinanceiros:
    """
    Processa arquivo CSV ou JSON e retorna DadosFinanceiros.
    """
    path = Path(caminho)
    
    if path.suffix.lower() == '.csv':
        linhas = carregar_csv(caminho)
        transacoes = processar_csv_transacoes(linhas)
    elif path.suffix.lower() == '.json':
        dados = carregar_json(caminho)
        if isinstance(dados, list):
            # Lista de transações
            transacoes = processar_csv_transacoes(dados)
        else:
            # Objeto completo DadosFinanceiros
            return DadosFinanceiros(**dados)
    else:
        raise ValueError(f"Formato de arquivo não suportado: {path.suffix}")
    
    if not transacoes:
        raise ValueError("Nenhuma transação válida encontrada no arquivo")
    
    # Determina período
    datas = [t.data for t in transacoes]
    data_inicio = min(datas)
    data_fim = max(datas)
    
    return DadosFinanceiros(
        transacoes=transacoes,
        saldo_inicial=saldo_inicial,
        data_inicio=data_inicio,
        data_fim=data_fim
    )


def formatar_moeda(valor: float) -> str:
    """Formata valor como moeda brasileira."""
    return f"R$ {valor:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')


def imprimir_relatorio(dashboard: dict):
    """Imprime relatório formatado no terminal."""
    kpis = dashboard['kpis']
    prev = dashboard['previsibilidade']
    
    print("\n" + "=" * 60)
    print("       DASHBOARD DE TESOURARIA - RELATÓRIO")
    print("=" * 60)
    
    print("\n📊 KPIs PRINCIPAIS")
    print("-" * 40)
    print(f"  Receita Total:        {formatar_moeda(kpis['receita_total'])}")
    print(f"  Despesa Total:        {formatar_moeda(kpis['despesa_total'])}")
    print(f"  Lucro Líquido:        {formatar_moeda(kpis['lucro_liquido'])}")
    print(f"  % Caixa:              {kpis['percentual_caixa']:.1f}%")
    print(f"  Ticket Médio:         {formatar_moeda(kpis['ticket_medio'])}")
    
    print("\n📈 INDICADORES DE PREVISIBILIDADE")
    print("-" * 40)
    print(f"  Perpetuidade Caixa:   {formatar_moeda(prev['perpetuidade_caixa'])}")
    print(f"  Perpetuidade (meses): {prev['perpetuidade_meses']:.1f}")
    print(f"  Ponto de Equilíbrio:  {formatar_moeda(prev['ponto_equilibrio'])}")
    print(f"  % do PE:              {prev['ponto_equilibrio_percentual']:.1f}%")
    print(f"  EBITDA:               {formatar_moeda(prev['ebitda'])}")
    print(f"  Margem EBITDA:        {prev['margem_ebitda']:.1f}%")
    print(f"  Tendência:            {prev['tendencia'].upper()}")
    
    print("\n📁 CATEGORIAS DE RECEITA")
    print("-" * 40)
    for cat in dashboard['receitas_por_categoria'][:5]:
        print(f"  {cat['categoria']:20} {formatar_moeda(cat['valor']):>15} ({cat['percentual']:.1f}%)")
    
    print("\n💸 CATEGORIAS DE DESPESA")
    print("-" * 40)
    for cat in dashboard['despesas_por_categoria'][:5]:
        print(f"  {cat['categoria']:20} {formatar_moeda(cat['valor']):>15} ({cat['percentual']:.1f}%)")
    
    print("\n🏆 MAIORES CLIENTES")
    print("-" * 40)
    for cliente in dashboard['maiores_clientes'][:5]:
        print(f"  {cliente['nome'][:25]:25} {formatar_moeda(cliente['total']):>15}")
    
    print("\n" + "=" * 60)


def main():
    parser = argparse.ArgumentParser(
        description='Processador de dados financeiros para Dashboard de Tesouraria'
    )
    parser.add_argument(
        '--arquivo', '-a',
        help='Caminho para arquivo CSV ou JSON com os dados financeiros'
    )
    parser.add_argument(
        '--saida', '-s',
        help='Caminho para salvar resultado em JSON'
    )
    parser.add_argument(
        '--saldo', '-b',
        type=float,
        default=0,
        help='Saldo inicial do caixa (default: 0)'
    )
    parser.add_argument(
        '--exemplo', '-e',
        action='store_true',
        help='Gera dados de exemplo para teste'
    )
    parser.add_argument(
        '--formato-csv',
        action='store_true',
        help='Mostra formato esperado do CSV'
    )
    
    args = parser.parse_args()
    
    if args.formato_csv:
        print("\n📋 FORMATO ESPERADO DO CSV:")
        print("-" * 50)
        print("Colunas obrigatórias:")
        print("  - data (ou data_lancamento): YYYY-MM-DD ou DD/MM/YYYY")
        print("  - valor: número ou R$ X.XXX,XX")
        print("")
        print("Colunas opcionais:")
        print("  - data_vencimento: data de vencimento")
        print("  - tipo: receita, despesa, entrada, saida")
        print("  - categoria: locacao, venda, servicos, folha, etc.")
        print("  - descricao: descrição da transação")
        print("  - cliente_fornecedor: nome do cliente ou fornecedor")
        print("  - status: pago, pendente, atrasado")
        print("  - empresa: empresa de origem")
        print("")
        print("Exemplo de linha:")
        print("data;valor;tipo;categoria;cliente_fornecedor")
        print("2026-01-15;15000.00;receita;locacao;CLIENTE XYZ")
        return
    
    # Carrega ou gera dados
    if args.exemplo:
        print("Gerando dados de exemplo...")
        dados = gerar_dados_exemplo()
    elif args.arquivo:
        print(f"Processando arquivo: {args.arquivo}")
        dados = processar_arquivo(args.arquivo, args.saldo)
    else:
        print("Use --arquivo para processar um arquivo ou --exemplo para dados de teste")
        print("Use --help para ver todas as opções")
        return
    
    print(f"Total de transações: {len(dados.transacoes)}")
    print(f"Período: {dados.data_inicio} a {dados.data_fim}")
    
    # Processa dados
    calculadora = CalculadoraFinanceira(dados)
    dashboard = calculadora.calcular_dashboard_completo()
    
    # Converte para dict
    resultado = dashboard.model_dump()
    
    # Salva ou imprime
    if args.saida:
        with open(args.saida, 'w', encoding='utf-8') as f:
            json.dump(resultado, f, ensure_ascii=False, indent=2, default=str)
        print(f"\nResultado salvo em: {args.saida}")
    
    # Sempre imprime relatório resumido
    imprimir_relatorio(resultado)


if __name__ == '__main__':
    main()
