"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const data = [
  { mes: "Out/25", receitas: 285000, despesas: 142000 },
  { mes: "Nov/25", receitas: 320000, despesas: 178000 },
  { mes: "Dez/25", receitas: 410000, despesas: 195000 },
  { mes: "Jan/26", receitas: 380000, despesas: 210000 },
  { mes: "Fev/26", receitas: 450000, despesas: 185000 },
  { mes: "Mar/26", receitas: 395000, despesas: 168000 },
]

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)} Mi`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)} Mil`
  }
  return `R$ ${value}`
}

export function RevenueExpensesChart() {
  return (
    <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">
        Receitas e Despesas por Vencimento
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
          <XAxis dataKey="mes" stroke="#8ca8c4" fontSize={12} />
          <YAxis stroke="#8ca8c4" fontSize={12} tickFormatter={formatCurrency} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d1e36",
              border: "1px solid #1e4976",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#ffffff" }}
            formatter={(value: number) => [formatCurrency(value), ""]}
          />
          <Legend
            wrapperStyle={{ color: "#8ca8c4" }}
            formatter={(value) => (
              <span style={{ color: "#8ca8c4" }}>{value}</span>
            )}
          />
          <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
