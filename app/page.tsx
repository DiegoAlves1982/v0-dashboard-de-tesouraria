"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ForecastChart } from "@/components/dashboard/forecast-chart"
import { RevenueBarChart } from "@/components/dashboard/revenue-bar-chart"
import { AccumulatedChart } from "@/components/dashboard/accumulated-chart"
import { EntriesDonutChart } from "@/components/dashboard/entries-donut-chart"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <DashboardHeader />

      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-[#0d1e36] border border-[#1e4976]">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#1e4976] data-[state=active]:text-white text-[#8ca8c4]"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-[#1e4976] data-[state=active]:text-white text-[#8ca8c4]"
            >
              Detalhes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="Receita Total"
                value="R$ 1,31 Mi"
                subtitle="Liquido R$ 872,66 Mil"
                subtitle2="% Caixa Atual ▲ +66,6%"
                valueColor="positive"
              />
              <KPICard
                title="Saídas"
                value="-R$ 438,35 Mil"
                subtitle2="% Saídas ▼ -33,4%"
                valueColor="negative"
              />
              <KPICard
                title="Média de Saídas Mensais"
                value="-R$ 73.058,80"
                subtitle="Perpetuidade em Meses 11,94"
                valueColor="negative"
              />
              <KPICard
                title="Cartão Ticket Médio"
                value="R$ 1.992,42"
                trend={17.3}
                subtitle="Ticket Médio Previsto R$ 2.336,12"
                valueColor="positive"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <AccumulatedChart />
              </div>
              <div>
                <EntriesDonutChart />
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="mb-6">
              <ForecastChart />
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            {/* Forecast and Revenue Charts */}
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
