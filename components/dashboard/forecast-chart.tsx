"use client"

import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ChartToolbar } from "./chart-toolbar"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const initialData = [
  { date: "01 dez", valor: 25000, previsto: 15000, meta: 20000 },
  { date: "08 dez", valor: 35000, previsto: 15000, meta: 20000 },
  { date: "15 dez", valor: 22000, previsto: 15000, meta: 20000 },
  { date: "22 dez", valor: 45000, previsto: 15000, meta: 20000 },
  { date: "29 dez", valor: 28000, previsto: 15000, meta: 20000 },
  { date: "05 jan", valor: 52000, previsto: 15000, meta: 20000 },
  { date: "12 jan", valor: 18000, previsto: 15000, meta: 20000 },
  { date: "19 jan", valor: 38000, previsto: 15000, meta: 20000 },
  { date: "26 jan", valor: 25000, previsto: 15000, meta: 20000 },
  { date: "02 fev", valor: 48000, previsto: 15000, meta: 20000 },
  { date: "09 fev", valor: 32000, previsto: 15000, meta: 20000 },
  { date: "16 fev", valor: 55000, previsto: 15000, meta: 20000 },
  { date: "23 fev", valor: 42000, previsto: 15000, meta: 20000 },
  { date: "02 mar", valor: 38000, previsto: 15000, meta: 20000 },
  { date: "09 mar", valor: 50000, previsto: 15000, meta: 20000 },
]

const filterOptions = [
  { label: "Dezembro", value: "dez", checked: true },
  { label: "Janeiro", value: "jan", checked: true },
  { label: "Fevereiro", value: "fev", checked: true },
  { label: "Marco", value: "mar", checked: true },
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(
    filterOptions.map((f) => f.value)
  )
  const [showPrevisto, setShowPrevisto] = useState(true)
  const [showMeta, setShowMeta] = useState(true)
  const [limitValue, setLimitValue] = useState(20000)

  const filteredData = useMemo(() => {
    let data = initialData.filter((d) => {
      const month = d.date.split(" ")[1]
      return activeFilters.includes(month)
    })

    if (sortOrder === "asc") {
      data = [...data].sort((a, b) => a.valor - b.valor)
    } else if (sortOrder === "desc") {
      data = [...data].sort((a, b) => b.valor - a.valor)
    }

    return data
  }, [activeFilters, sortOrder])

  const stats = useMemo(() => {
    const valores = filteredData.map((d) => d.valor)
    return {
      max: Math.max(...valores),
      min: Math.min(...valores),
      avg: valores.reduce((a, b) => a + b, 0) / valores.length,
      total: valores.reduce((a, b) => a + b, 0),
    }
  }, [filteredData])

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={filteredData}
        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" vertical={false} />
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
          y={limitValue}
          stroke="#ef4444"
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{ value: "Limite", fill: "#ef4444", fontSize: 10 }}
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
        {showPrevisto && (
          <Line
            type="monotone"
            dataKey="previsto"
            stroke="#00d4aa"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Valor Previsto"
          />
        )}
        {showMeta && (
          <Line
            type="monotone"
            dataKey="meta"
            stroke="#f59e0b"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="Meta"
          />
        )}
        <Brush
          dataKey="date"
          height={20}
          stroke="#1e4976"
          fill="#0a1628"
          travellerWidth={8}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Previsao (4 Meses)"
        showSortButtons={true}
        onSortAsc={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
        onSortDesc={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
        onFilter={(filters) => setActiveFilters(filters)}
        onRefresh={() => {
          setSortOrder(null)
          setActiveFilters(filterOptions.map((f) => f.value))
          setShowPrevisto(true)
          setShowMeta(true)
          setLimitValue(20000)
        }}
        filterOptions={filterOptions.map((f) => ({
          ...f,
          checked: activeFilters.includes(f.value),
        }))}
        data={filteredData}
      >
        {chartContent}
      </ChartToolbar>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={showPrevisto ? "default" : "outline"}
          size="sm"
          className={`text-xs h-7 ${
            showPrevisto
              ? "bg-[#00d4aa] text-[#0a1628] hover:bg-[#00d4aa]/80"
              : "border-[#1e4976] text-[#8ca8c4] hover:bg-[#1e4976]"
          }`}
          onClick={() => setShowPrevisto(!showPrevisto)}
        >
          Previsto
        </Button>
        <Button
          variant={showMeta ? "default" : "outline"}
          size="sm"
          className={`text-xs h-7 ${
            showMeta
              ? "bg-amber-500 text-[#0a1628] hover:bg-amber-500/80"
              : "border-[#1e4976] text-[#8ca8c4] hover:bg-[#1e4976]"
          }`}
          onClick={() => setShowMeta(!showMeta)}
        >
          Meta
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#8ca8c4]">Limite:</span>
          <Slider
            value={[limitValue]}
            onValueChange={(v) => setLimitValue(v[0])}
            min={10000}
            max={50000}
            step={5000}
            className="w-24"
          />
          <span className="text-xs text-red-400 w-16">
            R$ {(limitValue / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      <div className="h-[250px]">{chartContent}</div>

      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-white" />
          <span className="text-xs text-[#8ca8c4]">Valor Real</span>
        </div>
        {showPrevisto && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#00d4aa]" style={{ borderStyle: "dashed" }} />
            <span className="text-xs text-[#8ca8c4]">Valor Previsto</span>
          </div>
        )}
        {showMeta && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-500" />
            <span className="text-xs text-[#8ca8c4]">Meta</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500" />
          <span className="text-xs text-[#8ca8c4]">Limite</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#1e4976] text-center">
        <div>
          <p className="text-xs text-[#8ca8c4]">Maximo</p>
          <p className="text-sm text-emerald-400 font-medium">
            R$ {stats.max.toLocaleString("pt-BR")}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Minimo</p>
          <p className="text-sm text-red-400 font-medium">
            R$ {stats.min.toLocaleString("pt-BR")}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Media</p>
          <p className="text-sm text-white font-medium">
            R$ {Math.round(stats.avg).toLocaleString("pt-BR")}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#8ca8c4]">Total</p>
          <p className="text-sm text-[#00d4aa] font-medium">
            R$ {stats.total.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
    </Card>
  )
}
