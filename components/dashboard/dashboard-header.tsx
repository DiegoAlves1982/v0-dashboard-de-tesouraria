"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Download, RefreshCw, Settings, Bell, User, Printer, X, Check, Moon, Sun, LogOut, HelpCircle, FileText, Database, Palette, Volume2, VolumeX, Globe } from "lucide-react"
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
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
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
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [language, setLanguage] = useState("pt-BR")
  const [currency, setCurrency] = useState("BRL")
  
  // Profile state
  const [showProfile, setShowProfile] = useState(false)

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

  const handleSaveSettings = () => {
    // Save settings logic - would typically save to localStorage or API
    localStorage.setItem("dashboard_settings", JSON.stringify({
      darkMode,
      soundEnabled,
      autoRefresh,
      refreshInterval,
      language,
      currency
    }))
    setShowSettings(false)
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

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
            title="Configuracoes"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
                title="Usuario"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0d1e36] border-[#1e4976]" align="end">
              <DropdownMenuLabel className="text-[#8ca8c4]">
                <div className="flex flex-col">
                  <span className="text-white">Admin</span>
                  <span className="text-xs">admin@conth.com.br</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1e4976]" />
              <DropdownMenuItem className="text-white hover:bg-[#1e4976]" onClick={() => setShowProfile(true)}>
                <User className="h-4 w-4 mr-2" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#1e4976]" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configuracoes
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#1e4976]">
                <HelpCircle className="h-4 w-4 mr-2" />
                Ajuda
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#1e4976]">
                <FileText className="h-4 w-4 mr-2" />
                Documentacao
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e4976]" />
              <DropdownMenuItem className="text-red-400 hover:bg-[#1e4976]">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#0d1e36] border-[#1e4976] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuracoes
            </DialogTitle>
            <DialogDescription className="text-[#8ca8c4]">
              Personalize o dashboard de acordo com suas preferencias
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Appearance */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#8ca8c4] uppercase tracking-wider">Aparencia</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-4 w-4 text-[#8ca8c4]" /> : <Sun className="h-4 w-4 text-[#8ca8c4]" />}
                  <span className="text-white">Modo Escuro</span>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#8ca8c4] uppercase tracking-wider">Notificacoes</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-[#8ca8c4]" /> : <VolumeX className="h-4 w-4 text-[#8ca8c4]" />}
                  <span className="text-white">Sons</span>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
            </div>

            {/* Data */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#8ca8c4] uppercase tracking-wider">Dados</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-[#8ca8c4]" />
                  <span className="text-white">Atualizar Automaticamente</span>
                </div>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              {autoRefresh && (
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-[#8ca8c4] text-sm">Intervalo:</span>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger className="w-24 h-8 bg-transparent border-[#1e4976] text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1e36] border-[#1e4976]">
                      <SelectItem value="15" className="text-white">15s</SelectItem>
                      <SelectItem value="30" className="text-white">30s</SelectItem>
                      <SelectItem value="60" className="text-white">1min</SelectItem>
                      <SelectItem value="300" className="text-white">5min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Regional */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#8ca8c4] uppercase tracking-wider">Regional</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#8ca8c4]" />
                  <span className="text-white">Idioma</span>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32 h-8 bg-transparent border-[#1e4976] text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1e36] border-[#1e4976]">
                    <SelectItem value="pt-BR" className="text-white">Portugues</SelectItem>
                    <SelectItem value="en-US" className="text-white">English</SelectItem>
                    <SelectItem value="es-ES" className="text-white">Espanol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-[#8ca8c4]" />
                  <span className="text-white">Moeda</span>
                </div>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-32 h-8 bg-transparent border-[#1e4976] text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1e36] border-[#1e4976]">
                    <SelectItem value="BRL" className="text-white">BRL (R$)</SelectItem>
                    <SelectItem value="USD" className="text-white">USD ($)</SelectItem>
                    <SelectItem value="EUR" className="text-white">EUR (E)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-[#1e4976] text-[#8ca8c4] hover:bg-[#1e4976]" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#00d4aa] text-[#0a1628] hover:bg-[#00b894]" onClick={handleSaveSettings}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-[#0d1e36] border-[#1e4976] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Meu Perfil
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#3b82f6] flex items-center justify-center">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <div>
                <p className="text-white font-semibold">Administrador</p>
                <p className="text-[#8ca8c4] text-sm">admin@conth.com.br</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[#8ca8c4] text-sm">Nome</label>
                <Input defaultValue="Administrador" className="bg-transparent border-[#1e4976] text-white mt-1" />
              </div>
              <div>
                <label className="text-[#8ca8c4] text-sm">Email</label>
                <Input defaultValue="admin@conth.com.br" className="bg-transparent border-[#1e4976] text-white mt-1" />
              </div>
              <div>
                <label className="text-[#8ca8c4] text-sm">Cargo</label>
                <Input defaultValue="Gerente Financeiro" className="bg-transparent border-[#1e4976] text-white mt-1" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-[#1e4976] text-[#8ca8c4] hover:bg-[#1e4976]" onClick={() => setShowProfile(false)}>
              Cancelar
            </Button>
            <Button className="bg-[#00d4aa] text-[#0a1628] hover:bg-[#00b894]" onClick={() => setShowProfile(false)}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
