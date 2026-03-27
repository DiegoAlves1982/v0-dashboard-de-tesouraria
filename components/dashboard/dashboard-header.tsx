"use client"

import { Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

export function DashboardHeader() {
  const [dateRange, setDateRange] = useState([25, 75])

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#0a1628] border-b border-[#1e4976]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#3b82f6] flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              CONTH
            </h1>
            <p className="text-[10px] text-[#8ca8c4] uppercase tracking-widest">
              Inteligência Financeira
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="bg-gradient-to-r from-[#00d4aa] to-[#00a88a] px-8 py-2 rounded">
          <h2 className="text-lg font-bold text-[#0a1628] uppercase tracking-wide text-center">
            Dashboard de Tesouraria e Indicadores Futuros
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-[#1e4976] text-white hover:bg-[#1e4976] hover:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              25/10/2025
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-[#1e4976] text-white hover:bg-[#1e4976] hover:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              05/03/2026
            </Button>
          </div>
          <Slider
            value={dateRange}
            onValueChange={setDateRange}
            max={100}
            step={1}
            className="w-[200px]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#8ca8c4] uppercase tracking-wider">
            Empresa Origem
          </span>
          <Select defaultValue="todos">
            <SelectTrigger className="w-[160px] bg-transparent border-[#1e4976] text-white">
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
                PR Trucks Serviços
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}
