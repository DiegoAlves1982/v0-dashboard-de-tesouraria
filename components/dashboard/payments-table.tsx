"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Download,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const initialData = [
  { vencimento: "25/10/2025", dataVencimento: "25/10/2025 00:00:00", receitaTotal: null, cliente: "09201-VANNUCCI IMPORTA" },
  { vencimento: "03/11/2025", dataVencimento: "03/11/2025 00:00:00", receitaTotal: null, cliente: "00327-TRUCKS CONTROL -" },
  { vencimento: "24/11/2025", dataVencimento: "24/11/2025 00:00:00", receitaTotal: 450.0, cliente: "00015-VLP TRANSPORTES L" },
  { vencimento: "24/11/2025", dataVencimento: "24/11/2025 00:00:00", receitaTotal: 760.0, cliente: "00292-CARBONI DISTRIBUI" },
  { vencimento: "24/11/2025", dataVencimento: "24/11/2025 00:00:00", receitaTotal: null, cliente: "09211-ROBSON MACAGNAI" },
  { vencimento: "25/11/2025", dataVencimento: "25/11/2025 00:00:00", receitaTotal: 1200.0, cliente: "09005-MASA DISTRIBUIDOR" },
  { vencimento: "25/11/2025", dataVencimento: "25/11/2025 00:00:00", receitaTotal: 3500.0, cliente: "09027-RG COMERCIO DE PE" },
  { vencimento: "25/11/2025", dataVencimento: "25/11/2025 00:00:00", receitaTotal: null, cliente: "09030-CUNHADOS DISTRIB" },
  { vencimento: "25/11/2025", dataVencimento: "25/11/2025 00:00:00", receitaTotal: 8900.0, cliente: "09032-CARRETAO CURITIBA" },
  { vencimento: "25/11/2025", dataVencimento: "25/11/2025 00:00:00", receitaTotal: 2100.0, cliente: "09040-BIANCO COMERCIO" },
  { vencimento: "25/11/2025", dataVencimento: "25/11/2025 00:00:00", receitaTotal: 5600.0, cliente: "09108-PNEUTEK COMERCIO" },
  { vencimento: "25/11/2025", dataVencimento: "25/11/2025 00:00:00", receitaTotal: 12500.0, cliente: "09191-FORTPEL COMERCIO" },
  { vencimento: "25/11/2025", dataVencimento: "25/11/2025 00:00:00", receitaTotal: 45000.0, cliente: "09201-VANNUCCI IMPORTA" },
  { vencimento: "26/11/2025", dataVencimento: "26/11/2025 00:00:00", receitaTotal: 7800.0, cliente: "09253-HDS REFRIGERACAO" },
  { vencimento: "26/11/2025", dataVencimento: "26/11/2025 00:00:00", receitaTotal: 3200.0, cliente: "09259-JEC ASSISTENCIA" },
  { vencimento: "27/11/2025", dataVencimento: "27/11/2025 00:00:00", receitaTotal: 15600.0, cliente: "09301-LOGISTICA TOTAL" },
  { vencimento: "28/11/2025", dataVencimento: "28/11/2025 00:00:00", receitaTotal: 28000.0, cliente: "09350-TRANSMAX LTDA" },
  { vencimento: "29/11/2025", dataVencimento: "29/11/2025 00:00:00", receitaTotal: 9500.0, cliente: "09401-DISTRIBUI FACIL" },
  { vencimento: "30/11/2025", dataVencimento: "30/11/2025 00:00:00", receitaTotal: 4300.0, cliente: "09450-EXPRESS CARGO" },
  { vencimento: "01/12/2025", dataVencimento: "01/12/2025 00:00:00", receitaTotal: 18700.0, cliente: "09500-MEGA TRANSPORTES" },
]

type SortField = "vencimento" | "receitaTotal" | "cliente"
type SortDirection = "asc" | "desc" | null

export function PaymentsTable() {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyWithValue, setShowOnlyWithValue] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-50" />
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="h-3 w-3 ml-1 text-emerald-400" />
    }
    return <ChevronDown className="h-3 w-3 ml-1 text-emerald-400" />
  }

  const filteredAndSortedData = useMemo(() => {
    let data = [...initialData]

    // Filtro de busca
    if (searchTerm) {
      data = data.filter(
        (row) =>
          row.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.vencimento.includes(searchTerm)
      )
    }

    // Filtro de valor
    if (showOnlyWithValue) {
      data = data.filter((row) => row.receitaTotal !== null)
    }

    // Ordenacao
    if (sortField && sortDirection) {
      data.sort((a, b) => {
        let aVal: any = a[sortField]
        let bVal: any = b[sortField]

        if (sortField === "vencimento") {
          const parseDate = (d: string) => {
            const [day, month, year] = d.split("/")
            return new Date(`${year}-${month}-${day}`)
          }
          aVal = parseDate(aVal)
          bVal = parseDate(bVal)
        }

        if (sortField === "receitaTotal") {
          aVal = aVal || 0
          bVal = bVal || 0
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return data
  }, [searchTerm, showOnlyWithValue, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage)
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const total = filteredAndSortedData.reduce(
    (acc, row) => acc + (row.receitaTotal || 0),
    0
  )

  const handleExportCSV = () => {
    const headers = ["Vencimento", "Data Vencimento", "Receita Total", "Cliente"]
    const rows = filteredAndSortedData.map((row) => [
      row.vencimento,
      row.dataVencimento,
      row.receitaTotal || "",
      row.cliente,
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pagamentos_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <Card className="bg-[var(--card)] border-[var(--border)] p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-white font-semibold">Vencimentos</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-8 h-8 w-[180px] bg-[var(--background)] border-[var(--border)] text-white placeholder:text-[var(--muted-foreground)] text-sm"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3 text-[var(--muted-foreground)]" />
              </Button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[var(--muted-foreground)] hover:text-white hover:bg-[var(--secondary)]"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[var(--card)] border-[var(--border)]">
              <DropdownMenuCheckboxItem
                checked={showOnlyWithValue}
                onCheckedChange={setShowOnlyWithValue}
                className="text-white"
              >
                Apenas com valor
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator className="bg-[var(--border)]" />
              <DropdownMenuItem
                className="text-red-400"
                onClick={() => {
                  setSearchTerm("")
                  setShowOnlyWithValue(false)
                  setSortField(null)
                  setSortDirection(null)
                  setCurrentPage(1)
                }}
              >
                Limpar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[var(--muted-foreground)] hover:text-white hover:bg-[var(--secondary)]"
            onClick={handleExportCSV}
            title="Exportar CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--border)] hover:bg-transparent">
              <TableHead
                className="text-[var(--muted-foreground)] font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort("vencimento")}
              >
                <div className="flex items-center">
                  Vencimento
                  {getSortIcon("vencimento")}
                </div>
              </TableHead>
              <TableHead className="text-[var(--muted-foreground)] font-medium">
                Data Vencimento
              </TableHead>
              <TableHead
                className="text-[var(--muted-foreground)] font-medium text-right cursor-pointer hover:text-white"
                onClick={() => handleSort("receitaTotal")}
              >
                <div className="flex items-center justify-end">
                  Receita Total
                  {getSortIcon("receitaTotal")}
                </div>
              </TableHead>
              <TableHead
                className="text-[var(--muted-foreground)] font-medium cursor-pointer hover:text-white"
                onClick={() => handleSort("cliente")}
              >
                <div className="flex items-center">
                  Clientes_e_Fornecedores
                  {getSortIcon("cliente")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)] py-8">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className="border-[var(--border)]/50 hover:bg-[var(--secondary)]/20 cursor-pointer"
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
                      : "-"}
                  </TableCell>
                  <TableCell className="text-white text-sm py-2 truncate max-w-[200px]">
                    {row.cliente}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginacao */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <div className="text-xs text-[var(--muted-foreground)]">
          {filteredAndSortedData.length} registros
          {searchTerm && ` (filtrado por "${searchTerm}")`}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[var(--muted-foreground)] hover:text-white hover:bg-[var(--secondary)]"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[var(--muted-foreground)]">
            {currentPage} / {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[var(--muted-foreground)] hover:text-white hover:bg-[var(--secondary)]"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-[var(--muted-foreground)] font-medium">Total</span>
        <span className="text-emerald-400 font-bold text-lg">
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </Card>
  )
}
