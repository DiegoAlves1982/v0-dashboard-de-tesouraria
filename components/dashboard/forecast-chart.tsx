"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card } from "@/components/ui/card"

const forecastData = [
  { date: "01 dez", valor: 25000, previsto: 15000 },
  { date: "08 dez", valor: 35000, previsto: 15000 },
  { date: "15 dez", valor: 22000, previsto: 15000 },
  { date: "22 dez", valor: 45000, previsto: 15000 },
  { date: "29 dez", valor: 28000, previsto: 15000 },
  { date: "05 jan", valor: 52000, previsto: 15000 },
  { date: "12 jan", valor: 18000, previsto: 15000 },
  { date: "19 jan", valor: 38000, previsto: 15000 },
  { date: "26 jan", valor: 25000, previsto: 15000 },
  { date: "02 fev", valor: 48000, previsto: 15000 },
  { date: "09 fev", valor: 32000, previsto: 15000 },
  { date: "16 fev", valor: 55000, previsto: 15000 },
  { date: "23 fev", valor: 42000, previsto: 15000 },
  { date: "02 mar", valor: 38000, previsto: 15000 },
  { date: "09 mar", valor: 50000, previsto: 15000 },
]

const formatYAxis = (value: number) => {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)} Mil`
  }
  return `R$ ${value}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: item.color }}>
            {item.name}: R$ {item.value.toLocaleString("pt-BR")}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function ForecastChart() {
  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <h3 className="text-white font-semibold mb-4 text-center">
        Previsão (4 Meses)
      </h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={forecastData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e4976"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#8ca8c4"
              tick={{ fill: "#8ca8c4", fontSize: 11 }}
              axisLine={{ stroke: "#1e4976" }}
            />
            <YAxis
              stroke="#8ca8c4"
              tick={{ fill: "#8ca8c4", fontSize: 11 }}
              tickFormatter={formatYAxis}
              axisLine={{ stroke: "#1e4976" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={20000}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#ffffff"
              strokeWidth={2}
              dot={{ fill: "#ffffff", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#00d4aa" }}
              name="Valor Real"
            />
            <Line
              type="monotone"
              dataKey="previsto"
              stroke="#00d4aa"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Valor Previsto"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-white" />
          <span className="text-xs text-[#8ca8c4]">Valor Real</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-[#00d4aa] border-dashed" />
          <span className="text-xs text-[#8ca8c4]">Valor Previsto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500 border-dashed" />
          <span className="text-xs text-[#8ca8c4]">Limite</span>
        </div>
      </div>
    </Card>
  )
}
