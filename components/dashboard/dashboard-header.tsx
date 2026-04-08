"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar, Download, RefreshCw, Bell, Printer, X, Upload, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UploadDados } from "./upload-dados"
import { useDashboardData } from "@/contexts/dashboard-data-context"
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

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: "info" | "warning" | "success" | "error"
}

const initialNotifications: Notification[] = [
  { id: "1", title: "Vencimento Proximo", message: "5 faturas vencem nos proximos 3 dias", time: "5 min", read: false, type: "warning" },
  { id: "2", title: "Meta Atingida", message: "Receita do mes atingiu 100% da meta", time: "1 hora", read: false, type: "success" },
  { id: "3", title: "Novo Cliente", message: "TRUCKS CONTROL adicionado ao sistema", time: "2 horas", read: false, type: "info" },
  { id: "4", title: "Pagamento Atrasado", message: "3 pagamentos estao em atraso", time: "3 horas", read: true, type: "error" },
  { id: "5", title: "Relatorio Disponivel", message: "Relatorio mensal de fevereiro pronto", time: "1 dia", read: true, type: "info" },
]

export function DashboardHeader() {
  const [dateRange, setDateRange] = useState([25, 75])
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 9, 25))
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 2, 5))
  const [selectedCompany, setSelectedCompany] = useState("todos")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  
  // Dashboard data context
  const { setDados, isDemoData, ultimaAtualizacao, limparDados } = useDashboardData()
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [showNotifications, setShowNotifications] = useState(false)
  


  const unreadCount = notifications.filter(n => !n.read).length

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false)
      // Add a new notification on refresh
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: "Dados Atualizados",
        message: "Dashboard atualizado com sucesso",
        time: "agora",
        read: false,
        type: "success"
      }
      setNotifications(prev => [newNotification, ...prev])
    }, 1500)
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success": return "bg-emerald-500"
      case "warning": return "bg-amber-500"
      case "error": return "bg-red-500"
      default: return "bg-blue-500"
    }
  }

  const handleExportAll = (formatType: string) => {
    const data = {
      exportDate: new Date().toISOString(),
      dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
      company: selectedCompany,
    }
    
    const dateStr = format(new Date(), "yyyy-MM-dd")
    
    if (formatType === "csv") {
      const csv = Object.entries(data).map(([k, v]) => `${k},${JSON.stringify(v)}`).join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard_export_${dateStr}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else if (formatType === "json") {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard_export_${dateStr}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (formatType === "print") {
      window.print()
    }
  }



  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-[#0a1628] border-b border-[#1e4976]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/conth-logo.png"
            alt="CONTH Inteligencia Financeira"
            width={140}
            height={50}
            className="h-auto w-auto max-h-[50px]"
            priority
          />
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

          {/* Notifications Popover */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976] relative"
                title="Notificacoes"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#0d1e36] border-[#1e4976]" align="end">
              <div className="flex items-center justify-between p-3 border-b border-[#1e4976]">
                <h4 className="text-white font-semibold">Notificacoes</h4>
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-[#00d4aa] hover:bg-[#1e4976]"
                      onClick={markAllAsRead}
                    >
                      Marcar todas como lidas
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[#8ca8c4]">
                    Nenhuma notificacao
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-[#1e4976]/50 hover:bg-[#1e4976]/30 cursor-pointer ${
                        !notification.read ? "bg-[#1e4976]/20" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationColor(notification.type)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${notification.read ? "text-[#8ca8c4]" : "text-white"}`}>
                              {notification.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-[#8ca8c4] hover:text-red-400"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-[#8ca8c4] truncate">{notification.message}</p>
                          <p className="text-xs text-[#8ca8c4]/70 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t border-[#1e4976]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-red-400 hover:bg-[#1e4976]"
                    onClick={clearAllNotifications}
                  >
                    Limpar todas
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

        </div>
      </div>
    </header>
  )
}
