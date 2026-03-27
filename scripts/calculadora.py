from datetime import date, timedelta
from collections import defaultdict
from models import (
    DadosFinanceiros, Transacao, TipoTransacao, 
    KPIResponse, FluxoCaixaDiario, ReceitaDespesaVencimento,
    CategoriaValor, ClienteRanking, LucroMargem, PosicaoEstoque,
    PrevisibilidadeResponse, DashboardCompleto
)


class CalculadoraFinanceira:
    def __init__(self, dados: DadosFinanceiros):
        self.dados = dados
        self.transacoes = dados.transacoes
        self.saldo_inicial = dados.saldo_inicial
        self.data_inicio = dados.data_inicio
        self.data_fim = dados.data_fim
        
    def _filtrar_por_tipo(self, tipo: TipoTransacao) -> list[Transacao]:
        return [t for t in self.transacoes if t.tipo == tipo]
    
    def _filtrar_por_periodo(self, transacoes: list[Transacao], inicio: date, fim: date) -> list[Transacao]:
        return [t for t in transacoes if inicio <= t.data_vencimento <= fim]
    
    def calcular_kpis(self) -> KPIResponse:
        receitas = self._filtrar_por_tipo(TipoTransacao.RECEITA)
        despesas = self._filtrar_por_tipo(TipoTransacao.DESPESA)
        
        receita_total = sum(t.valor for t in receitas)
        despesa_total = sum(t.valor for t in despesas)
        lucro_liquido = receita_total - despesa_total
        
        # Calcular percentual de caixa
        percentual_caixa = (lucro_liquido / receita_total * 100) if receita_total > 0 else 0
        
        # Média de saídas mensais
        dias_periodo = (self.data_fim - self.data_inicio).days or 1
        meses_periodo = max(dias_periodo / 30, 1)
        media_saidas_mensais = despesa_total / meses_periodo
        
        # Perpetuidade do caixa
        saldo_atual = self.saldo_inicial + lucro_liquido
        perpetuidade = saldo_atual / media_saidas_mensais if media_saidas_mensais > 0 else 0
        
        # Ticket médio
        qtd_transacoes_receita = len(receitas) or 1
        ticket_medio = receita_total / qtd_transacoes_receita
        
        # Variação do ticket (comparado com período anterior simulado)
        ticket_previsto = ticket_medio * 1.17  # Simulação
        variacao = ((ticket_medio - ticket_previsto) / ticket_previsto * 100) if ticket_previsto > 0 else 0
        
        return KPIResponse(
            receita_total=receita_total,
            despesa_total=despesa_total,
            lucro_liquido=lucro_liquido,
            percentual_caixa=percentual_caixa,
            saidas=despesa_total,
            percentual_saidas=(despesa_total / receita_total * 100) if receita_total > 0 else 0,
            media_saidas_mensais=media_saidas_mensais,
            perpetuidade_meses=perpetuidade,
            ticket_medio=ticket_medio,
            ticket_medio_previsto=ticket_previsto,
            variacao_ticket=variacao
        )
    
    def calcular_fluxo_caixa_diario(self) -> list[FluxoCaixaDiario]:
        fluxo_por_dia = defaultdict(lambda: {"entradas": 0, "saidas": 0})
        
        for t in self.transacoes:
            data_str = t.data.isoformat()
            if t.tipo == TipoTransacao.RECEITA:
                fluxo_por_dia[data_str]["entradas"] += t.valor
            else:
                fluxo_por_dia[data_str]["saidas"] += t.valor
        
        resultado = []
        saldo_acumulado = self.saldo_inicial
        
        data_atual = self.data_inicio
        while data_atual <= self.data_fim:
            data_str = data_atual.isoformat()
            dia = fluxo_por_dia.get(data_str, {"entradas": 0, "saidas": 0})
            saldo = dia["entradas"] - dia["saidas"]
            saldo_acumulado += saldo
            
            resultado.append(FluxoCaixaDiario(
                data=data_str,
                entradas=dia["entradas"],
                saidas=dia["saidas"],
                saldo=saldo,
                saldo_acumulado=saldo_acumulado
            ))
            data_atual += timedelta(days=1)
        
        return resultado
    
    def calcular_receitas_despesas_vencimento(self) -> list[ReceitaDespesaVencimento]:
        por_mes = defaultdict(lambda: {"receitas": 0, "despesas": 0})
        
        for t in self.transacoes:
            mes_ano = t.data_vencimento.strftime("%Y-%m")
            if t.tipo == TipoTransacao.RECEITA:
                por_mes[mes_ano]["receitas"] += t.valor
            else:
                por_mes[mes_ano]["despesas"] += t.valor
        
        resultado = []
        for mes, valores in sorted(por_mes.items()):
            resultado.append(ReceitaDespesaVencimento(
                mes=mes,
                receitas=valores["receitas"],
                despesas=valores["despesas"]
            ))
        
        return resultado
    
    def calcular_despesas_por_categoria(self) -> list[CategoriaValor]:
        despesas = self._filtrar_por_tipo(TipoTransacao.DESPESA)
        por_categoria = defaultdict(float)
        
        for t in despesas:
            categoria = t.categoria_despesa.value if t.categoria_despesa else "outros"
            por_categoria[categoria] += t.valor
        
        total = sum(por_categoria.values()) or 1
        
        return [
            CategoriaValor(
                categoria=self._formatar_categoria(cat),
                valor=valor,
                percentual=(valor / total * 100)
            )
            for cat, valor in sorted(por_categoria.items(), key=lambda x: -x[1])
        ]
    
    def calcular_receitas_por_categoria(self) -> list[CategoriaValor]:
        receitas = self._filtrar_por_tipo(TipoTransacao.RECEITA)
        por_categoria = defaultdict(float)
        
        for t in receitas:
            categoria = t.categoria_receita.value if t.categoria_receita else "outros"
            por_categoria[categoria] += t.valor
        
        total = sum(por_categoria.values()) or 1
        
        return [
            CategoriaValor(
                categoria=self._formatar_categoria(cat),
                valor=valor,
                percentual=(valor / total * 100)
            )
            for cat, valor in sorted(por_categoria.items(), key=lambda x: -x[1])
        ]
    
    def calcular_maiores_clientes(self, limite: int = 10) -> list[ClienteRanking]:
        receitas = self._filtrar_por_tipo(TipoTransacao.RECEITA)
        por_cliente = defaultdict(lambda: {"total": 0, "quantidade": 0})
        
        for t in receitas:
            por_cliente[t.cliente_fornecedor]["total"] += t.valor
            por_cliente[t.cliente_fornecedor]["quantidade"] += 1
        
        resultado = []
        for nome, dados in por_cliente.items():
            resultado.append(ClienteRanking(
                nome=nome,
                total=dados["total"],
                quantidade=dados["quantidade"],
                ticket_medio=dados["total"] / dados["quantidade"] if dados["quantidade"] > 0 else 0
            ))
        
        return sorted(resultado, key=lambda x: -x.total)[:limite]
    
    def calcular_lucro_margem_mensal(self) -> list[LucroMargem]:
        por_mes = defaultdict(lambda: {"receita": 0, "despesa": 0})
        
        for t in self.transacoes:
            mes_ano = t.data.strftime("%Y-%m")
            if t.tipo == TipoTransacao.RECEITA:
                por_mes[mes_ano]["receita"] += t.valor
            else:
                por_mes[mes_ano]["despesa"] += t.valor
        
        resultado = []
        for mes, valores in sorted(por_mes.items()):
            lucro = valores["receita"] - valores["despesa"]
            margem = (lucro / valores["receita"] * 100) if valores["receita"] > 0 else 0
            resultado.append(LucroMargem(
                mes=mes,
                lucro_bruto=lucro,
                margem=margem,
                receita=valores["receita"]
            ))
        
        return resultado
    
    def calcular_posicao_estoque(self) -> list[PosicaoEstoque]:
        if not self.dados.estoque:
            return []
        
        por_categoria = defaultdict(lambda: {
            "disponivel": 0, "locado": 0, "manutencao": 0, "valor": 0
        })
        
        for item in self.dados.estoque:
            por_categoria[item.categoria]["disponivel"] += item.quantidade_disponivel
            por_categoria[item.categoria]["locado"] += item.quantidade_locada
            por_categoria[item.categoria]["manutencao"] += item.quantidade_manutencao
            por_categoria[item.categoria]["valor"] += (
                (item.quantidade_disponivel + item.quantidade_locada + item.quantidade_manutencao) 
                * item.valor_unitario
            )
        
        return [
            PosicaoEstoque(
                categoria=cat,
                disponivel=dados["disponivel"],
                locado=dados["locado"],
                manutencao=dados["manutencao"],
                valor_total=dados["valor"]
            )
            for cat, dados in por_categoria.items()
        ]
    
    def calcular_previsibilidade(self) -> PrevisibilidadeResponse:
        kpis = self.calcular_kpis()
        
        # Perpetuidade do Caixa
        saldo_atual = self.saldo_inicial + kpis.lucro_liquido
        perpetuidade_caixa = saldo_atual
        perpetuidade_meses = kpis.perpetuidade_meses
        
        # Ponto de Equilíbrio
        custos_fixos = kpis.despesa_total * 0.6  # Estimativa 60% fixos
        margem_contribuicao = 0.35  # 35% margem
        ponto_equilibrio = custos_fixos / margem_contribuicao if margem_contribuicao > 0 else 0
        pe_percentual = (kpis.receita_total / ponto_equilibrio * 100) if ponto_equilibrio > 0 else 0
        
        # EBITDA
        depreciacao_amortizacao = kpis.despesa_total * 0.1  # Estimativa 10%
        ebitda = kpis.lucro_liquido + depreciacao_amortizacao
        margem_ebitda = (ebitda / kpis.receita_total * 100) if kpis.receita_total > 0 else 0
        
        # Médias
        dias_periodo = (self.data_fim - self.data_inicio).days or 1
        receitas = self._filtrar_por_tipo(TipoTransacao.RECEITA)
        despesas = self._filtrar_por_tipo(TipoTransacao.DESPESA)
        
        media_entradas = sum(t.valor for t in receitas) / dias_periodo
        media_saidas = sum(t.valor for t in despesas) / dias_periodo
        
        # Tendência
        tendencia = "alta" if media_entradas > media_saidas else "baixa"
        
        return PrevisibilidadeResponse(
            perpetuidade_caixa=perpetuidade_caixa,
            perpetuidade_meses=perpetuidade_meses,
            ponto_equilibrio=ponto_equilibrio,
            ponto_equilibrio_percentual=pe_percentual,
            ebitda=ebitda,
            margem_ebitda=margem_ebitda,
            media_entradas=media_entradas,
            media_saidas=media_saidas,
            tendencia=tendencia
        )
    
    def calcular_total_acumulado(self) -> list[dict]:
        fluxo = self.calcular_fluxo_caixa_diario()
        return [
            {
                "data": f.data,
                "valor": f.saldo,
                "acumulado": f.saldo_acumulado
            }
            for f in fluxo
        ]
    
    def calcular_entradas_empresa(self) -> list[CategoriaValor]:
        receitas = self._filtrar_por_tipo(TipoTransacao.RECEITA)
        por_empresa = defaultdict(float)
        
        for t in receitas:
            empresa = t.empresa_origem or "Principal"
            por_empresa[empresa] += t.valor
        
        total = sum(por_empresa.values()) or 1
        
        return [
            CategoriaValor(
                categoria=empresa,
                valor=valor,
                percentual=(valor / total * 100)
            )
            for empresa, valor in sorted(por_empresa.items(), key=lambda x: -x[1])
        ]
    
    def calcular_dashboard_completo(self) -> DashboardCompleto:
        return DashboardCompleto(
            kpis=self.calcular_kpis(),
            fluxo_caixa_diario=self.calcular_fluxo_caixa_diario(),
            receitas_despesas_vencimento=self.calcular_receitas_despesas_vencimento(),
            despesas_por_categoria=self.calcular_despesas_por_categoria(),
            receitas_por_categoria=self.calcular_receitas_por_categoria(),
            maiores_clientes=self.calcular_maiores_clientes(),
            lucro_margem_mensal=self.calcular_lucro_margem_mensal(),
            posicao_estoque=self.calcular_posicao_estoque(),
            previsibilidade=self.calcular_previsibilidade(),
            total_acumulado=self.calcular_total_acumulado(),
            entradas_empresa=self.calcular_entradas_empresa()
        )
    
    @staticmethod
    def _formatar_categoria(categoria: str) -> str:
        formatacao = {
            "folha_pagamento": "Folha de Pagamento",
            "aluguel": "Aluguel",
            "impostos": "Impostos",
            "manutencao": "Manutenção",
            "combustivel": "Combustível",
            "fornecedores": "Fornecedores",
            "locacao": "Locação",
            "venda": "Venda",
            "servicos": "Serviços",
            "outros": "Outros"
        }
        return formatacao.get(categoria, categoria.title())
