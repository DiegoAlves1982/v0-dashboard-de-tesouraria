import fastapi
import fastapi.middleware.cors
from datetime import date, timedelta
import random

from models import (
    DadosFinanceiros, Transacao, TipoTransacao, CategoriaReceita, 
    CategoriaDespesa, StatusPagamento, Cliente, ItemEstoque,
    KPIResponse, DashboardCompleto
)
from calculadora import CalculadoraFinanceira

app = fastapi.FastAPI(
    title="API Dashboard Tesouraria",
    description="API para processamento de dados financeiros e cálculo de indicadores",
    version="1.0.0"
)

app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    """Verificação de saúde da API"""
    return {"status": "ok", "service": "dashboard-tesouraria"}


@app.post("/dashboard/completo")
async def calcular_dashboard_completo(dados: DadosFinanceiros) -> DashboardCompleto:
    """
    Calcula todos os indicadores do dashboard a partir dos dados financeiros.
    
    Retorna:
    - KPIs principais (receita, despesa, lucro, ticket médio, etc.)
    - Fluxo de caixa diário
    - Receitas e despesas por vencimento
    - Categorização de receitas e despesas
    - Ranking de maiores clientes
    - Lucro e margem mensal
    - Posição de estoque
    - Indicadores de previsibilidade (perpetuidade, ponto de equilíbrio, EBITDA)
    """
    calculadora = CalculadoraFinanceira(dados)
    return calculadora.calcular_dashboard_completo()


@app.post("/dashboard/kpis")
async def calcular_kpis(dados: DadosFinanceiros) -> KPIResponse:
    """Calcula apenas os KPIs principais"""
    calculadora = CalculadoraFinanceira(dados)
    return calculadora.calcular_kpis()


@app.post("/dashboard/fluxo-caixa")
async def calcular_fluxo_caixa(dados: DadosFinanceiros) -> list[dict]:
    """Calcula o fluxo de caixa diário"""
    calculadora = CalculadoraFinanceira(dados)
    return [f.model_dump() for f in calculadora.calcular_fluxo_caixa_diario()]


@app.post("/dashboard/previsibilidade")
async def calcular_previsibilidade(dados: DadosFinanceiros) -> dict:
    """
    Calcula indicadores de previsibilidade:
    - Perpetuidade do Caixa
    - Ponto de Equilíbrio
    - EBITDA e Margem EBITDA
    """
    calculadora = CalculadoraFinanceira(dados)
    return calculadora.calcular_previsibilidade().model_dump()


@app.post("/dashboard/categorias")
async def calcular_categorias(dados: DadosFinanceiros) -> dict:
    """Calcula receitas e despesas por categoria"""
    calculadora = CalculadoraFinanceira(dados)
    return {
        "receitas": [c.model_dump() for c in calculadora.calcular_receitas_por_categoria()],
        "despesas": [c.model_dump() for c in calculadora.calcular_despesas_por_categoria()]
    }


@app.post("/dashboard/clientes")
async def calcular_ranking_clientes(dados: DadosFinanceiros, limite: int = 10) -> list[dict]:
    """Retorna ranking dos maiores clientes"""
    calculadora = CalculadoraFinanceira(dados)
    return [c.model_dump() for c in calculadora.calcular_maiores_clientes(limite)]


@app.post("/dashboard/lucro-margem")
async def calcular_lucro_margem(dados: DadosFinanceiros) -> list[dict]:
    """Calcula lucro bruto e margem por mês"""
    calculadora = CalculadoraFinanceira(dados)
    return [l.model_dump() for l in calculadora.calcular_lucro_margem_mensal()]


@app.get("/dashboard/dados-exemplo")
async def gerar_dados_exemplo() -> DadosFinanceiros:
    """
    Gera dados de exemplo para testar o dashboard.
    Use este endpoint para obter um modelo de dados válido.
    """
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


@app.get("/docs-info")
async def documentacao_api():
    """Informações sobre como usar a API"""
    return {
        "endpoints": {
            "/dashboard/completo": "POST - Calcula todos os indicadores do dashboard",
            "/dashboard/kpis": "POST - Calcula apenas os KPIs principais",
            "/dashboard/fluxo-caixa": "POST - Calcula fluxo de caixa diário",
            "/dashboard/previsibilidade": "POST - Calcula perpetuidade, ponto de equilíbrio e EBITDA",
            "/dashboard/categorias": "POST - Calcula receitas e despesas por categoria",
            "/dashboard/clientes": "POST - Ranking dos maiores clientes",
            "/dashboard/lucro-margem": "POST - Lucro bruto e margem por mês",
            "/dashboard/dados-exemplo": "GET - Gera dados de exemplo para testes"
        },
        "formato_dados": {
            "transacoes": "Lista de transações com data, valor, tipo (receita/despesa), categoria, cliente/fornecedor",
            "clientes": "Lista opcional de clientes com histórico",
            "estoque": "Lista opcional de itens de estoque",
            "saldo_inicial": "Saldo inicial do caixa",
            "data_inicio": "Data inicial do período (YYYY-MM-DD)",
            "data_fim": "Data final do período (YYYY-MM-DD)"
        },
        "indicadores_calculados": [
            "Receita Total",
            "Despesa Total", 
            "Lucro Líquido",
            "Ticket Médio",
            "Fluxo de Caixa Diário",
            "Receitas/Despesas por Categoria",
            "Maiores Clientes",
            "Lucro Bruto e Margem Mensal",
            "Posição de Estoque",
            "Perpetuidade do Caixa",
            "Ponto de Equilíbrio",
            "EBITDA e Margem EBITDA"
        ]
    }
