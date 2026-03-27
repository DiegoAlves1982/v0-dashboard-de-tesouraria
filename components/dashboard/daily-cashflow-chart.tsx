"use client"

import { useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar,
  Legend,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ChartToolbar } from "./chart-toolbar"
import { Button } from "@/components/ui/button"

const generateDailyData = () => {
  const data = []
  let saldo = 150000
  for (let i = 1; i <= 30; i++) {
    const entrada = Math.random() * 50000 + 10000
    const saida = Math.random() * 40000 + 15000
    saldo = saldo + entrada - saida
    data.push({
      dia: i.toString().padStart(2, "0"),
      saldo: Math.round(saldo),
      entrada: Math.round(entrada),
      saida: Math.round(saida),
      semana: Math.ceil(i / 7),
    })
  }
  return data
}

const initialData = generateDailyData()

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)} Mi`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)} Mil`
  }
  return `R$ ${value}`
}

type ViewMode = "area" | "bars" | "combined"

export function DailyCashflowChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("area")
  const [showEntradas, setShowEntradas] = useState(true)
  const [showSaidas, setShowSaidas] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)

  const filteredData = useMemo(() => {
    let data = selectedWeek
      ? initialData.filter((d) => d.semana === selectedWeek)
      : [...initialData]

    if (sortOrder === "asc") {
      data = [...data].sort((a, b) => a.saldo - b.saldo)
    } else if (sortOrder === "desc") {
      data = [...data].sort((a, b) => b.saldo - a.saldo)
    }

    return data
  }, [selectedWeek, sortOrder])

  const stats = useMemo(() => {
    const saldos = filteredData.map((d) => d.saldo)
    const entradas = filteredData.map((d) => d.entrada)
    const saidas = filteredData.map((d) => d.saida)
    return {
      minSaldo: Math.min(...saldos),
      maxSaldo: Math.max(...saldos),
      avgSaldo: Math.round(saldos.reduce((a, b) => a + b, 0) / saldos.length),
      totalEntradas: entradas.reduce((a, b) => a + b, 0),
      totalSaidas: saidas.reduce((a, b) => a + b, 0),
      saldoFinal: filteredData[filteredData.length - 1]?.saldo || 0,
    }
  }, [filteredData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">Dia {label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-[#00d4aa]">Saldo: {formatCurrency(data.saldo)}</p>
            {showEntradas && (
              <p className="text-emerald-400">Entradas: {formatCurrency(data.entrada)}</p>
            )}
            {showSaidas && (
              <p className="text-red-400">Saidas: {formatCurrency(data.saida)}</p>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
        <XAxis dataKey="dia" stroke="#8ca8c4" fontSize={10} />
        <YAxis
          stroke="#8ca8c4"
          fontSize={10}
          tickFormatter={formatCurrency}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
        <ReferenceLine
          y={stats.avgSaldo}
          stroke="#f59e0b"
          strokeDasharray="5 5"
          label={{ value: "Media", fill: "#f59e0b", fontSize: 10 }}
        />
        {showEntradas && (
          <Area
            type="monotone"
            dataKey="entrada"
            stroke="#22c55e"
            fillOpacity={1}
            fill="url(#colorEntrada)"
            strokeWidth={2}
            name="Entradas"
          />
        )}
        {showSaidas && (
          <Area
            type="monotone"
            dataKey="saida"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorSaida)"
            strokeWidth={2}
            name="Saidas"
          />
        )}
        <Area
          type="monotone"
          dataKey="saldo"
          stroke="#00d4aa"
          fillOpacity={1}
          fill="url(#colorSaldo)"
          strokeWidth={2}
          name="Saldo"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )

  const renderBarsChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
        <XAxis dataKey="dia" stroke="#8ca8c4" fontSize={10} />
        <YAxis stroke="#8ca8c4" fontSize={10} tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {showEntradas && <Bar dataKey="entrada" fill="#22c55e" name="Entradas" radius={[2, 2, 0, 0]} />}
        {showSaidas && <Bar dataKey="saida" fill="#ef4444" name="Saidas" radius={[2, 2, 0, 0]} />}
      </ComposedChart>
    </ResponsiveContainer>
  )

  const renderCombinedChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorSaldoCombined" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
        <XAxis dataKey="dia" stroke="#8ca8c4" fontSize={10} />
        <YAxis yAxisId="left" stroke="#8ca8c4" fontSize={10} tickFormatter={formatCurrency} />
        <YAxis yAxisId="right" orientation="right" stroke="#00d4aa" fontSize={10} tickFormatter={formatCurrency} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {showEntradas && <Bar yAxisId="left" dataKey="entrada" fill="#22c55e" name="Entradas" radius={[2, 2, 0, 0]} />}
        {showSaidas && <Bar yAxisId="left" dataKey="saida" fill="#ef4444" name="Saidas" radius={[2, 2, 0, 0]} />}
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="saldo"
          stroke="#00d4aa"
          fill="url(#colorSaldoCombined)"
          strokeWidth={2}
          name="Saldo"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Fluxo de Caixa Diario"
        showSortButtons={true}
        onSortAsc={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
        onSortDesc={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
        onRefresh={() => {
          setSortOrder(null)
          setSelectedWeek(null)
          setShowEntradas(true)
          setShowSaidas(true)
          setViewMode("area")
        }}
        filterOptions={[
          { label: "Semana 1", value: "1", checked: selectedWeek !== 1 },
          { label: "Semana 2", value: "2", checked: selectedWeek !== 2 },
          { label: "Semana 3", value: "3", checked: selectedWeek !== 3 },
          { label: "Semana 4", value: "4", checked: selectedWeek !== 4 },
          { label: "Semana 5", value: "5", checked: selectedWeek !== 5 },
        ]}
        onFilter={(filters) => {
          if (filters.length === 5) {
            setSelectedWeek(null)
          } else if (filters.length === 4) {
            const missing = [1, 2, 3, 4, 5].find((w) => !filters.includes(w.toString()))
            setSelectedWeek(missing || null)
          }
        }}
        data={filteredData}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={viewMode === "area" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "area" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("area")}
          >
            Area
          </Button>
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
            variant={showEntradas ? "default" : "outline"}
            className={`text-xs h-7 ${showEntradas ? "bg-emerald-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setShowEntradas(!showEntradas)}
          >
            Entradas
          </Button>
          <Button
            size="sm"
            variant={showSaidas ? "default" : "outline"}
            className={`text-xs h-7 ${showSaidas ? "bg-red-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setShowSaidas(!showSaidas)}
          >
            Saidas
          </Button>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        <span className="text-xs text-[#8ca8c4] mr-2">Semana:</span>
        <Button
          size="sm"
          variant={selectedWeek === null ? "default" : "outline"}
          className={`text-xs h-6 ${selectedWeek === null ? "bg-[#1e4976]" : "border-[#1e4976] text-[#8ca8c4]"}`}
          onClick={() => setSelectedWeek(null)}
        >
          Todas
        </Button>
        {[1, 2, 3, 4, 5].map((week) => (
          <Button
            key={week}
            size="sm"
            variant={selectedWeek === week ? "default" : "outline"}
            className={`text-xs h-6 w-6 ${selectedWeek === week ? "bg-[#1e4976]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setSelectedWeek(week)}
          >
            {week}
          </Button>
        ))}
      </div>

      {viewMode === "area" && renderAreaChart()}
      {viewMode === "bars" && renderBarsChart()}
      {viewMode === "combined" && renderCombinedChart()}

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mt-4 pt-3 border-t border-[#1e4976] text-center">
        <div>
          <p className="text-xs text-[#8ca8c4]">Saldo Min</p>
          <p className="text-sm text-red-400 font-medium">{formatCurrency(stats.minSaldo)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Saldo Max</p>
          <p className="text-sm text-emerald-400 font-medium">{formatCurrency(stats.maxSaldo)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Saldo Medio</p>
          <p className="text-sm text-amber-400 font-medium">{formatCurrency(stats.avgSaldo)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Total Entradas</p>
          <p className="text-sm text-emerald-400 font-medium">{formatCurrency(stats.totalEntradas)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Total Saidas</p>
          <p className="text-sm text-red-400 font-medium">{formatCurrency(stats.totalSaidas)}</p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Saldo Final</p>
          <p className="text-sm text-[#00d4aa] font-bold">{formatCurrency(stats.saldoFinal)}</p>
        </div>
      </div>
    </Card>
  )
}
