"use client"

import { useState, useRef } from "react"
import {
  ArrowUp,
  ArrowDown,
  Filter,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Download,
  Copy,
  RefreshCw,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Table,
  BarChart3,
  X,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ChartToolbarProps {
  title: string
  onSortAsc?: () => void
  onSortDesc?: () => void
  onFilter?: (filters: string[]) => void
  onRefresh?: () => void
  onExport?: (format: "csv" | "json" | "png") => void
  onFullscreen?: (isFullscreen: boolean) => void
  filterOptions?: { label: string; value: string; checked: boolean }[]
  showSortButtons?: boolean
  children?: React.ReactNode
  data?: any[]
}

export function ChartToolbar({
  title,
  onSortAsc,
  onSortDesc,
  onFilter,
  onRefresh,
  onExport,
  onFullscreen,
  filterOptions = [],
  showSortButtons = true,
  children,
  data = [],
}: ChartToolbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [localFilters, setLocalFilters] = useState(filterOptions)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFullscreen = () => {
    const newState = !isFullscreen
    setIsFullscreen(newState)
    onFullscreen?.(newState)
  }

  const handleFilterChange = (value: string, checked: boolean) => {
    const updated = localFilters.map((f) =>
      f.value === value ? { ...f, checked } : f
    )
    setLocalFilters(updated)
    onFilter?.(updated.filter((f) => f.checked).map((f) => f.value))
  }

  const handleExportCSV = () => {
    if (data.length === 0) return
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((row) => Object.values(row).join(",")).join("\n")
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    onExport?.("csv")
  }

  const handleExportJSON = () => {
    if (data.length === 0) return
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    onExport?.("json")
  }

  const handleCopyData = async () => {
    if (data.length === 0) return
    const text = JSON.stringify(data, null, 2)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatValue = (value: any) => {
    if (typeof value === "number") {
      return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
    }
    return String(value)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{title}</h3>
        <div className="flex items-center gap-1">
          {showSortButtons && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
                onClick={onSortAsc}
                title="Ordenar Crescente"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
                onClick={onSortDesc}
                title="Ordenar Decrescente"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </>
          )}

          {filterOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
                  title="Filtrar"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0d1e36] border-[#1e4976] min-w-[200px]">
                <DropdownMenuLabel className="text-[#8ca8c4]">Filtros</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#1e4976]" />
                {localFilters.map((filter) => (
                  <DropdownMenuCheckboxItem
                    key={filter.value}
                    checked={filter.checked}
                    onCheckedChange={(checked) =>
                      handleFilterChange(filter.value, checked)
                    }
                    className="text-white hover:bg-[#1e4976] focus:bg-[#1e4976]"
                  >
                    {filter.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator className="bg-[#1e4976]" />
                <DropdownMenuItem
                  className="text-[#00d4aa] hover:bg-[#1e4976] focus:bg-[#1e4976]"
                  onClick={() => {
                    const allChecked = localFilters.map((f) => ({ ...f, checked: true }))
                    setLocalFilters(allChecked)
                    onFilter?.(allChecked.map((f) => f.value))
                  }}
                >
                  Selecionar Todos
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-400 hover:bg-[#1e4976] focus:bg-[#1e4976]"
                  onClick={() => {
                    const allUnchecked = localFilters.map((f) => ({ ...f, checked: false }))
                    setLocalFilters(allUnchecked)
                    onFilter?.([])
                  }}
                >
                  Limpar Filtros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
            onClick={() => setShowTable(!showTable)}
            title={showTable ? "Ver Grafico" : "Ver Tabela"}
          >
            {showTable ? <BarChart3 className="h-4 w-4" /> : <Table className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
            onClick={handleFullscreen}
            title={isFullscreen ? "Minimizar" : "Maximizar"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
                title="Mais opcoes"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0d1e36] border-[#1e4976]">
              <DropdownMenuItem
                className="text-white hover:bg-[#1e4976] focus:bg-[#1e4976]"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Dados
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e4976]" />
              <DropdownMenuItem
                className="text-white hover:bg-[#1e4976] focus:bg-[#1e4976]"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-white hover:bg-[#1e4976] focus:bg-[#1e4976]"
                onClick={handleExportJSON}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e4976]" />
              <DropdownMenuItem
                className="text-white hover:bg-[#1e4976] focus:bg-[#1e4976]"
                onClick={handleCopyData}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copiado!" : "Copiar Dados"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showTable && data.length > 0 && (
        <div className="mb-4 max-h-[200px] overflow-auto rounded border border-[#1e4976]">
          <table className="w-full text-sm">
            <thead className="bg-[#1e4976] sticky top-0">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="text-left p-2 text-[#8ca8c4] font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-[#1e4976]/50 hover:bg-[#1e4976]/20">
                  {Object.values(row).map((value, j) => (
                    <td key={j} className="p-2 text-white">
                      {formatValue(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="bg-[#0d1e36] border-[#1e4976] max-w-[90vw] max-h-[90vh] w-full">
          <DialogHeader>
            <DialogTitle className="text-white">{title}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh]">{children}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
