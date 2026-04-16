"use client"

import { useDashboardData } from "@/contexts/dashboard-data-context"
import { DailyCashflowChart } from "./daily-cashflow-chart"
import { RevenueExpensesChart } from "./revenue-expenses-chart"
import { InventoryChart } from "./inventory-chart"
import { PredictabilityCards } from "./predictability-cards"

export function ChartsWithData() {
  const { dados } = useDashboardData()

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DailyCashflowChart data={dados.fluxoCaixa} />
        <RevenueExpensesChart data={dados.receitasDespesas} />
      </div>

      <div className="mb-6">
        <InventoryChart data={dados.estoque} />
      </div>

      <div className="mb-6">
        <PredictabilityCards data={dados.previsibilidade} />
      </div>
    </>
  )
}
