"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, MoreHorizontal, RefreshCw, Download, Copy, Check, Maximize2, Info, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  subtitle2?: string
  trend?: number
  trendLabel?: string
  valueColor?: "default" | "positive" | "negative"
  description?: string
  historicalData?: { date: string; value: number }[]
}

export function KPICard({
  title,
  value,
  subtitle,
  subtitle2,
  trend,
  trendLabel,
  valueColor = "default",
  description,
  historicalData = [],
}: KPICardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const valueColorClass = {
    default: "text-white",
    positive: "text-emerald-400",
    negative: "text-red-400",
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleCopy = async () => {
    const text = `${title}: ${value}${trend !== undefined ? ` (${trend >= 0 ? "+" : ""}${trend}%)` : ""}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    const data = {
      title,
      value,
      trend,
      subtitle,
      subtitle2,
      exportDate: new Date().toISOString()
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Card 
        className="bg-[var(--card)] border-[var(--border)] p-4 relative overflow-hidden transition-all duration-200 hover:border-[var(--conth-green)]/50 hover:shadow-lg hover:shadow-[var(--conth-green)]/10 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowDetails(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)]/20 to-transparent pointer-events-none" />
        
        {/* Toolbar que aparece no hover */}
        <div className={cn(
          "absolute top-2 right-2 flex items-center gap-1 transition-opacity duration-200 z-20",
          isHovered ? "opacity-100" : "opacity-0"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-[var(--muted-foreground)] hover:text-white hover:bg-[var(--secondary)]"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRefresh()
                  }}
                >
                  <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[var(--card)] border-[var(--border)]">
                <p className="text-white text-xs">Atualizar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[var(--muted-foreground)] hover:text-white hover:bg-[var(--secondary)]"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[var(--card)] border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem className="text-white hover:bg-[var(--secondary)]" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copiado!" : "Copiar Valor"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-[#1e4976]" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1e4976]" />
              <DropdownMenuItem className="text-white hover:bg-[var(--secondary)]" onClick={() => setShowDetails(true)}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3
                className={cn(
                  "text-2xl font-bold tracking-tight",
                  valueColorClass[valueColor]
                )}
              >
                {value}
                {trend !== undefined && (
                  <span
                    className={cn(
                      "ml-2 text-sm font-medium inline-flex items-center gap-1",
                      trend >= 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {trend >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {trend >= 0 ? "+" : ""}
                    {trend}%
                  </span>
                )}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{title}</p>
            </div>
          </div>
          {(subtitle || subtitle2) && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]/50 space-y-1">
              {subtitle && (
                <p className="text-sm">
                  <span className="text-[var(--muted-foreground)]">{subtitle.split(" ")[0]} </span>
                  <span className="text-emerald-400 font-medium">
                    {subtitle.split(" ").slice(1).join(" ")}
                  </span>
                </p>
              )}
              {subtitle2 && (
                <p className="text-sm">
                  <span className="text-[var(--muted-foreground)]">{subtitle2.split(" ")[0]} </span>
                  <span
                    className={cn(
                      "font-medium",
                      subtitle2.includes("-") || subtitle2.includes("V")
                        ? "text-red-400"
                        : "text-emerald-400"
                    )}
                  >
                    {subtitle2.split(" ").slice(1).join(" ")}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[var(--card)] border-[var(--border)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4 border-b border-[var(--border)]">
              <p className={cn("text-4xl font-bold", valueColorClass[valueColor])}>
                {value}
              </p>
              {trend !== undefined && (
                <p className={cn(
                  "text-lg flex items-center justify-center gap-1 mt-2",
                  trend >= 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {trend >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {trend >= 0 ? "+" : ""}{trend}% em relacao ao periodo anterior
                </p>
              )}
            </div>
            
            {description && (
              <div className="bg-[var(--secondary)]/30 rounded-lg p-3">
                <p className="text-sm text-[var(--muted-foreground)] flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {description}
                </p>
              </div>
            )}

            {subtitle && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]/50">
                <span className="text-[var(--muted-foreground)]">{subtitle.split(" ")[0]}</span>
                <span className="text-emerald-400 font-medium">{subtitle.split(" ").slice(1).join(" ")}</span>
              </div>
            )}
            
            {subtitle2 && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]/50">
                <span className="text-[var(--muted-foreground)]">{subtitle2.split(" ")[0]}</span>
                <span className={cn(
                  "font-medium",
                  subtitle2.includes("-") || subtitle2.includes("V") ? "text-red-400" : "text-emerald-400"
                )}>
                  {subtitle2.split(" ").slice(1).join(" ")}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copiar
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
