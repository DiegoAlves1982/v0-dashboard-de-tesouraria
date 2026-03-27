"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

const data = [
  { name: "Folha de Pagamento", value: 185000, percentage: 42.3 },
  { name: "Fornecedores", value: 95000, percentage: 21.7 },
  { name: "Impostos", value: 68000, percentage: 15.5 },
  { name: "Aluguel/Infraestrutura", value: 45000, percentage: 10.3 },
  { name: "Manutenção", value: 28000, percentage: 6.4 },
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

export function ExpensesCategoryChart() {
  return (
    <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Despesas por Categoria</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d1e36",
              border: "1px solid #1e4976",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#ffffff" }}
            formatter={(value: number, name: string) => [
              `${formatCurrency(value)} (${data.find(d => d.name === name)?.percentage}%)`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index] }}
            />
            <span className="text-[#8ca8c4] truncate">{item.name}</span>
            <span className="text-white ml-auto">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
