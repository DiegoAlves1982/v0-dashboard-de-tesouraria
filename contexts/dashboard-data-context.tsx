"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Tipos para os dados do dashboard
export interface Transacao {
  data: string
  tipo: "receita" | "despesa"
  categoria: string
  valor: number
  descricao: string
  clienteFornecedor: string
  vencimento: string
  empresa?: string
}

export interface DadosDashboard {
  transacoes: Transacao[]
  kpis: {
    receitaTotal: number
    despesaTotal: number
    lucroLiquido: number
    percentualCaixa: number
    ticketMedio: number
    mediaSaidasMensais: number
    perpetuidadeMeses: number
  }
  receitasPorVencimento: Record<string, number>
  despesasPorVencimento: Record<string, number>
  receitaPorCategoria: Record<string, number>
  despesaPorCategoria: Record<string, number>
  fluxoCaixaDiario: Array<{
    dia: string
    entrada: number
    saida: number
    saldo: number
  }>
  maioresClientes: Array<{
    cliente: string
    total: number
    transacoes: number
    ticketMedio: number
  }>
  lucroPorMes: Record<string, {
    receitas: number
    despesas: number
    lucro: number
    margem: number
  }>
  receitaPorPeriodo: Array<{
    mes: string
    ano: number
    valor: number
  }>
  entradasPorEmpresa: Array<{
    empresa: string
    valor: number
    percentual: number
  }>
  tabelaVencimentos: Array<{
    vencimento: string
    dataVencimento: string
    receitaTotal: number
    clienteFornecedor: string
  }>
  previsibilidade: {
    perpetuidadeCaixa: {
      meses: number
      saldoAtual: number
      mediaGastos: number
    }
    pontoEquilibrio: {
      valor: number
      percentualAtingido: number
      faltante: number
    }
    ebitda: {
      valor: number
      margem: number
      variacao: number
    }
  }
  dataProcessamento: string
  periodo: {
    inicio: string
    fim: string
  }
}

// Dados de demonstração
export const dadosDemostracao: DadosDashboard = {
  transacoes: [],
  kpis: {
    receitaTotal: 2847500,
    despesaTotal: 1923400,
    lucroLiquido: 924100,
    percentualCaixa: 32.5,
    ticketMedio: 47458.33,
    mediaSaidasMensais: 640000,
    perpetuidadeMeses: 12.8
  },
  receitasPorVencimento: {
    "2024-01-15": 450000,
    "2024-01-20": 320000,
    "2024-01-25": 280000,
    "2024-02-01": 520000,
    "2024-02-10": 380000,
  },
  despesasPorVencimento: {
    "2024-01-15": 180000,
    "2024-01-20": 95000,
    "2024-01-28": 220000,
    "2024-02-05": 150000,
  },
  receitaPorCategoria: {
    "Locacao de Maquinas": 1250000,
    "Servicos de Manutencao": 680000,
    "Venda de Equipamentos": 520000,
    "Consultoria Tecnica": 240000,
    "Outros": 157500,
  },
  despesaPorCategoria: {
    "Folha de Pagamento": 720000,
    "Combustivel": 280000,
    "Manutencao Frota": 195000,
    "Impostos": 340000,
    "Fornecedores": 220000,
    "Aluguel": 85000,
    "Outros": 83400,
  },
  fluxoCaixaDiario: [
    { dia: "2024-01-01", entrada: 125000, saida: 45000, saldo: 580000 },
    { dia: "2024-01-02", entrada: 0, saida: 82000, saldo: 498000 },
    { dia: "2024-01-03", entrada: 235000, saida: 15000, saldo: 718000 },
    { dia: "2024-01-04", entrada: 45000, saida: 125000, saldo: 638000 },
    { dia: "2024-01-05", entrada: 180000, saida: 65000, saldo: 753000 },
    { dia: "2024-01-08", entrada: 320000, saida: 180000, saldo: 893000 },
    { dia: "2024-01-09", entrada: 0, saida: 240000, saldo: 653000 },
    { dia: "2024-01-10", entrada: 450000, saida: 95000, saldo: 1008000 },
    { dia: "2024-01-11", entrada: 125000, saida: 35000, saldo: 1098000 },
    { dia: "2024-01-12", entrada: 85000, saida: 185000, saldo: 998000 },
    { dia: "2024-01-15", entrada: 520000, saida: 280000, saldo: 1238000 },
    { dia: "2024-01-16", entrada: 180000, saida: 45000, saldo: 1373000 },
    { dia: "2024-01-17", entrada: 0, saida: 95000, saldo: 1278000 },
    { dia: "2024-01-18", entrada: 280000, saida: 120000, saldo: 1438000 },
    { dia: "2024-01-19", entrada: 95000, saida: 25000, saldo: 1508000 },
  ],
  maioresClientes: [
    { cliente: "Construtora ABC Ltda", total: 520000, transacoes: 8, ticketMedio: 65000 },
    { cliente: "Mineradora Norte S.A.", total: 380000, transacoes: 5, ticketMedio: 76000 },
    { cliente: "Agropecuaria Sul", total: 295000, transacoes: 12, ticketMedio: 24583 },
    { cliente: "Transportadora Express", total: 245000, transacoes: 6, ticketMedio: 40833 },
    { cliente: "Industria Metal Forte", total: 218000, transacoes: 4, ticketMedio: 54500 },
    { cliente: "Prefeitura Municipal", total: 195000, transacoes: 3, ticketMedio: 65000 },
    { cliente: "Cooperativa Agricola", total: 175000, transacoes: 7, ticketMedio: 25000 },
    { cliente: "Engenharia Costa", total: 152000, transacoes: 5, ticketMedio: 30400 },
    { cliente: "Logistica Rapida", total: 138000, transacoes: 4, ticketMedio: 34500 },
    { cliente: "Comercial Oliveira", total: 125000, transacoes: 6, ticketMedio: 20833 },
  ],
  lucroPorMes: {
    "2024-01": { receitas: 980000, despesas: 650000, lucro: 330000, margem: 33.7 },
    "2024-02": { receitas: 1120000, despesas: 720000, lucro: 400000, margem: 35.7 },
    "2024-03": { receitas: 747500, despesas: 553400, lucro: 194100, margem: 26.0 },
  },
  receitaPorPeriodo: [
    { mes: "jan", ano: 2024, valor: 980000 },
    { mes: "fev", ano: 2024, valor: 1120000 },
    { mes: "mar", ano: 2024, valor: 747500 },
  ],
  entradasPorEmpresa: [
    { empresa: "Matriz", valor: 1850000, percentual: 65 },
    { empresa: "Filial Norte", valor: 620000, percentual: 22 },
    { empresa: "Filial Sul", valor: 377500, percentual: 13 },
  ],
  tabelaVencimentos: [
    { vencimento: "15/01/2024", dataVencimento: "2024-01-15", receitaTotal: 450000, clienteFornecedor: "Construtora ABC, Mineradora Norte" },
    { vencimento: "20/01/2024", dataVencimento: "2024-01-20", receitaTotal: 320000, clienteFornecedor: "Agropecuaria Sul, Transportadora" },
    { vencimento: "25/01/2024", dataVencimento: "2024-01-25", receitaTotal: 280000, clienteFornecedor: "Industria Metal Forte" },
    { vencimento: "01/02/2024", dataVencimento: "2024-02-01", receitaTotal: 520000, clienteFornecedor: "Prefeitura, Cooperativa Agricola" },
    { vencimento: "10/02/2024", dataVencimento: "2024-02-10", receitaTotal: 380000, clienteFornecedor: "Engenharia Costa, Logistica" },
  ],
  previsibilidade: {
    perpetuidadeCaixa: {
      meses: 12.8,
      saldoAtual: 8192000,
      mediaGastos: 640000
    },
    pontoEquilibrio: {
      valor: 1850000,
      percentualAtingido: 92,
      faltante: 148000
    },
    ebitda: {
      valor: 924100,
      margem: 32.5,
      variacao: 12.5
    }
  },
  dataProcessamento: new Date().toISOString(),
  periodo: {
    inicio: "2024-01-01",
    fim: "2024-03-31"
  }
}

interface DashboardDataContextType {
  dados: DadosDashboard
  setDados: (dados: DadosDashboard) => void
  isLoaded: boolean
  isDemoData: boolean
  ultimaAtualizacao: string | null
  limparDados: () => void
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined)

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [dados, setDadosState] = useState<DadosDashboard>(dadosDemostracao)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDemoData, setIsDemoData] = useState(true)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null)

  // Carrega dados do localStorage na inicialização
  useEffect(() => {
    try {
      const savedDados = localStorage.getItem("dashboard_dados")
      const savedAtualizacao = localStorage.getItem("dashboard_ultima_atualizacao")
      
      if (savedDados) {
        const parsed = JSON.parse(savedDados)
        setDadosState(parsed)
        setIsDemoData(false)
        setUltimaAtualizacao(savedAtualizacao)
      }
    } catch (error) {
      console.error("Erro ao carregar dados salvos:", error)
    }
    setIsLoaded(true)
  }, [])

  const setDados = (newDados: DadosDashboard) => {
    setDadosState(newDados)
    setIsDemoData(false)
    setUltimaAtualizacao(new Date().toISOString())
    
    // Persiste no localStorage
    try {
      localStorage.setItem("dashboard_dados", JSON.stringify(newDados))
      localStorage.setItem("dashboard_ultima_atualizacao", new Date().toISOString())
    } catch (error) {
      console.error("Erro ao salvar dados:", error)
    }
  }

  const limparDados = () => {
    setDadosState(dadosDemostracao)
    setIsDemoData(true)
    setUltimaAtualizacao(null)
    
    try {
      localStorage.removeItem("dashboard_dados")
      localStorage.removeItem("dashboard_ultima_atualizacao")
    } catch (error) {
      console.error("Erro ao limpar dados:", error)
    }
  }

  return (
    <DashboardDataContext.Provider value={{
      dados,
      setDados,
      isLoaded,
      isDemoData,
      ultimaAtualizacao,
      limparDados
    }}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext)
  if (context === undefined) {
    throw new Error("useDashboardData deve ser usado dentro de um DashboardDataProvider")
  }
  return context
}
