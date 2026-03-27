"use client"

import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronUp } from "lucide-react"

const paymentsData = [
  {
    vencimento: "25/10/2025",
    dataVencimento: "25/10/2025 00:00:00",
    receitaTotal: null,
    cliente: "09201-VANNUCCI IMPORTA",
  },
  {
    vencimento: "03/11/2025",
    dataVencimento: "03/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "00327-TRUCKS CONTROL -",
  },
  {
    vencimento: "24/11/2025",
    dataVencimento: "24/11/2025 00:00:00",
    receitaTotal: 450.0,
    cliente: "00015-VLP TRANSPORTES L",
  },
  {
    vencimento: "24/11/2025",
    dataVencimento: "24/11/2025 00:00:00",
    receitaTotal: 760.0,
    cliente: "00292-CARBONI DISTRIBUI",
  },
  {
    vencimento: "24/11/2025",
    dataVencimento: "24/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "09211-ROBSON MACAGNAI",
  },
  {
    vencimento: "25/11/2025",
    dataVencimento: "25/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "09005-MASA DISTRIBUIDOR",
  },
  {
    vencimento: "25/11/2025",
    dataVencimento: "25/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "09027-RG COMERCIO DE PE",
  },
  {
    vencimento: "25/11/2025",
    dataVencimento: "25/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "09030-CUNHADOS DISTRIB",
  },
  {
    vencimento: "25/11/2025",
    dataVencimento: "25/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "09032-CARRETAO CURITIBA",
  },
  {
    vencimento: "25/11/2025",
    dataVencimento: "25/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "09040-BIANCO COMERCIO",
  },
  {
    vencimento: "25/11/2025",
    dataVencimento: "25/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "09108-PNEUTEK COMERCIO",
  },
  {
    vencimento: "25/11/2025",
    dataVencimento: "25/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "09191-FORTPEL COMERCIO",
  },
  {
    vencimento: "25/11/2025",
    dataVencimento: "25/11/2025 00:00:00",
    receitaTotal: null,
    cliente: "09201-VANNUCCI IMPORTA",
  },
]

export function PaymentsTable() {
  const total = 1311009.45

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4 h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#1e4976] hover:bg-transparent">
              <TableHead className="text-[#8ca8c4] font-medium">
                <div className="flex items-center gap-1">
                  Vencimento
                  <ChevronUp className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-[#8ca8c4] font-medium">
                Data Vencimento
              </TableHead>
              <TableHead className="text-[#8ca8c4] font-medium text-right">
                Receita Total
              </TableHead>
              <TableHead className="text-[#8ca8c4] font-medium">
                Clientes_e_Fornecedores
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsData.map((row, index) => (
              <TableRow
                key={index}
                className="border-[#1e4976]/50 hover:bg-[#1e4976]/20"
              >
                <TableCell className="text-white text-sm py-2">
                  {row.vencimento}
                </TableCell>
                <TableCell className="text-white text-sm py-2">
                  {row.dataVencimento}
                </TableCell>
                <TableCell className="text-white text-sm py-2 text-right">
                  {row.receitaTotal
                    ? `R$ ${row.receitaTotal.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}`
                    : ""}
                </TableCell>
                <TableCell className="text-white text-sm py-2 truncate max-w-[200px]">
                  {row.cliente}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 pt-4 border-t border-[#1e4976] flex items-center justify-between">
        <span className="text-[#8ca8c4] font-medium">Total</span>
        <span className="text-emerald-400 font-bold text-lg">
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </Card>
  )
}
