"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const data = [
  { cliente: "VANNUCCI IMPORTA", total: 185000, ticketMedio: 12500, vendas: 15 },
  { cliente: "TRUCKS CONTROL", total: 142000, ticketMedio: 9467, vendas: 15 },
  { cliente: "VLP TRANSPORTES", total: 128000, ticketMedio: 8533, vendas: 15 },
  { cliente: "CARBONI DISTRIB", total: 98000, ticketMedio: 7000, vendas: 14 },
  { cliente: "MASA DISTRIBUID", total: 87000, ticketMedio: 6214, vendas: 14 },
  { cliente: "RG COMERCIO", total: 76000, ticketMedio: 5846, vendas: 13 },
  { cliente: "CUNHADOS DISTRIB", total: 68000, ticketMedio: 5231, vendas: 13 },
  { cliente: "CARRETAO CURITIBA", total: 62000, ticketMedio: 4769, vendas: 13 },
]

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(2)} Mi`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)} Mil`
  }
  return `R$ ${value}`
}

const COLORS = ["#22c55e", "#00d4aa", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"]

export function TopClientsChart() {
  return (
    <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">
        Maiores Clientes (Total x Ticket Médio)
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
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
          <Tooltip
            contentStyle={{
              backgroundColor: "#0d1e36",
              border: "1px solid #1e4976",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#ffffff" }}
            formatter={(value: number, name: string, props) => {
              const item = props.payload
              return [
                <div key="tooltip" className="text-sm">
                  <div>Total: {formatCurrency(item.total)}</div>
                  <div>Ticket Médio: {formatCurrency(item.ticketMedio)}</div>
                  <div>Vendas: {item.vendas}</div>
                </div>,
                "",
              ]
            }}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
