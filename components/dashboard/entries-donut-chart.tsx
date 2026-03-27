"use client"

import { useState, useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts"
import { Card } from "@/components/ui/card"
import { ChartToolbar } from "./chart-toolbar"

const initialData = [
  { name: "PR TRUCKS", value: 892690, percentage: 68.09, color: "#22c55e" },
  { name: "SIDER TRUCKS", value: 318980, percentage: 24.33, color: "#1a5c3a" },
  { name: "PR TRUCKS SERVICOS", value: 99340, percentage: 7.58, color: "#0d3320" },
]

const filterOptions = [
  { label: "PR TRUCKS", value: "PR TRUCKS", checked: true },
  { label: "SIDER TRUCKS", value: "SIDER TRUCKS", checked: true },
  { label: "PR TRUCKS SERVICOS", value: "PR TRUCKS SERVICOS", checked: true },
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
        <p className="text-[#8ca8c4] text-sm">({data.percentage.toFixed(2)}%)</p>
      </div>
    )
  }
  return null
}

const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload
  } = props

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
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

export function EntriesDonutChart() {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(
    filterOptions.map((f) => f.value)
  )
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

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
      percentage: total > 0 ? (d.value / total) * 100 : 0,
    }))
  }, [activeFilters, sortOrder])

  const totalValue = filteredData.reduce((acc, d) => acc + d.value, 0)
  const totalPercentage = initialData.reduce((acc, d) => acc + d.value, 0)
  const marginPercentage = ((totalValue / totalPercentage) * 100).toFixed(2)

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const handlePieLeave = () => {
    setActiveIndex(undefined)
  }

  const handleItemClick = (name: string) => {
    setSelectedItem(selectedItem === name ? null : name)
  }

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={handlePieEnter}
          onMouseLeave={handlePieLeave}
        >
          {filteredData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={selectedItem === null || selectedItem === entry.name ? entry.color : "#1e4976"}
              stroke="none"
              style={{ cursor: "pointer" }}
              onClick={() => handleItemClick(entry.name)}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4">
      <ChartToolbar
        title="Entradas"
        showSortButtons={true}
        onSortAsc={() => setSortOrder(sortOrder === "asc" ? null : "asc")}
        onSortDesc={() => setSortOrder(sortOrder === "desc" ? null : "desc")}
        onFilter={(filters) => setActiveFilters(filters)}
        onRefresh={() => {
          setSortOrder(null)
          setActiveFilters(filterOptions.map((f) => f.value))
          setSelectedItem(null)
        }}
        filterOptions={filterOptions.map((f) => ({
          ...f,
          checked: activeFilters.includes(f.value),
        }))}
        data={filteredData}
      >
        {chartContent}
      </ChartToolbar>
      <div className="h-[250px] relative">
        {chartContent}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{marginPercentage}%</p>
            <p className="text-xs text-[#8ca8c4]">% Margem</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        {filteredData.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between text-sm p-2 rounded cursor-pointer transition-colors ${
              selectedItem === item.name ? "bg-[#1e4976]" : "hover:bg-[#1e4976]/50"
            }`}
            onClick={() => handleItemClick(item.name)}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
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
              <span className="text-[#8ca8c4] ml-2">({item.percentage.toFixed(2)}%)</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-[#1e4976] flex justify-between text-sm">
        <span className="text-[#8ca8c4]">Total Filtrado</span>
        <span className="text-emerald-400 font-bold">
          R$ {(totalValue / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} Mil
        </span>
      </div>
    </Card>
  )
}
