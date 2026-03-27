"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, RefreshCw, MoreHorizontal, Download, Copy, Check, Settings2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  DialogDescription,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PredictabilityData {
  perpetuidadeCaixa: {
    meses: number
    saldoAtual: number
    mediaGastos: number
  }
  pontoEquilibrio: {
    valor: number
    percentualAtingido: number
    faltante: number
  }
  ebitda: {
    valor: number
    margem: number
    variacao: number
  }
}

const data: PredictabilityData = {
  perpetuidadeCaixa: {
    meses: 11.94,
    saldoAtual: 872660,
    mediaGastos: 73058.80,
  },
  pontoEquilibrio: {
    valor: 438350,
    percentualAtingido: 85.2,
    faltante: 64750,
  },
  ebitda: {
    valor: 285000,
    margem: 21.8,
    variacao: 12.5,
  },
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(2)} Mi`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(2)} Mil`
  }
  return `R$ ${value.toFixed(2)}`
}

export function PredictabilityCards() {
  const [localData, setLocalData] = useState(data)
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [simulatorType, setSimulatorType] = useState<"perpetuidade" | "equilibrio" | "ebitda">("perpetuidade")
  
  // Simulation values
  const [simSaldo, setSimSaldo] = useState(localData.perpetuidadeCaixa.saldoAtual)
  const [simGastos, setSimGastos] = useState(localData.perpetuidadeCaixa.mediaGastos)
  const [simReceita, setSimReceita] = useState(500000)
  const [simDespesas, setSimDespesas] = useState(350000)

  const handleRefresh = (card: string) => {
    setIsRefreshing(card)
    setTimeout(() => {
      setIsRefreshing(null)
      // Simulate data update
      setLocalData(prev => ({
        ...prev,
        perpetuidadeCaixa: {
          ...prev.perpetuidadeCaixa,
          meses: prev.perpetuidadeCaixa.meses + (Math.random() - 0.5) * 0.5
        }
      }))
    }, 1000)
  }

  const handleCopy = async (card: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(card)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleExport = (card: string, cardData: object) => {
    const json = JSON.stringify({ card, ...cardData, exportDate: new Date().toISOString() }, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${card}_${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const openSimulator = (type: "perpetuidade" | "equilibrio" | "ebitda") => {
    setSimulatorType(type)
    setShowSimulator(true)
  }

  const calculatePerpetuidade = () => {
    return simGastos > 0 ? simSaldo / simGastos : 0
  }

  const calculatePontoEquilibrio = () => {
    return simReceita > 0 ? ((simReceita - simDespesas) / simReceita) * 100 : 0
  }

  const calculateEbitda = () => {
    return simReceita - simDespesas
  }

  const CardToolbar = ({ card, text, cardData }: { card: string; text: string; cardData: object }) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
        onClick={() => handleRefresh(card)}
      >
        <RefreshCw className={cn("h-3 w-3", isRefreshing === card && "animate-spin")} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-[#8ca8c4] hover:text-white hover:bg-[#1e4976]"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#0d1e36] border-[#1e4976]">
          <DropdownMenuItem className="text-white hover:bg-[#1e4976]" onClick={() => handleCopy(card, text)}>
            {copied === card ? <Check className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied === card ? "Copiado!" : "Copiar"}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-white hover:bg-[#1e4976]" onClick={() => handleExport(card, cardData)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#1e4976]" />
          <DropdownMenuItem 
            className="text-[#00d4aa] hover:bg-[#1e4976]" 
            onClick={() => openSimulator(card as any)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Simulador
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Perpetuidade do Caixa */}
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-5 hover:border-[#00d4aa]/50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00d4aa]/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-[#00d4aa]" />
            </div>
            <h3 className="text-white font-semibold">Perpetuidade do Caixa</h3>
          </div>
          <CardToolbar 
            card="perpetuidade" 
            text={`Perpetuidade: ${localData.perpetuidadeCaixa.meses.toFixed(2)} meses`}
            cardData={localData.perpetuidadeCaixa}
          />
        </div>
        <div className="text-4xl font-bold text-[#00d4aa] mb-2">
          {localData.perpetuidadeCaixa.meses.toFixed(2)}
          <span className="text-lg ml-1">meses</span>
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Saldo Atual</span>
            <span className="text-white">{formatCurrency(localData.perpetuidadeCaixa.saldoAtual)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Media de Gastos</span>
            <span className="text-white">{formatCurrency(localData.perpetuidadeCaixa.mediaGastos)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#1e4976]">
          <div className="w-full bg-[#1a3a5c] rounded-full h-2">
            <div
              className="bg-[#00d4aa] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((localData.perpetuidadeCaixa.meses / 24) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#8ca8c4] mt-1">
            <span>0 meses</span>
            <span>24 meses</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 border-[#1e4976] text-[#00d4aa] hover:bg-[#1e4976]"
          onClick={() => openSimulator("perpetuidade")}
        >
          <Settings2 className="h-4 w-4 mr-2" />
          Simular Cenarios
        </Button>
      </div>

      {/* Ponto de Equilibrio */}
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-5 hover:border-[#3b82f6]/50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3b82f6]/20 rounded-lg">
              <Target className="w-5 h-5 text-[#3b82f6]" />
            </div>
            <h3 className="text-white font-semibold">Ponto de Equilibrio</h3>
          </div>
          <CardToolbar 
            card="equilibrio" 
            text={`Ponto de Equilibrio: ${formatCurrency(localData.pontoEquilibrio.valor)}`}
            cardData={localData.pontoEquilibrio}
          />
        </div>
        <div className="text-4xl font-bold text-[#3b82f6] mb-2">
          {formatCurrency(localData.pontoEquilibrio.valor)}
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Atingido</span>
            <span className="text-[#22c55e]">{localData.pontoEquilibrio.percentualAtingido}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Faltante</span>
            <span className="text-[#f59e0b]">{formatCurrency(localData.pontoEquilibrio.faltante)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#1e4976]">
          <div className="w-full bg-[#1a3a5c] rounded-full h-2">
            <div
              className="bg-[#3b82f6] h-2 rounded-full transition-all duration-500"
              style={{ width: `${localData.pontoEquilibrio.percentualAtingido}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#8ca8c4] mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 border-[#1e4976] text-[#3b82f6] hover:bg-[#1e4976]"
          onClick={() => openSimulator("equilibrio")}
        >
          <Settings2 className="h-4 w-4 mr-2" />
          Simular Cenarios
        </Button>
      </div>

      {/* EBITDA */}
      <div className="bg-[#0d1e36] border border-[#1e4976] rounded-lg p-5 hover:border-[#22c55e]/50 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#22c55e]/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-[#22c55e]" />
            </div>
            <h3 className="text-white font-semibold">EBITDA</h3>
          </div>
          <CardToolbar 
            card="ebitda" 
            text={`EBITDA: ${formatCurrency(localData.ebitda.valor)}`}
            cardData={localData.ebitda}
          />
        </div>
        <div className="text-4xl font-bold text-[#22c55e] mb-2">
          {formatCurrency(localData.ebitda.valor)}
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Margem EBITDA</span>
            <span className="text-white">{localData.ebitda.margem}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8ca8c4]">Variacao</span>
            <span className="text-[#22c55e] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +{localData.ebitda.variacao}%
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#1e4976]">
          <div className="w-full bg-[#1a3a5c] rounded-full h-2">
            <div
              className="bg-[#22c55e] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(localData.ebitda.margem * 3, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#8ca8c4] mt-1">
            <span>0%</span>
            <span>33%+ Excelente</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3 border-[#1e4976] text-[#22c55e] hover:bg-[#1e4976]"
          onClick={() => openSimulator("ebitda")}
        >
          <Settings2 className="h-4 w-4 mr-2" />
          Simular Cenarios
        </Button>
      </div>
    </div>

    {/* Simulator Dialog */}
    <Dialog open={showSimulator} onOpenChange={setShowSimulator}>
      <DialogContent className="bg-[#0d1e36] border-[#1e4976] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Simulador de Cenarios - {simulatorType === "perpetuidade" ? "Perpetuidade" : simulatorType === "equilibrio" ? "Ponto de Equilibrio" : "EBITDA"}
          </DialogTitle>
          <DialogDescription className="text-[#8ca8c4]">
            Ajuste os valores para simular diferentes cenarios financeiros
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {simulatorType === "perpetuidade" && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-white text-sm">Saldo em Caixa</label>
                  <span className="text-[#00d4aa] font-medium">{formatCurrency(simSaldo)}</span>
                </div>
                <Slider
                  value={[simSaldo]}
                  onValueChange={([v]) => setSimSaldo(v)}
                  max={2000000}
                  step={10000}
                  className="w-full"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-white text-sm">Media de Gastos Mensais</label>
                  <span className="text-red-400 font-medium">{formatCurrency(simGastos)}</span>
                </div>
                <Slider
                  value={[simGastos]}
                  onValueChange={([v]) => setSimGastos(v)}
                  max={200000}
                  step={1000}
                  className="w-full"
                />
              </div>
              <div className="bg-[#1e4976]/30 rounded-lg p-4 text-center">
                <p className="text-[#8ca8c4] text-sm mb-1">Resultado da Simulacao</p>
                <p className="text-3xl font-bold text-[#00d4aa]">
                  {calculatePerpetuidade().toFixed(2)} meses
                </p>
                <p className="text-xs text-[#8ca8c4] mt-2 flex items-center justify-center gap-1">
                  <Info className="h-3 w-3" />
                  Tempo que o caixa atual suportaria os gastos
                </p>
              </div>
            </>
          )}

          {simulatorType === "equilibrio" && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-white text-sm">Receita Mensal</label>
                  <span className="text-emerald-400 font-medium">{formatCurrency(simReceita)}</span>
                </div>
                <Slider
                  value={[simReceita]}
                  onValueChange={([v]) => setSimReceita(v)}
                  max={1000000}
                  step={5000}
                  className="w-full"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-white text-sm">Despesas Mensais</label>
                  <span className="text-red-400 font-medium">{formatCurrency(simDespesas)}</span>
                </div>
                <Slider
                  value={[simDespesas]}
                  onValueChange={([v]) => setSimDespesas(v)}
                  max={800000}
                  step={5000}
                  className="w-full"
                />
              </div>
              <div className="bg-[#1e4976]/30 rounded-lg p-4 text-center">
                <p className="text-[#8ca8c4] text-sm mb-1">Margem de Lucro</p>
                <p className={cn(
                  "text-3xl font-bold",
                  calculatePontoEquilibrio() >= 0 ? "text-[#3b82f6]" : "text-red-400"
                )}>
                  {calculatePontoEquilibrio().toFixed(1)}%
                </p>
                <p className="text-xs text-[#8ca8c4] mt-2">
                  {simReceita > simDespesas ? "Acima do ponto de equilibrio" : "Abaixo do ponto de equilibrio"}
                </p>
              </div>
            </>
          )}

          {simulatorType === "ebitda" && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-white text-sm">Receita Operacional</label>
                  <span className="text-emerald-400 font-medium">{formatCurrency(simReceita)}</span>
                </div>
                <Slider
                  value={[simReceita]}
                  onValueChange={([v]) => setSimReceita(v)}
                  max={1500000}
                  step={10000}
                  className="w-full"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-white text-sm">Despesas Operacionais</label>
                  <span className="text-red-400 font-medium">{formatCurrency(simDespesas)}</span>
                </div>
                <Slider
                  value={[simDespesas]}
                  onValueChange={([v]) => setSimDespesas(v)}
                  max={1000000}
                  step={10000}
                  className="w-full"
                />
              </div>
              <div className="bg-[#1e4976]/30 rounded-lg p-4 text-center">
                <p className="text-[#8ca8c4] text-sm mb-1">EBITDA Simulado</p>
                <p className={cn(
                  "text-3xl font-bold",
                  calculateEbitda() >= 0 ? "text-[#22c55e]" : "text-red-400"
                )}>
                  {formatCurrency(calculateEbitda())}
                </p>
                <p className="text-xs text-[#8ca8c4] mt-2">
                  Margem: {simReceita > 0 ? ((calculateEbitda() / simReceita) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-[#1e4976] text-[#8ca8c4] hover:bg-[#1e4976]"
            onClick={() => {
              setSimSaldo(localData.perpetuidadeCaixa.saldoAtual)
              setSimGastos(localData.perpetuidadeCaixa.mediaGastos)
              setSimReceita(500000)
              setSimDespesas(350000)
            }}
          >
            Resetar
          </Button>
          <Button
            className="flex-1 bg-[#00d4aa] text-[#0a1628] hover:bg-[#00b894]"
            onClick={() => setShowSimulator(false)}
          >
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
