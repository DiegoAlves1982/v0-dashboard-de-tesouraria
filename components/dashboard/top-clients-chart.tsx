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
  ComposedChart,
  Line,
  Scatter,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ChartToolbar } from "./chart-toolbar"
import { Button } from "@/components/ui/button"

const initialData = [
  { cliente: "VANNUCCI IMPORTA", total: 185000, ticketMedio: 12500, vendas: 15 },
  { cliente: "TRUCKS CONTROL", total: 142000, ticketMedio: 9467, vendas: 15 },
  { cliente: "VLP TRANSPORTES", total: 128000, ticketMedio: 8533, vendas: 15 },
  { cliente: "CARBONI DISTRIB", total: 98000, ticketMedio: 7000, vendas: 14 },
  { cliente: "MASA DISTRIBUID", total: 87000, ticketMedio: 6214, vendas: 14 },
  { cliente: "RG COMERCIO", total: 76000, ticketMedio: 5846, vendas: 13 },
  { cliente: "CUNHADOS DISTRIB", total: 68000, ticketMedio: 5231, vendas: 13 },
  { cliente: "CARRETAO CURITIBA", total: 62000, ticketMedio: 4769, vendas: 13 },
  { cliente: "BIANCO COMERCIO", total: 55000, ticketMedio: 4231, vendas: 13 },
  { cliente: "PNEUTEK COMERCIO", total: 48000, ticketMedio: 3692, vendas: 13 },
]

const filterOptions = initialData.map((d) => ({
  label: d.cliente,
  value: d.cliente,
  checked: true,
}))

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(2)} Mi`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)} Mil`
  }
  return `R$ ${value}`
}

const COLORS = ["#22c55e", "#00d4aa", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#14b8a6", "#a3e635"]

type SortField = "total" | "ticketMedio" | "vendas" | "cliente"
type ViewMode = "bar" | "combined" | "scatter"

export function TopClientsChart() {
  const [sortField, setSortField] = useState<SortField>("total")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeFilters, setActiveFilters] = useState<string[]>(
    filterOptions.map((f) => f.value)
  )
  const [viewMode, setViewMode] = useState<ViewMode>("bar")
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [topN, setTopN] = useState(8)

  const filteredData = useMemo(() => {
    let data = initialData.filter((d) => activeFilters.includes(d.cliente))

    data = [...data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

    return data.slice(0, topN)
  }, [activeFilters, sortField, sortOrder, topN])

  const stats = useMemo(() => ({
    totalGeral: filteredData.reduce((acc, d) => acc + d.total, 0),
    ticketMedioGeral: filteredData.length > 0
      ? filteredData.reduce((acc, d) => acc + d.ticketMedio, 0) / filteredData.length
      : 0,
    totalVendas: filteredData.reduce((acc, d) => acc + d.vendas, 0),
  }), [filteredData])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{item.cliente}</p>
          <div className="space-y-1 text-sm">
            <p className="text-emerald-400">Total: {formatCurrency(item.total)}</p>
            <p className="text-blue-400">Ticket Medio: {formatCurrency(item.ticketMedio)}</p>
            <p className="text-amber-400">Vendas: {item.vendas}</p>
          </div>
        </div>
      )
    }
    return null
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={filteredData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" horizontal={false} />
        <XAxis
          type="number"
          stroke="#8ca8c4"
          fontSize={10}
          tickFormatter={formatCurrency}
        />
        <YAxis
          type="category"
          dataKey="cliente"
          stroke="#8ca8c4"
          fontSize={10}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="total"
          radius={[0, 4, 4, 0]}
          onClick={(data) => setSelectedClient(data.cliente === selectedClient ? null : data.cliente)}
        >
          {filteredData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={selectedClient === null || selectedClient === entry.cliente
                ? COLORS[index % COLORS.length]
                : "#1e4976"
              }
              style={{ cursor: "pointer" }}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  const renderCombinedChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart
        data={filteredData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
        <XAxis
          dataKey="cliente"
          stroke="#8ca8c4"
          fontSize={9}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          yAxisId="left"
          stroke="#22c55e"
          fontSize={10}
          tickFormatter={formatCurrency}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#3b82f6"
          fontSize={10}
          tickFormatter={formatCurrency}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar yAxisId="left" dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="ticketMedio"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart
        data={filteredData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
        <XAxis
          dataKey="vendas"
          stroke="#8ca8c4"
          fontSize={10}
          label={{ value: "Quantidade de Vendas", position: "bottom", fill: "#8ca8c4", fontSize: 10 }}
        />
        <YAxis
          dataKey="total"
          stroke="#8ca8c4"
          fontSize={10}
          tickFormatter={formatCurrency}
          label={{ value: "Total (R$)", angle: -90, position: "left", fill: "#8ca8c4", fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter dataKey="total" fill="#22c55e">
          {filteredData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              r={entry.ticketMedio / 1000}
            />
          ))}
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Maiores Clientes (Total x Ticket Medio)"
        showSortButtons={false}
        onFilter={(filters) => setActiveFilters(filters)}
        onRefresh={() => {
          setSortField("total")
          setSortOrder("desc")
          setActiveFilters(filterOptions.map((f) => f.value))
          setSelectedClient(null)
          setViewMode("bar")
          setTopN(8)
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
            variant={viewMode === "bar" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "bar" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("bar")}
          >
            Barras
          </Button>
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
            variant={viewMode === "scatter" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "scatter" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("scatter")}
          >
            Dispersao
          </Button>
        </div>

        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            variant={sortField === "total" ? "default" : "outline"}
            className={`text-xs h-7 ${sortField === "total" ? "bg-emerald-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => handleSort("total")}
          >
            Por Total {sortField === "total" && (sortOrder === "desc" ? "↓" : "↑")}
          </Button>
          <Button
            size="sm"
            variant={sortField === "ticketMedio" ? "default" : "outline"}
            className={`text-xs h-7 ${sortField === "ticketMedio" ? "bg-blue-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => handleSort("ticketMedio")}
          >
            Por Ticket {sortField === "ticketMedio" && (sortOrder === "desc" ? "↓" : "↑")}
          </Button>
          <Button
            size="sm"
            variant={sortField === "vendas" ? "default" : "outline"}
            className={`text-xs h-7 ${sortField === "vendas" ? "bg-amber-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => handleSort("vendas")}
          >
            Por Vendas {sortField === "vendas" && (sortOrder === "desc" ? "↓" : "↑")}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <span className="text-xs text-[#8ca8c4]">Top:</span>
        {[5, 8, 10].map((n) => (
          <Button
            key={n}
            size="sm"
            variant={topN === n ? "default" : "outline"}
            className={`text-xs h-6 w-8 ${topN === n ? "bg-[#1e4976]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setTopN(n)}
          >
            {n}
          </Button>
        ))}
      </div>

      {viewMode === "bar" && renderBarChart()}
      {viewMode === "combined" && renderCombinedChart()}
      {viewMode === "scatter" && renderScatterChart()}

      <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-[#1e4976] text-center">
        <div>
          <p className="text-xs text-[#8ca8c4]">Total Geral</p>
          <p className="text-sm text-emerald-400 font-bold">
            {formatCurrency(stats.totalGeral)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Ticket Medio Geral</p>
          <p className="text-sm text-blue-400 font-bold">
            {formatCurrency(Math.round(stats.ticketMedioGeral))}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Total de Vendas</p>
          <p className="text-sm text-amber-400 font-bold">
            {stats.totalVendas}
          </p>
        </div>
      </div>
    </Card>
  )
}
