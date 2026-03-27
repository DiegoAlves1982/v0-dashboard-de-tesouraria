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

const initialData = [
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

const filterOptions = [
  { label: "Janeiro", value: "jan", checked: true },
  { label: "Fevereiro", value: "fev", checked: true },
  { label: "Marco", value: "mar", checked: true },
  { label: "Valores Positivos", value: "positive", checked: true },
  { label: "Valores Negativos", value: "negative", checked: true },
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(
    filterOptions.filter((f) => f.checked).map((f) => f.value)
  )
  const [refreshKey, setRefreshKey] = useState(0)

  const filteredData = useMemo(() => {
    let data = [...initialData]

    // Filtrar por mes
    const monthFilters = activeFilters.filter((f) => ["jan", "fev", "mar"].includes(f))
    if (monthFilters.length > 0) {
      data = data.filter((d) => monthFilters.includes(d.month))
    }

    // Filtrar por tipo de valor
    const showPositive = activeFilters.includes("positive")
    const showNegative = activeFilters.includes("negative")
    if (showPositive && !showNegative) {
      data = data.filter((d) => d.value >= 0)
    } else if (!showPositive && showNegative) {
      data = data.filter((d) => d.value < 0)
    }

    // Ordenar
    if (sortOrder === "asc") {
      data.sort((a, b) => a.value - b.value)
    } else if (sortOrder === "desc") {
      data.sort((a, b) => b.value - a.value)
    }

    return data
  }, [activeFilters, sortOrder, refreshKey])

  const handleSortAsc = () => {
    setSortOrder(sortOrder === "asc" ? null : "asc")
  }

  const handleSortDesc = () => {
    setSortOrder(sortOrder === "desc" ? null : "desc")
  }

  const handleFilter = (filters: string[]) => {
    setActiveFilters(filters)
  }

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    setSortOrder(null)
    setActiveFilters(filterOptions.filter((f) => f.checked).map((f) => f.value))
  }

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={filteredData}
        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" vertical={false} />
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
          {filteredData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value >= 0 ? "#22c55e" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Total Acumulado"
        onSortAsc={handleSortAsc}
        onSortDesc={handleSortDesc}
        onFilter={handleFilter}
        onRefresh={handleRefresh}
        filterOptions={filterOptions.map((f) => ({
          ...f,
          checked: activeFilters.includes(f.value),
        }))}
        data={filteredData}
      >
        {chartContent}
      </ChartToolbar>
      <div className="h-[280px]">{chartContent}</div>
      <div className="flex justify-center gap-2 mt-2 text-[10px] text-[#8ca8c4]">
        <span className={activeFilters.includes("jan") ? "text-white" : ""}>janeiro</span>
        <span className={activeFilters.includes("fev") ? "text-white" : ""}>fevereiro</span>
        <span className={activeFilters.includes("mar") ? "text-white" : ""}>marco</span>
        <span className="ml-4 text-white">2026</span>
      </div>
      <div className="flex justify-between mt-2 px-2 text-xs">
        <span className="text-[#8ca8c4]">
          {filteredData.length} registros
          {sortOrder && ` (ordenado ${sortOrder === "asc" ? "crescente" : "decrescente"})`}
        </span>
        <span className="text-emerald-400">
          Total: R$ {filteredData.reduce((acc, d) => acc + d.value, 0).toLocaleString("pt-BR")}
        </span>
      </div>
    </Card>
  )
}
