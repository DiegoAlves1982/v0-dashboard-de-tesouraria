"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card } from "@/components/ui/card"
import { Filter, Maximize2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

const entriesData = [
  { name: "PR TRUCKS", value: 892690, percentage: 68.09, color: "#22c55e" },
  { name: "SIDER TRUCKS", value: 318980, percentage: 24.33, color: "#1a5c3a" },
  { name: "PR TRUCKS SERVIÇOS", value: 99340, percentage: 7.58, color: "#0d3320" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1">{data.name}</p>
        <p className="text-emerald-400 font-medium">
          R$ {(data.value / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} Mil
        </p>
        <p className="text-[#8ca8c4] text-sm">({data.percentage}%)</p>
      </div>
    )
  }
  return null
}

export function EntriesDonutChart() {
  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Entradas</h3>
        <div className="flex items-center gap-1">
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
      <div className="h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={entriesData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {entriesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">66,56%</p>
            <p className="text-xs text-[#8ca8c4]">% Margem</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        {entriesData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#8ca8c4]">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="text-white font-medium">
                R$ {(item.value / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} Mil
              </span>
              <span className="text-[#8ca8c4] ml-2">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
