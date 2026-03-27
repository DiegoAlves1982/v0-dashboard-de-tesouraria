"use client"

import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3 } from "lucide-react"

interface PredictabilityData {
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

const data: PredictabilityData = {
  perpetuidadeCaixa: {
    meses: 11.94,
    saldoAtual: 872660,
    mediaGastos: 73058.80,
  },
  pontoEquilibrio: {
    valor: 438350,
    percentualAtingido: 85.2,
    faltante: 64750,
  },
  ebitda: {
    valor: 285000,
    margem: 21.8,
    variacao: 12.5,
  },
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(2)} Mi`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(2)} Mil`
  }
  return `R$ ${value.toFixed(2)}`
}

export function PredictabilityCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Perpetuidade do Caixa */}
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#00d4aa]/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-[#00d4aa]" />
          </div>
          <h3 className="text-white font-semibold">Perpetuidade do Caixa</h3>
        </div>
        <div className="text-4xl font-bold text-[#00d4aa] mb-2">
          {data.perpetuidadeCaixa.meses.toFixed(2)}
          <span className="text-lg ml-1">meses</span>
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Saldo Atual</span>
            <span className="text-white">{formatCurrency(data.perpetuidadeCaixa.saldoAtual)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Média de Gastos</span>
            <span className="text-white">{formatCurrency(data.perpetuidadeCaixa.mediaGastos)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#1e4976]">
          <div className="w-full bg-[#1a3a5c] rounded-full h-2">
            <div
              className="bg-[#00d4aa] h-2 rounded-full"
              style={{ width: `${Math.min((data.perpetuidadeCaixa.meses / 24) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#8ca8c4] mt-1">
            <span>0 meses</span>
            <span>24 meses</span>
          </div>
        </div>
      </div>

      {/* Ponto de Equilíbrio */}
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#3b82f6]/20 rounded-lg">
            <Target className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <h3 className="text-white font-semibold">Ponto de Equilíbrio</h3>
        </div>
        <div className="text-4xl font-bold text-[#3b82f6] mb-2">
          {formatCurrency(data.pontoEquilibrio.valor)}
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Atingido</span>
            <span className="text-[#22c55e]">{data.pontoEquilibrio.percentualAtingido}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Faltante</span>
            <span className="text-[#f59e0b]">{formatCurrency(data.pontoEquilibrio.faltante)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#1e4976]">
          <div className="w-full bg-[#1a3a5c] rounded-full h-2">
            <div
              className="bg-[#3b82f6] h-2 rounded-full"
              style={{ width: `${data.pontoEquilibrio.percentualAtingido}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#8ca8c4] mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* EBITDA */}
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#22c55e]/20 rounded-lg">
            <BarChart3 className="w-5 h-5 text-[#22c55e]" />
          </div>
          <h3 className="text-white font-semibold">EBITDA</h3>
        </div>
        <div className="text-4xl font-bold text-[#22c55e] mb-2">
          {formatCurrency(data.ebitda.valor)}
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Margem EBITDA</span>
            <span className="text-white">{data.ebitda.margem}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Variação</span>
            <span className="text-[#22c55e] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{data.ebitda.variacao}%
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#1e4976]">
          <div className="w-full bg-[#1a3a5c] rounded-full h-2">
            <div
              className="bg-[#22c55e] h-2 rounded-full"
              style={{ width: `${Math.min(data.ebitda.margem * 3, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#8ca8c4] mt-1">
            <span>0%</span>
            <span>33%+ Excelente</span>
          </div>
        </div>
      </div>
    </div>
  )
}
