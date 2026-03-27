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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ChartToolbar } from "./chart-toolbar"
import { Button } from "@/components/ui/button"

const initialData = [
  { categoria: "Caminhoes", disponivel: 45, locado: 32, manutencao: 8 },
  { categoria: "Empilhadeiras", disponivel: 28, locado: 42, manutencao: 5 },
  { categoria: "Plataformas", disponivel: 18, locado: 24, manutencao: 3 },
  { categoria: "Geradores", disponivel: 12, locado: 18, manutencao: 2 },
  { categoria: "Compressores", disponivel: 22, locado: 15, manutencao: 4 },
]

const COLORS = {
  disponivel: "#22c55e",
  locado: "#3b82f6",
  manutencao: "#f59e0b"
}

type ViewMode = "stacked" | "grouped" | "pie"

export function InventoryChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("stacked")
  const [showDisponivel, setShowDisponivel] = useState(true)
  const [showLocado, setShowLocado] = useState(true)
  const [showManutencao, setShowManutencao] = useState(true)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredData = useMemo(() => {
    let data = selectedCategory 
      ? initialData.filter(d => d.categoria === selectedCategory)
      : [...initialData]

    if (sortOrder === "asc") {
      data = [...data].sort((a, b) => (a.disponivel + a.locado + a.manutencao) - (b.disponivel + b.locado + b.manutencao))
    } else if (sortOrder === "desc") {
      data = [...data].sort((a, b) => (b.disponivel + b.locado + b.manutencao) - (a.disponivel + a.locado + a.manutencao))
    }

    return data
  }, [selectedCategory, sortOrder])

  const stats = useMemo(() => {
    const totals = filteredData.reduce((acc, item) => ({
      disponivel: acc.disponivel + item.disponivel,
      locado: acc.locado + item.locado,
      manutencao: acc.manutencao + item.manutencao,
    }), { disponivel: 0, locado: 0, manutencao: 0 })
    
    return totals
  }, [filteredData])

  const pieData = [
    { name: "Disponivel", value: stats.disponivel, color: COLORS.disponivel },
    { name: "Locado", value: stats.locado, color: COLORS.locado },
    { name: "Manutencao", value: stats.manutencao, color: COLORS.manutencao },
  ]

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" />
        <XAxis dataKey="categoria" stroke="#8ca8c4" fontSize={11} />
        <YAxis stroke="#8ca8c4" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0d1e36",
            border: "1px solid #1e4976",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#ffffff" }}
        />
        <Legend
          wrapperStyle={{ color: "#8ca8c4" }}
          formatter={(value) => {
            const labels: Record<string, string> = {
              disponivel: "Disponivel",
              locado: "Locado",
              manutencao: "Manutencao",
            }
            return <span style={{ color: "#8ca8c4" }}>{labels[value] || value}</span>
          }}
        />
        {showDisponivel && (
          <Bar
            dataKey="disponivel"
            stackId={viewMode === "stacked" ? "a" : undefined}
            fill={COLORS.disponivel}
            radius={viewMode === "grouped" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        )}
        {showLocado && (
          <Bar
            dataKey="locado"
            stackId={viewMode === "stacked" ? "a" : undefined}
            fill={COLORS.locado}
            radius={viewMode === "grouped" ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        )}
        {showManutencao && (
          <Bar
            dataKey="manutencao"
            stackId={viewMode === "stacked" ? "a" : undefined}
            fill={COLORS.manutencao}
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData.filter(d => 
            (d.name === "Disponivel" && showDisponivel) ||
            (d.name === "Locado" && showLocado) ||
            (d.name === "Manutencao" && showManutencao)
          )}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#0d1e36",
            border: "1px solid #1e4976",
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Posicao de Estoque"
        showSortButtons={true}
        onSortAsc={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
        onSortDesc={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
        onRefresh={() => {
          setSortOrder(null)
          setSelectedCategory(null)
          setShowDisponivel(true)
          setShowLocado(true)
          setShowManutencao(true)
          setViewMode("stacked")
        }}
        filterOptions={initialData.map(d => ({
          label: d.categoria,
          value: d.categoria,
          checked: selectedCategory !== d.categoria
        }))}
        onFilter={(filters) => {
          if (filters.length === initialData.length) {
            setSelectedCategory(null)
          } else if (filters.length === initialData.length - 1) {
            const missing = initialData.find(d => !filters.includes(d.categoria))
            setSelectedCategory(missing?.categoria || null)
          }
        }}
        data={filteredData}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={viewMode === "stacked" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "stacked" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("stacked")}
          >
            Empilhado
          </Button>
          <Button
            size="sm"
            variant={viewMode === "grouped" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "grouped" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("grouped")}
          >
            Agrupado
          </Button>
          <Button
            size="sm"
            variant={viewMode === "pie" ? "default" : "outline"}
            className={`text-xs h-7 ${viewMode === "pie" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setViewMode("pie")}
          >
            Pizza
          </Button>
        </div>

        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            variant={showDisponivel ? "default" : "outline"}
            className={`text-xs h-7 ${showDisponivel ? "bg-emerald-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setShowDisponivel(!showDisponivel)}
          >
            Disponivel
          </Button>
          <Button
            size="sm"
            variant={showLocado ? "default" : "outline"}
            className={`text-xs h-7 ${showLocado ? "bg-blue-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setShowLocado(!showLocado)}
          >
            Locado
          </Button>
          <Button
            size="sm"
            variant={showManutencao ? "default" : "outline"}
            className={`text-xs h-7 ${showManutencao ? "bg-amber-600" : "border-[#1e4976] text-[#8ca8c4]"}`}
            onClick={() => setShowManutencao(!showManutencao)}
          >
            Manutencao
          </Button>
        </div>
      </div>
      {viewMode === "pie" ? renderPieChart() : renderBarChart()}

      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
        <div 
          className={`bg-[#1a3a5c] rounded-lg p-3 cursor-pointer transition-all ${showDisponivel ? "ring-2 ring-emerald-500" : "opacity-50"}`}
          onClick={() => setShowDisponivel(!showDisponivel)}
        >
          <div className="text-[#22c55e] text-xl font-bold">{stats.disponivel}</div>
          <div className="text-[#8ca8c4] text-xs">Disponivel</div>
        </div>
        <div 
          className={`bg-[#1a3a5c] rounded-lg p-3 cursor-pointer transition-all ${showLocado ? "ring-2 ring-blue-500" : "opacity-50"}`}
          onClick={() => setShowLocado(!showLocado)}
        >
          <div className="text-[#3b82f6] text-xl font-bold">{stats.locado}</div>
          <div className="text-[#8ca8c4] text-xs">Locado</div>
        </div>
        <div 
          className={`bg-[#1a3a5c] rounded-lg p-3 cursor-pointer transition-all ${showManutencao ? "ring-2 ring-amber-500" : "opacity-50"}`}
          onClick={() => setShowManutencao(!showManutencao)}
        >
          <div className="text-[#f59e0b] text-xl font-bold">{stats.manutencao}</div>
          <div className="text-[#8ca8c4] text-xs">Manutencao</div>
        </div>
      </div>
    </Card>
  )
}
