"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Download, RefreshCw, Settings, Bell, User, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function DashboardHeader() {
  const [dateRange, setDateRange] = useState([25, 75])
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 9, 25))
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 2, 5))
  const [selectedCompany, setSelectedCompany] = useState("todos")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const handleExportAll = (format: string) => {
    const data = {
      exportDate: new Date().toISOString(),
      dateRange: { start: startDate, end: endDate },
      company: selectedCompany,
    }
    
    if (format === "csv") {
      const csv = Object.entries(data).map(([k, v]) => `${k},${JSON.stringify(v)}`).join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard_export_${format(new Date(), "yyyy-MM-dd")}.csv`
      a.click()
    } else if (format === "json") {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard_export_${format(new Date(), "yyyy-MM-dd")}.json`
      a.click()
    } else if (format === "print") {
      window.print()
    }
  }

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-[#0a1628] border-b border-[#1e4976]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#3b82f6] flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-white tracking-tight">
              CONTH
            </h1>
            <p className="text-[10px] text-[#8ca8c4] uppercase tracking-widest">
              Inteligencia Financeira
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center px-4">
        <div className="bg-gradient-to-r from-[#00d4aa] to-[#00a88a] px-4 lg:px-8 py-2 rounded">
          <h2 className="text-sm lg:text-lg font-bold text-[#0a1628] uppercase tracking-wide text-center">
            Dashboard de Tesouraria e Indicadores Futuros
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-6">
        <div className="hidden lg:flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-[#1e4976] text-white hover:bg-[#1e4976] hover:text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(startDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#0d1e36] border-[#1e4976]">
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  locale={ptBR}
                  className="bg-[#0d1e36] text-white"
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-[#1e4976] text-white hover:bg-[#1e4976] hover:text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(endDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#0d1e36] border-[#1e4976]">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  locale={ptBR}
                  className="bg-[#0d1e36] text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
          <Slider
            value={dateRange}
            onValueChange={setDateRange}
            max={100}
            step={1}
            className="w-[200px]"
          />
        </div>

        <div className="hidden md:flex flex-col gap-1">
          <span className="text-xs text-[#8ca8c4] uppercase tracking-wider">
            Empresa
          </span>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[140px] bg-transparent border-[#1e4976] text-white">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1e36] border-[#1e4976]">
              <SelectItem value="todos" className="text-white hover:bg-[#1e4976]">
                Todos
              </SelectItem>
              <SelectItem value="pr-trucks" className="text-white hover:bg-[#1e4976]">
                PR Trucks
              </SelectItem>
              <SelectItem value="sider-trucks" className="text-white hover:bg-[#1e4976]">
                Sider Trucks
              </SelectItem>
              <SelectItem value="pr-servicos" className="text-white hover:bg-[#1e4976]">
                PR Trucks Servicos
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
            onClick={handleRefresh}
            title="Atualizar Dados"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
                title="Exportar"
              >
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0d1e36] border-[#1e4976]">
              <DropdownMenuItem
                className="text-white hover:bg-[#1e4976]"
                onClick={() => handleExportAll("csv")}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-white hover:bg-[#1e4976]"
                onClick={() => handleExportAll("json")}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e4976]" />
              <DropdownMenuItem
                className="text-white hover:bg-[#1e4976]"
                onClick={() => handleExportAll("print")}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976] relative"
            title="Notificacoes"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
                title="Configuracoes"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0d1e36] border-[#1e4976]">
              <DropdownMenuItem className="text-white hover:bg-[#1e4976]">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#1e4976]">
                <Settings className="h-4 w-4 mr-2" />
                Configuracoes
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e4976]" />
              <DropdownMenuItem className="text-red-400 hover:bg-[#1e4976]">
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
