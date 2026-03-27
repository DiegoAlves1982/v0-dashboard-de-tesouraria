"use client"

import { useState, useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Card } from "@/components/ui/card"
import { ChartToolbar } from "./chart-toolbar"
import { Button } from "@/components/ui/button"

const initialData = [
  { name: "Folha de Pagamento", value: 185000, percentage: 42.3 },
  { name: "Fornecedores", value: 95000, percentage: 21.7 },
  { name: "Impostos", value: 68000, percentage: 15.5 },
  { name: "Aluguel/Infraestrutura", value: 45000, percentage: 10.3 },
  { name: "Manutencao", value: 28000, percentage: 6.4 },
  { name: "Outros", value: 17000, percentage: 3.8 },
]

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"]

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(2)} Mi`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)} Mil`
  }
  return `R$ ${value}`
}

type ViewMode = "pie" | "bar"

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

export function ExpensesCategoryChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("pie")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(
    initialData.map((d) => d.name)
  )
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filterOptions = initialData.map((d) => ({
    label: d.name,
    value: d.name,
    checked: true,
  }))

  const filteredData = useMemo(() => {
    let data = initialData.filter((d) => activeFilters.includes(d.name))

    if (sortOrder === "asc") {
      data = [...data].sort((a, b) => a.value - b.value)
    } else if (sortOrder === "desc") {
      data = [...data].sort((a, b) => b.value - a.value)
    }

    // Recalcular percentuais
    const total = data.reduce((acc, d) => acc + d.value, 0)
    return data.map((d) => ({
      ...d,
      percentage: total > 0 ? ((d.value / total) * 100) : 0,
    }))
  }, [activeFilters, sortOrder])

  const totalValue = filteredData.reduce((acc, d) => acc + d.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-1">{data.name}</p>
          <p className="text-red-400">{formatCurrency(data.value)}</p>
          <p className="text-[#8ca8c4] text-sm">{data.percentage.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  const handleCategoryClick = (name: string) => {
    setSelectedCategory(selectedCategory === name ? null : name)
  }

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Despesas por Categoria"
        showSortButtons={true}
        onSortAsc={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
        onSortDesc={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
        onFilter={(filters) => setActiveFilters(filters)}
        onRefresh={() => {
          setSortOrder(null)
          setActiveFilters(initialData.map((d) => d.name))
          setSelectedCategory(null)
          setViewMode("pie")
        }}
        filterOptions={filterOptions.map((f) => ({
          ...f,
          checked: activeFilters.includes(f.value),
        }))}
        data={filteredData}
      />

      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={viewMode === "pie" ? "default" : "outline"}
          className={`text-xs h-7 ${viewMode === "pie" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
          onClick={() => setViewMode("pie")}
        >
          Pizza
        </Button>
        <Button
          size="sm"
          variant={viewMode === "bar" ? "default" : "outline"}
          className={`text-xs h-7 ${viewMode === "bar" ? "bg-[#00d4aa] text-[#0a1628]" : "border-[#1e4976] text-[#8ca8c4]"}`}
          onClick={() => setViewMode("bar")}
        >
          Barras
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        {viewMode === "pie" ? (
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={selectedCategory === null || selectedCategory === entry.name
                    ? COLORS[initialData.findIndex((d) => d.name === entry.name) % COLORS.length]
                    : "#1e4976"
                  }
                  style={{ cursor: "pointer" }}
                  onClick={() => handleCategoryClick(entry.name)}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        ) : (
          <BarChart data={filteredData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e4976" horizontal={false} />
            <XAxis type="number" stroke="#8ca8c4" fontSize={10} tickFormatter={formatCurrency} />
            <YAxis type="category" dataKey="name" stroke="#8ca8c4" fontSize={9} width={75} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[initialData.findIndex((d) => d.name === entry.name) % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {filteredData.map((item) => {
          const colorIndex = initialData.findIndex((d) => d.name === item.name)
          return (
            <div
              key={item.name}
              className={`flex items-center gap-2 text-xs p-1 rounded cursor-pointer transition-colors ${
                selectedCategory === item.name ? "bg-[#1e4976]" : "hover:bg-[#1e4976]/50"
              }`}
              onClick={() => handleCategoryClick(item.name)}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[colorIndex % COLORS.length] }}
              />
              <span className="text-[#8ca8c4] truncate flex-1">{item.name}</span>
              <span className="text-white">{item.percentage.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1e4976] flex justify-between">
        <span className="text-[#8ca8c4] text-sm">Total Despesas</span>
        <span className="text-red-400 font-bold">{formatCurrency(totalValue)}</span>
      </div>
    </Card>
  )
}
