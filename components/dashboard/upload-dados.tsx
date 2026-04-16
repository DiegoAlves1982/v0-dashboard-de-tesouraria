"use client"

import { useState, useCallback } from "react"
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2, Info, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import * as XLSX from "xlsx"

interface UploadDadosProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataProcessed: (dados: any) => void
}

export function UploadDados({ open, onOpenChange, onDataProcessed }: UploadDadosProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [saldoInicial, setSaldoInicial] = useState("")

  const processarArquivo = async (selectedFile: File) => {
    setFile(selectedFile)
    setStatus("processing")
    setProgress(10)
    setMessage("Lendo arquivo...")

    try {
      let dataToSend: FormData

      // Se for Excel, converte para JSON primeiro
      if (selectedFile.name.toLowerCase().endsWith(".xlsx") || selectedFile.name.toLowerCase().endsWith(".xls")) {
        setProgress(30)
        setMessage("Convertendo Excel...")
        
        const arrayBuffer = await selectedFile.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: "array" })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        
        // Cria um blob JSON para enviar
        const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: "application/json" })
        const jsonFile = new File([jsonBlob], selectedFile.name.replace(/\.xlsx?$/i, ".json"), { type: "application/json" })
        
        dataToSend = new FormData()
        dataToSend.append("file", jsonFile)
        dataToSend.append("saldoInicial", saldoInicial || "0")
      } else {
        dataToSend = new FormData()
        dataToSend.append("file", selectedFile)
        dataToSend.append("saldoInicial", saldoInicial || "0")
      }

      setProgress(50)
      setMessage("Processando dados...")

      const response = await fetch("/api/processar-dados", {
        method: "POST",
        body: dataToSend,
      })

      setProgress(80)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao processar arquivo")
      }

      setProgress(100)
      setStatus("success")
      setMessage(result.message)

      // Salva no localStorage para persistência
      localStorage.setItem("dashboard_dados", JSON.stringify(result.dados))
      localStorage.setItem("dashboard_ultima_atualizacao", new Date().toISOString())

      // Notifica o componente pai
      onDataProcessed(result.dados)

      // Fecha o modal após 2 segundos
      setTimeout(() => {
        onOpenChange(false)
        resetState()
      }, 2000)

    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Erro desconhecido")
    }
  }

  const resetState = () => {
    setFile(null)
    setStatus("idle")
    setProgress(0)
    setMessage("")
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const validExtensions = [".csv", ".xlsx", ".xls", ".json"]
      const isValid = validExtensions.some(ext => droppedFile.name.toLowerCase().endsWith(ext))
      
      if (isValid) {
        processarArquivo(droppedFile)
      } else {
        setStatus("error")
        setMessage("Formato nao suportado. Use CSV, Excel (.xlsx, .xls) ou JSON.")
      }
    }
  }, [saldoInicial])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processarArquivo(selectedFile)
    }
  }

  const downloadModelo = () => {
    const modelo = `data,valor,tipo,categoria,cliente_fornecedor,vencimento,empresa
2024-01-15,45000.00,receita,Locacao Maquinas,Cliente ABC,2024-01-20,Principal
2024-01-15,-8500.00,despesa,Folha de Pagamento,Funcionarios,2024-01-20,Principal
2024-01-16,32000.00,receita,Servicos Manutencao,Cliente XYZ,2024-01-25,Filial 1
2024-01-18,-4200.00,despesa,Combustivel,Posto Central,2024-01-18,Principal
2024-01-20,67500.00,receita,Venda Equipamento,Cliente DEF,2024-02-05,Principal`
    
    const blob = new Blob([modelo], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "modelo_dados_financeiros.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetState()
      onOpenChange(newOpen)
    }}>
      <DialogContent className="bg-[var(--card)] border-[var(--border)] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-[var(--conth-green)]" />
            Importar Dados Financeiros
          </DialogTitle>
          <DialogDescription className="text-[var(--muted-foreground)]">
            Faca upload de sua planilha Excel, CSV ou JSON com os dados financeiros
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Saldo Inicial */}
          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Saldo Inicial em Caixa (opcional)</label>
            <Input
              type="text"
              placeholder="Ex: 500000.00"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              className="bg-transparent border-[var(--border)] text-white placeholder:text-[var(--muted-foreground)]/60"
            />
          </div>

          {/* Area de Drop */}
          {status === "idle" && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-[var(--conth-green)] bg-[var(--conth-green)]/10"
                  : "border-[var(--border)] hover:border-[var(--conth-green)]/60"
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-[var(--conth-green)]" />

              <p className="text-white font-medium mb-2">
                Arraste sua planilha aqui
              </p>
              <p className="text-[var(--muted-foreground)] text-sm mb-4">
                ou clique para selecionar
              </p>

              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-2 py-1 bg-[var(--secondary)] rounded text-[var(--muted-foreground)]">CSV</span>
                <span className="px-2 py-1 bg-[var(--secondary)] rounded text-[var(--muted-foreground)]">Excel (.xlsx)</span>
                <span className="px-2 py-1 bg-[var(--secondary)] rounded text-[var(--muted-foreground)]">Excel (.xls)</span>
                <span className="px-2 py-1 bg-[var(--secondary)] rounded text-[var(--muted-foreground)]">JSON</span>
              </div>
            </div>
          )}

          {/* Status de Processamento */}
          {status === "processing" && (
            <div className="border border-[var(--border)] rounded-lg p-6 text-center">
              <Loader2 className="h-10 w-10 mx-auto mb-4 text-[var(--conth-green)] animate-spin" />
              <p className="text-white font-medium mb-2">{file?.name}</p>
              <p className="text-[var(--muted-foreground)] text-sm mb-4">{message}</p>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Sucesso */}
          {status === "success" && (
            <div className="border border-[var(--conth-green)] bg-[var(--conth-green)]/10 rounded-lg p-6 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-4 text-[var(--conth-green)]" />
              <p className="text-white font-medium mb-2">Dados Importados com Sucesso!</p>
              <p className="text-[var(--muted-foreground)] text-sm">{message}</p>
            </div>
          )}

          {/* Erro */}
          {status === "error" && (
            <div className="border border-red-500 bg-red-500/10 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">Erro ao Processar</p>
                  <p className="text-[var(--muted-foreground)] text-sm mb-3">{message}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetState}
                    className="border-red-500 text-red-400 hover:bg-red-500/20"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Informacoes sobre formato */}
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[var(--conth-green)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white text-sm font-medium mb-2">Colunas Aceitas:</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-[var(--muted-foreground)]">
                  <span>• data / date / dt_lanc</span>
                  <span>• valor / value / total</span>
                  <span>• tipo / natureza</span>
                  <span>• categoria / classificacao</span>
                  <span>• cliente / fornecedor</span>
                  <span>• vencimento / due_date</span>
                  <span>• empresa / filial</span>
                  <span>• descricao / historico</span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Modelo */}
          <Button
            variant="outline"
            className="w-full border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-white"
            onClick={downloadModelo}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Modelo de Planilha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
