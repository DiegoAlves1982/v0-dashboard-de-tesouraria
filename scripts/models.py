from pydantic import BaseModel
from datetime import date
from typing import Optional
from enum import Enum


class TipoTransacao(str, Enum):
    RECEITA = "receita"
    DESPESA = "despesa"


class CategoriaReceita(str, Enum):
    LOCACAO = "locacao"
    VENDA = "venda"
    SERVICOS = "servicos"
    OUTROS = "outros"


class CategoriaDespesa(str, Enum):
    FOLHA_PAGAMENTO = "folha_pagamento"
    ALUGUEL = "aluguel"
    IMPOSTOS = "impostos"
    MANUTENCAO = "manutencao"
    COMBUSTIVEL = "combustivel"
    FORNECEDORES = "fornecedores"
    OUTROS = "outros"


class StatusPagamento(str, Enum):
    PAGO = "pago"
    PENDENTE = "pendente"
    ATRASADO = "atrasado"


# Modelos de Entrada
class Transacao(BaseModel):
    id: Optional[str] = None
    data: date
    data_vencimento: date
    valor: float
    tipo: TipoTransacao
    categoria_receita: Optional[CategoriaReceita] = None
    categoria_despesa: Optional[CategoriaDespesa] = None
    descricao: str
    cliente_fornecedor: str
    status: StatusPagamento = StatusPagamento.PENDENTE
    empresa_origem: Optional[str] = None


class Cliente(BaseModel):
    id: str
    nome: str
    total_compras: float = 0
    quantidade_compras: int = 0
    ticket_medio: float = 0


class ItemEstoque(BaseModel):
    id: str
    nome: str
    categoria: str
    quantidade_disponivel: int
    quantidade_locada: int
    quantidade_manutencao: int
    valor_unitario: float


class DadosFinanceiros(BaseModel):
    transacoes: list[Transacao]
    clientes: Optional[list[Cliente]] = None
    estoque: Optional[list[ItemEstoque]] = None
    saldo_inicial: float = 0
    data_inicio: date
    data_fim: date
    empresa: Optional[str] = None


# Modelos de Saída
class KPIResponse(BaseModel):
    receita_total: float
    despesa_total: float
    lucro_liquido: float
    percentual_caixa: float
    saidas: float
    percentual_saidas: float
    media_saidas_mensais: float
    perpetuidade_meses: float
    ticket_medio: float
    ticket_medio_previsto: float
    variacao_ticket: float


class FluxoCaixaDiario(BaseModel):
    data: str
    entradas: float
    saidas: float
    saldo: float
    saldo_acumulado: float


class ReceitaDespesaVencimento(BaseModel):
    mes: str
    receitas: float
    despesas: float


class CategoriaValor(BaseModel):
    categoria: str
    valor: float
    percentual: float


class ClienteRanking(BaseModel):
    nome: str
    total: float
    ticket_medio: float
    quantidade: int


class LucroMargem(BaseModel):
    mes: str
    lucro_bruto: float
    margem: float
    receita: float


class PosicaoEstoque(BaseModel):
    categoria: str
    disponivel: int
    locado: int
    manutencao: int
    valor_total: float


class PrevisibilidadeResponse(BaseModel):
    perpetuidade_caixa: float
    perpetuidade_meses: float
    ponto_equilibrio: float
    ponto_equilibrio_percentual: float
    ebitda: float
    margem_ebitda: float
    media_entradas: float
    media_saidas: float
    tendencia: str


class DashboardCompleto(BaseModel):
    kpis: KPIResponse
    fluxo_caixa_diario: list[FluxoCaixaDiario]
    receitas_despesas_vencimento: list[ReceitaDespesaVencimento]
    despesas_por_categoria: list[CategoriaValor]
    receitas_por_categoria: list[CategoriaValor]
    maiores_clientes: list[ClienteRanking]
    lucro_margem_mensal: list[LucroMargem]
    posicao_estoque: list[PosicaoEstoque]
    previsibilidade: PrevisibilidadeResponse
    total_acumulado: list[dict]
    entradas_empresa: list[CategoriaValor]
