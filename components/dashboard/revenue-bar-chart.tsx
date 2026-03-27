"use client"

import { useState, useMemo } from "react"
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
import { ChartToolbar } from "./chart-toolbar"
import { Button } from "@/components/ui/button"

const initialData = [
  { month: "novembro", year: "2025", value: 1500, meta: 50000 },
  { month: "dezembro", year: "2025", value: 207469.65, meta: 200000 },
  { month: "janeiro", year: "2026", value: 431354.96, meta: 400000 },
  { month: "fevereiro", year: "2026", value: 530565.87, meta: 500000 },
  { month: "marco", year: "2026", value: 140118.97, meta: 300000 },
]

const filterOptions = [
  { label: "2025", value: "2025", checked: true },
  { label: "2026", value: "2026", checked: true },
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
    const data = payload[0].payload
    const percentMeta = ((data.value / data.meta) * 100).toFixed(1)
    return (
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1 capitalize">{label} {data.year}</p>
        <p className="text-emerald-400 font-medium">
          R$ {data.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-[#8ca8c4] text-sm">
          Meta: R$ {data.meta.toLocaleString("pt-BR")}
        </p>
        <p className={`text-sm ${Number(percentMeta) >= 100 ? "text-emerald-400" : "text-amber-400"}`}>
          {percentMeta}% da meta
        </p>
      </div>
    )
  }
  return null
}

export function RevenueBarChart() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(["2025", "2026"])
  const [showMeta, setShowMeta] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const filteredData = useMemo(() => {
    let data = initialData.filter((d) => activeFilters.includes(d.year))

    if (sortOrder === "asc") {
      data = [...data].sort((a, b) => a.value - b.value)
    } else if (sortOrder === "desc") {
      data = [...data].sort((a, b) => b.value - a.value)
    }

    return data
  }, [activeFilters, sortOrder])

  const stats = useMemo(() => ({
    total: filteredData.reduce((acc, d) => acc + d.value, 0),
    media: filteredData.length > 0
      ? filteredData.reduce((acc, d) => acc + d.value, 0) / filteredData.length
      : 0,
    max: Math.max(...filteredData.map((d) => d.value)),
    min: Math.min(...filteredData.map((d) => d.value)),
  }), [filteredData])

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Receita Total (Periodo)"
        showSortButtons={true}
        onSortAsc={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
        onSortDesc={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
        onFilter={(filters) => setActiveFilters(filters)}
        onRefresh={() => {
          setSortOrder(null)
          setActiveFilters(["2025", "2026"])
          setShowMeta(false)
          setSelectedMonth(null)
        }}
        filterOptions={filterOptions.map((f) => ({
          ...f,
          checked: activeFilters.includes(f.value),
        }))}
        data={filteredData}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          size="sm"
          variant={showMeta ? "default" : "outline"}
          className={`text-xs h-7 ${showMeta ? "bg-amber-500 text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
          onClick={() => setShowMeta(!showMeta)}
        >
          Mostrar Meta
        </Button>

        <div className="flex items-center gap-2 ml-auto text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#1a5c3a] rounded-sm" />
            <span className="text-[#8ca8c4]">2025</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-[#22c55e] rounded-sm" />
            <span className="text-[#8ca8c4]">2026</span>
          </div>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" horizontal={false} />
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
            {showMeta && (
              <ReferenceLine
                x={stats.media}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: "Media", fill: "#f59e0b", fontSize: 10 }}
              />
            )}
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
              onClick={(data) => setSelectedMonth(data.month === selectedMonth ? null : data.month)}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    selectedMonth === null || selectedMonth === entry.month
                      ? entry.year === "2025" ? "#1a5c3a" : "#22c55e"
                      : "#1e4976"
                  }
                  style={{ cursor: "pointer" }}
                />
              ))}
            </Bar>
            {showMeta && (
              <Bar
                dataKey="meta"
                radius={[0, 4, 4, 0]}
                maxBarSize={30}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#1e4976] text-center">
        <div>
          <p className="text-xs text-[#8ca8c4]">Total</p>
          <p className="text-sm text-emerald-400 font-bold">
            R$ {(stats.total / 1000000).toFixed(2)} Mi
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Media</p>
          <p className="text-sm text-white font-medium">
            R$ {(stats.media / 1000).toFixed(0)} Mil
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Maximo</p>
          <p className="text-sm text-emerald-400 font-medium">
            R$ {(stats.max / 1000).toFixed(0)} Mil
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Minimo</p>
          <p className="text-sm text-red-400 font-medium">
            R$ {(stats.min / 1000).toFixed(0)} Mil
          </p>
        </div>
      </div>
    </Card>
  )
}
