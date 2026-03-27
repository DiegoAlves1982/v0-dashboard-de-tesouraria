"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ForecastChart } from "@/components/dashboard/forecast-chart"
import { RevenueBarChart } from "@/components/dashboard/revenue-bar-chart"
import { AccumulatedChart } from "@/components/dashboard/accumulated-chart"
import { EntriesDonutChart } from "@/components/dashboard/entries-donut-chart"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { RevenueExpensesChart } from "@/components/dashboard/revenue-expenses-chart"
import { ExpensesCategoryChart } from "@/components/dashboard/expenses-category-chart"
import { RevenueCategoryChart } from "@/components/dashboard/revenue-category-chart"
import { DailyCashflowChart } from "@/components/dashboard/daily-cashflow-chart"
import { TopClientsChart } from "@/components/dashboard/top-clients-chart"
import { GrossProfitChart } from "@/components/dashboard/gross-profit-chart"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { PredictabilityCards } from "@/components/dashboard/predictability-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <DashboardHeader />

      <main className="p-4 lg:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-[#0d1e36] border border-[#1e4976] flex-wrap h-auto gap-1 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#1e4976] data-[state=active]:text-white text-[#8ca8c4] text-xs lg:text-sm"
            >
              Visao Geral
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="data-[state=active]:bg-[#1e4976] data-[state=active]:text-white text-[#8ca8c4] text-xs lg:text-sm"
            >
              Historico
            </TabsTrigger>
            <TabsTrigger
              value="categorias"
              className="data-[state=active]:bg-[#1e4976] data-[state=active]:text-white text-[#8ca8c4] text-xs lg:text-sm"
            >
              Categorias
            </TabsTrigger>
            <TabsTrigger
              value="clientes"
              className="data-[state=active]:bg-[#1e4976] data-[state=active]:text-white text-[#8ca8c4] text-xs lg:text-sm"
            >
              Clientes
            </TabsTrigger>
            <TabsTrigger
              value="previsibilidade"
              className="data-[state=active]:bg-[#1e4976] data-[state=active]:text-white text-[#8ca8c4] text-xs lg:text-sm"
            >
              Previsibilidade
            </TabsTrigger>
            <TabsTrigger
              value="detalhes"
              className="data-[state=active]:bg-[#1e4976] data-[state=active]:text-white text-[#8ca8c4] text-xs lg:text-sm"
            >
              Detalhes
            </TabsTrigger>
          </TabsList>

          {/* Visao Geral */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="Receita Total"
                value="R$ 1,31 Mi"
                subtitle="Liquido R$ 872,66 Mil"
                subtitle2="% Caixa Atual +66,6%"
                valueColor="positive"
                description="Soma de todas as receitas no periodo selecionado, incluindo locacoes, vendas e servicos."
              />
              <KPICard
                title="Saidas"
                value="-R$ 438,35 Mil"
                subtitle2="% Saidas -33,4%"
                valueColor="negative"
                description="Total de despesas e pagamentos realizados no periodo, incluindo folha, impostos e fornecedores."
              />
              <KPICard
                title="Media de Saidas Mensais"
                value="-R$ 73.058,80"
                subtitle="Perpetuidade em Meses 11,94"
                valueColor="negative"
                description="Media mensal de gastos calculada com base nos ultimos 6 meses de operacao."
              />
              <KPICard
                title="Cartao Ticket Medio"
                value="R$ 1.992,42"
                trend={17.3}
                subtitle="Ticket Medio Previsto R$ 2.336,12"
                valueColor="positive"
                description="Valor medio por transacao de venda/locacao no periodo analisado."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <AccumulatedChart />
              </div>
              <div>
                <EntriesDonutChart />
              </div>
            </div>

            <div className="mb-6">
              <ForecastChart />
            </div>
          </TabsContent>

          {/* Historico */}
          <TabsContent value="historico" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <RevenueExpensesChart />
              <DailyCashflowChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GrossProfitChart />
              <InventoryChart />
            </div>
          </TabsContent>

          {/* Categorias */}
          <TabsContent value="categorias" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <RevenueCategoryChart />
              <ExpensesCategoryChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RevenueBarChart />
              <InventoryChart />
            </div>
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="clientes" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <TopClientsChart />
              <EntriesDonutChart />
            </div>

            <PaymentsTable />
          </TabsContent>

          {/* Previsibilidade */}
          <TabsContent value="previsibilidade" className="mt-6">
            <PredictabilityCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              <ForecastChart />
              <DailyCashflowChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
              <GrossProfitChart />
              <RevenueExpensesChart />
            </div>
          </TabsContent>

          {/* Detalhes */}
          <TabsContent value="detalhes" className="mt-6">
            <div className="mb-6">
              <ForecastChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RevenueBarChart />
              <PaymentsTable />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0">
        <div className="text-[200px] font-bold text-[#00d4aa] tracking-widest">
          CONTH
        </div>
      </div>
    </div>
  )
}
