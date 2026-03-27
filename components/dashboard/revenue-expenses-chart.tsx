"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Area,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ChartToolbar } from "./chart-toolbar"
import { Button } from "@/components/ui/button"

const initialData = [
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

type ViewMode = "bars" | "lines" | "combined"

export function RevenueExpensesChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("bars")
  const [showReceitas, setShowReceitas] = useState(true)
  const [showDespesas, setShowDespesas] = useState(true)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)

  const filteredData = useMemo(() => {
    let data = [...initialData]

    if (sortOrder === "asc") {
      data = [...data].sort((a, b) => a.receitas - b.receitas)
    } else if (sortOrder === "desc") {
      data = [...data].sort((a, b) => b.receitas - a.receitas)
    }

    return data
  }, [sortOrder])

  const stats = useMemo(() => {
    const receitas = filteredData.map(d => d.receitas)
    const despesas = filteredData.map(d => d.despesas)
    return {
      totalReceitas: receitas.reduce((a, b) => a + b, 0),
      totalDespesas: despesas.reduce((a, b) => a + b, 0),
      lucro: receitas.reduce((a, b) => a + b, 0) - despesas.reduce((a, b) => a + b, 0),
    }
  }, [filteredData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderBarsChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
        <XAxis dataKey="mes" stroke="#8ca8c4" fontSize={12} />
        <YAxis stroke="#8ca8c4" fontSize={12} tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {showReceitas && <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />}
        {showDespesas && <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderLinesChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
        <XAxis dataKey="mes" stroke="#8ca8c4" fontSize={12} />
        <YAxis stroke="#8ca8c4" fontSize={12} tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {showReceitas && <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />}
        {showDespesas && <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderCombinedChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
        <XAxis dataKey="mes" stroke="#8ca8c4" fontSize={12} />
        <YAxis stroke="#8ca8c4" fontSize={12} tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {showReceitas && <Area type="monotone" dataKey="receitas" name="Receitas" fill="url(#colorReceitas)" stroke="#22c55e" />}
        {showDespesas && <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />}
      </ComposedChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Receitas e Despesas por Vencimento"
        showSortButtons={true}
        onSortAsc={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
        onSortDesc={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
        onRefresh={() => {
          setSortOrder(null)
          setShowReceitas(true)
          setShowDespesas(true)
          setViewMode("bars")
        }}
        data={filteredData}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={viewMode === "bars" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "bars" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("bars")}
          >
            Barras
          </Button>
          <Button
            size="sm"
            variant={viewMode === "lines" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "lines" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("lines")}
          >
            Linhas
          </Button>
          <Button
            size="sm"
            variant={viewMode === "combined" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "combined" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("combined")}
          >
            Combinado
          </Button>
        </div>

        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            variant={showReceitas ? "default" : "outline"}
            className={`text-xs h-7 ${showReceitas ? "bg-emerald-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setShowReceitas(!showReceitas)}
          >
            Receitas
          </Button>
          <Button
            size="sm"
            variant={showDespesas ? "default" : "outline"}
            className={`text-xs h-7 ${showDespesas ? "bg-red-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setShowDespesas(!showDespesas)}
          >
            Despesas
          </Button>
        </div>
      </div>

      {viewMode === "bars" && renderBarsChart()}
      {viewMode === "lines" && renderLinesChart()}
      {viewMode === "combined" && renderCombinedChart()}

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1e4976] text-center">
        <div>
          <p className="text-xs text-[#8ca8c4]">Total Receitas</p>
          <p className="text-sm text-emerald-400 font-medium">{formatCurrency(stats.totalReceitas)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Total Despesas</p>
          <p className="text-sm text-red-400 font-medium">{formatCurrency(stats.totalDespesas)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Lucro</p>
          <p className={`text-sm font-bold ${stats.lucro >= 0 ? "text-[#00d4aa]" : "text-red-400"}`}>
            {formatCurrency(stats.lucro)}
          </p>
        </div>
      </div>
    </Card>
  )
}
