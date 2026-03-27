"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

const generateDailyData = () => {
  const data = []
  let saldo = 150000
  for (let i = 1; i <= 30; i++) {
    const entrada = Math.random() * 50000 + 10000
    const saida = Math.random() * 40000 + 15000
    saldo = saldo + entrada - saida
    data.push({
      dia: i.toString().padStart(2, "0"),
      saldo: Math.round(saldo),
      entrada: Math.round(entrada),
      saida: Math.round(saida),
    })
  }
  return data
}

const data = generateDailyData()

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)} Mi`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)} Mil`
  }
  return `R$ ${value}`
}

export function DailyCashflowChart() {
  const minSaldo = Math.min(...data.map((d) => d.saldo))
  const maxSaldo = Math.max(...data.map((d) => d.saldo))

  return (
    <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Fluxo de Caixa Diário</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
          <XAxis dataKey="dia" stroke="#8ca8c4" fontSize={10} />
          <YAxis
            stroke="#8ca8c4"
            fontSize={10}
            tickFormatter={formatCurrency}
            domain={[minSaldo * 0.9, maxSaldo * 1.1]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d1e36",
              border: "1px solid #1e4976",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#ffffff" }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                saldo: "Saldo",
                entrada: "Entradas",
                saida: "Saídas",
              }
              return [formatCurrency(value), labels[name] || name]
            }}
            labelFormatter={(label) => `Dia ${label}`}
          />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="saldo"
            stroke="#00d4aa"
            fillOpacity={1}
            fill="url(#colorSaldo)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
