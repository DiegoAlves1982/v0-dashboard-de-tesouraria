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
  ReferenceLine,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Filter, Maximize2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

const accumulatedData = [
  { date: "30", month: "jan", value: -5000 },
  { date: "31", month: "jan", value: 12000 },
  { date: "1", month: "fev", value: 18000 },
  { date: "2", month: "fev", value: 15000 },
  { date: "3", month: "fev", value: 20000 },
  { date: "4", month: "fev", value: 22000 },
  { date: "5", month: "fev", value: 8000 },
  { date: "6", month: "fev", value: 25000 },
  { date: "7", month: "fev", value: 12000 },
  { date: "8", month: "fev", value: -28000 },
  { date: "9", month: "fev", value: 15000 },
  { date: "10", month: "fev", value: -8000 },
  { date: "11", month: "fev", value: 30000 },
  { date: "12", month: "fev", value: 35000 },
  { date: "13", month: "fev", value: 18000 },
  { date: "14", month: "fev", value: 28000 },
  { date: "15", month: "fev", value: 22000 },
  { date: "16", month: "fev", value: 32000 },
  { date: "17", month: "fev", value: 25000 },
  { date: "18", month: "fev", value: 15000 },
  { date: "19", month: "fev", value: 20000 },
  { date: "20", month: "fev", value: 28000 },
  { date: "21", month: "fev", value: 12000 },
  { date: "22", month: "fev", value: 8000 },
  { date: "23", month: "fev", value: 5000 },
  { date: "24", month: "fev", value: 18000 },
  { date: "25", month: "fev", value: 22000 },
  { date: "26", month: "fev", value: 15000 },
  { date: "27", month: "fev", value: 10000 },
  { date: "28", month: "fev", value: 8000 },
  { date: "1", month: "mar", value: 12000 },
  { date: "2", month: "mar", value: 18000 },
  { date: "3", month: "mar", value: 15000 },
  { date: "4", month: "mar", value: 20000 },
  { date: "5", month: "mar", value: 10000 },
]

const formatYAxis = (value: number) => {
  if (value >= 1000 || value <= -1000) {
    return `R$ ${(value / 1000).toFixed(0)} Mil`
  }
  return `R$ ${value}`
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1">
          {data.date} {data.month}
        </p>
        <p
          className={`font-medium ${
            data.value >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          R$ {Math.abs(data.value).toLocaleString("pt-BR")}
        </p>
      </div>
    )
  }
  return null
}

export function AccumulatedChart() {
  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Total Acumulado</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={accumulatedData}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e4976"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#8ca8c4"
              tick={{ fill: "#8ca8c4", fontSize: 9 }}
              axisLine={{ stroke: "#1e4976" }}
              interval={0}
            />
            <YAxis
              stroke="#8ca8c4"
              tick={{ fill: "#8ca8c4", fontSize: 10 }}
              tickFormatter={formatYAxis}
              axisLine={{ stroke: "#1e4976" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#1e4976" strokeWidth={1} />
            <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={12}>
              {accumulatedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? "#22c55e" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-2 mt-2 text-[10px] text-[#8ca8c4]">
        <span>janeiro</span>
        <span className="text-white">fevereiro</span>
        <span>março</span>
        <span className="ml-4 text-white">2026</span>
      </div>
    </Card>
  )
}
