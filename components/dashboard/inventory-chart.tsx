"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const data = [
  { categoria: "Caminhões", disponivel: 45, locado: 32, manutencao: 8 },
  { categoria: "Empilhadeiras", disponivel: 28, locado: 42, manutencao: 5 },
  { categoria: "Plataformas", disponivel: 18, locado: 24, manutencao: 3 },
  { categoria: "Geradores", disponivel: 12, locado: 18, manutencao: 2 },
  { categoria: "Compressores", disponivel: 22, locado: 15, manutencao: 4 },
]

export function InventoryChart() {
  return (
    <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-4">
      <h3 className="text-white font-semibold mb-4">Posição de Estoque</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                disponivel: "Disponível",
                locado: "Locado",
                manutencao: "Manutenção",
              }
              return <span style={{ color: "#8ca8c4" }}>{labels[value] || value}</span>
            }}
          />
          <Bar
            dataKey="disponivel"
            stackId="a"
            fill="#22c55e"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="locado"
            stackId="a"
            fill="#3b82f6"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="manutencao"
            stackId="a"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
        <div className="bg-[#1a3a5c] rounded-lg p-3">
          <div className="text-[#22c55e] text-xl font-bold">125</div>
          <div className="text-[#8ca8c4] text-xs">Disponível</div>
        </div>
        <div className="bg-[#1a3a5c] rounded-lg p-3">
          <div className="text-[#3b82f6] text-xl font-bold">131</div>
          <div className="text-[#8ca8c4] text-xs">Locado</div>
        </div>
        <div className="bg-[#1a3a5c] rounded-lg p-3">
          <div className="text-[#f59e0b] text-xl font-bold">22</div>
          <div className="text-[#8ca8c4] text-xs">Manutenção</div>
        </div>
      </div>
    </div>
  )
}
