"use client"

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const data = [
  { mes: "Out/25", lucro: 143000, margem: 50.2 },
  { mes: "Nov/25", lucro: 142000, margem: 44.4 },
  { mes: "Dez/25", lucro: 215000, margem: 52.4 },
  { mes: "Jan/26", lucro: 170000, margem: 44.7 },
  { mes: "Fev/26", lucro: 265000, margem: 58.9 },
  { mes: "Mar/26", lucro: 227000, margem: 57.5 },
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

export function GrossProfitChart() {
  return (
    <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">
        Lucro Bruto e Margem por Mês
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
          <XAxis dataKey="mes" stroke="#8ca8c4" fontSize={12} />
          <YAxis
            yAxisId="left"
            stroke="#8ca8c4"
            fontSize={12}
            tickFormatter={formatCurrency}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#8ca8c4"
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d1e36",
              border: "1px solid #1e4976",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#ffffff" }}
            formatter={(value: number, name: string) => {
              if (name === "lucro") return [formatCurrency(value), "Lucro Bruto"]
              if (name === "margem") return [`${value}%`, "Margem"]
              return [value, name]
            }}
          />
          <Legend
            wrapperStyle={{ color: "#8ca8c4" }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                lucro: "Lucro Bruto",
                margem: "Margem %",
              }
              return <span style={{ color: "#8ca8c4" }}>{labels[value] || value}</span>
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="lucro"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="margem"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
