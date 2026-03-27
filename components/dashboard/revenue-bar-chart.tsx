"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card } from "@/components/ui/card"

const revenueData = [
  { month: "novembro", year: "2025", value: 1500 },
  { month: "dezembro", year: "2025", value: 207469.65 },
  { month: "janeiro", year: "2026", value: 431354.96 },
  { month: "fevereiro", year: "2026", value: 530565.87 },
  { month: "março", year: "2026", value: 140118.97 },
]

const formatXAxis = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)} Mi`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}.000`
  }
  return `R$ ${value}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1 capitalize">{label}</p>
        <p className="text-emerald-400 font-medium">
          R$ {payload[0].value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    )
  }
  return null
}

export function RevenueBarChart() {
  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <h3 className="text-white font-semibold mb-4 text-center">
        Receita Total (Período)
      </h3>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-[#8ca8c4]">Receita Total</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#3b82f6] rounded-sm" />
          <span className="text-xs text-white">R$ 0,00 Mi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#1e4976] rounded-sm" />
          <span className="text-xs text-white">R$ 0,53 Mi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#0d1e36] rounded-sm border border-[#1e4976]" />
          <span className="text-xs text-white">R$ 0,27 Mi</span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={revenueData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e4976"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="#8ca8c4"
              tick={{ fill: "#8ca8c4", fontSize: 10 }}
              tickFormatter={formatXAxis}
              axisLine={{ stroke: "#1e4976" }}
            />
            <YAxis
              type="category"
              dataKey="month"
              stroke="#8ca8c4"
              tick={{ fill: "#8ca8c4", fontSize: 11 }}
              axisLine={{ stroke: "#1e4976" }}
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {revenueData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.year === "2025" ? "#1a5c3a" : "#22c55e"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
