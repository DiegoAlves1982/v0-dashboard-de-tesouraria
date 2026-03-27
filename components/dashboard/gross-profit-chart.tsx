"use client"

import { useState, useMemo } from "react"
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
  ReferenceLine,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ChartToolbar } from "./chart-toolbar"
import { Button } from "@/components/ui/button"

const initialData = [
  { mes: "Out/25", lucro: 143000, margem: 50.2, receita: 285000, despesa: 142000 },
  { mes: "Nov/25", lucro: 142000, margem: 44.4, receita: 320000, despesa: 178000 },
  { mes: "Dez/25", lucro: 215000, margem: 52.4, receita: 410000, despesa: 195000 },
  { mes: "Jan/26", lucro: 170000, margem: 44.7, receita: 380000, despesa: 210000 },
  { mes: "Fev/26", lucro: 265000, margem: 58.9, receita: 450000, despesa: 185000 },
  { mes: "Mar/26", lucro: 227000, margem: 57.5, receita: 395000, despesa: 168000 },
]

const filterOptions = [
  { label: "Out/25", value: "Out/25", checked: true },
  { label: "Nov/25", value: "Nov/25", checked: true },
  { label: "Dez/25", value: "Dez/25", checked: true },
  { label: "Jan/26", value: "Jan/26", checked: true },
  { label: "Fev/26", value: "Fev/26", checked: true },
  { label: "Mar/26", value: "Mar/26", checked: true },
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

type ViewMode = "combined" | "lucro" | "margem"

export function GrossProfitChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("combined")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [sortField, setSortField] = useState<"lucro" | "margem">("lucro")
  const [activeFilters, setActiveFilters] = useState<string[]>(
    filterOptions.map((f) => f.value)
  )
  const [showReceitaDespesa, setShowReceitaDespesa] = useState(false)
  const [metaMargem, setMetaMargem] = useState(50)

  const filteredData = useMemo(() => {
    let data = initialData.filter((d) => activeFilters.includes(d.mes))

    if (sortOrder) {
      data = [...data].sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      })
    }

    return data
  }, [activeFilters, sortOrder, sortField])

  const stats = useMemo(() => ({
    totalLucro: filteredData.reduce((acc, d) => acc + d.lucro, 0),
    mediaLucro: filteredData.length > 0
      ? filteredData.reduce((acc, d) => acc + d.lucro, 0) / filteredData.length
      : 0,
    mediaMargem: filteredData.length > 0
      ? filteredData.reduce((acc, d) => acc + d.margem, 0) / filteredData.length
      : 0,
    maxMargem: Math.max(...filteredData.map((d) => d.margem)),
    minMargem: Math.min(...filteredData.map((d) => d.margem)),
    acimaMeta: filteredData.filter((d) => d.margem >= metaMargem).length,
  }), [filteredData, metaMargem])

  const handleSort = (field: "lucro" | "margem") => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc")
      } else if (sortOrder === "desc") {
        setSortOrder(null)
      } else {
        setSortOrder("asc")
      }
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-400">Lucro: {formatCurrency(data.lucro)}</p>
            <p className="text-amber-400">Margem: {data.margem}%</p>
            {showReceitaDespesa && (
              <>
                <p className="text-blue-400">Receita: {formatCurrency(data.receita)}</p>
                <p className="text-red-400">Despesa: {formatCurrency(data.despesa)}</p>
              </>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Lucro Bruto e Margem por Mes"
        showSortButtons={false}
        onFilter={(filters) => setActiveFilters(filters)}
        onRefresh={() => {
          setSortOrder(null)
          setSortField("lucro")
          setActiveFilters(filterOptions.map((f) => f.value))
          setViewMode("combined")
          setShowReceitaDespesa(false)
          setMetaMargem(50)
        }}
        filterOptions={filterOptions.map((f) => ({
          ...f,
          checked: activeFilters.includes(f.value),
        }))}
        data={filteredData}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={viewMode === "combined" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "combined" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("combined")}
          >
            Combinado
          </Button>
          <Button
            size="sm"
            variant={viewMode === "lucro" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "lucro" ? "bg-emerald-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("lucro")}
          >
            So Lucro
          </Button>
          <Button
            size="sm"
            variant={viewMode === "margem" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "margem" ? "bg-amber-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("margem")}
          >
            So Margem
          </Button>
        </div>

        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            variant={sortField === "lucro" && sortOrder ? "default" : "outline"}
            className={`text-xs h-7 ${sortField === "lucro" && sortOrder ? "bg-emerald-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => handleSort("lucro")}
          >
            Lucro {sortField === "lucro" && sortOrder && (sortOrder === "desc" ? "↓" : "↑")}
          </Button>
          <Button
            size="sm"
            variant={sortField === "margem" && sortOrder ? "default" : "outline"}
            className={`text-xs h-7 ${sortField === "margem" && sortOrder ? "bg-amber-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => handleSort("margem")}
          >
            Margem {sortField === "margem" && sortOrder && (sortOrder === "desc" ? "↓" : "↑")}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={showReceitaDespesa ? "default" : "outline"}
          className={`text-xs h-7 ${showReceitaDespesa ? "bg-blue-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
          onClick={() => setShowReceitaDespesa(!showReceitaDespesa)}
        >
          Receita/Despesa
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#8ca8c4]">Meta Margem:</span>
          {[40, 50, 60].map((m) => (
            <Button
              key={m}
              size="sm"
              variant={metaMargem === m ? "default" : "outline"}
              className={`text-xs h-6 w-10 ${metaMargem === m ? "bg-amber-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
              onClick={() => setMetaMargem(m)}
            >
              {m}%
            </Button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
          <XAxis dataKey="mes" stroke="#8ca8c4" fontSize={12} />
          {(viewMode === "combined" || viewMode === "lucro") && (
            <YAxis
              yAxisId="left"
              stroke="#22c55e"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
          )}
          {(viewMode === "combined" || viewMode === "margem") && (
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f59e0b"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: "#8ca8c4" }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                lucro: "Lucro Bruto",
                margem: "Margem %",
                receita: "Receita",
                despesa: "Despesa",
              }
              return <span style={{ color: "#8ca8c4" }}>{labels[value] || value}</span>
            }}
          />
          {viewMode === "margem" && (
            <ReferenceLine
              yAxisId="right"
              y={metaMargem}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: `Meta ${metaMargem}%`, fill: "#ef4444", fontSize: 10 }}
            />
          )}
          {(viewMode === "combined" || viewMode === "lucro") && (
            <Bar yAxisId="left" dataKey="lucro" fill="#22c55e" radius={[4, 4, 0, 0]} />
          )}
          {showReceitaDespesa && viewMode === "lucro" && (
            <>
              <Bar yAxisId="left" dataKey="receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </>
          )}
          {(viewMode === "combined" || viewMode === "margem") && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margem"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", r: 4 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-3 border-t border-[#1e4976] text-center">
        <div>
          <p className="text-xs text-[#8ca8c4]">Lucro Total</p>
          <p className="text-sm text-emerald-400 font-bold">{formatCurrency(stats.totalLucro)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Lucro Medio</p>
          <p className="text-sm text-emerald-400 font-medium">{formatCurrency(Math.round(stats.mediaLucro))}</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Margem Media</p>
          <p className="text-sm text-amber-400 font-medium">{stats.mediaMargem.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Margem Max</p>
          <p className="text-sm text-emerald-400 font-medium">{stats.maxMargem}%</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Margem Min</p>
          <p className="text-sm text-red-400 font-medium">{stats.minMargem}%</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Acima Meta</p>
          <p className="text-sm text-[#00d4aa] font-bold">
            {stats.acimaMeta}/{filteredData.length}
          </p>
        </div>
      </div>
    </Card>
  )
}
