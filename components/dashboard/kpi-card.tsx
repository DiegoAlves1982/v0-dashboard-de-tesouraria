"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  subtitle2?: string
  trend?: number
  trendLabel?: string
  valueColor?: "default" | "positive" | "negative"
}

export function KPICard({
  title,
  value,
  subtitle,
  subtitle2,
  trend,
  trendLabel,
  valueColor = "default",
}: KPICardProps) {
  const valueColorClass = {
    default: "text-white",
    positive: "text-emerald-400",
    negative: "text-red-400",
  }

  return (
    <Card className="bg-[#0d1e36] border-[#1e4976] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e4976]/20 to-transparent pointer-events-none" />
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
            <p className="text-sm text-[#8ca8c4] mt-1">{title}</p>
          </div>
        </div>
        {(subtitle || subtitle2) && (
          <div className="mt-3 pt-3 border-t border-[#1e4976]/50 space-y-1">
            {subtitle && (
              <p className="text-sm">
                <span className="text-[#8ca8c4]">{subtitle.split(" ")[0]} </span>
                <span className="text-emerald-400 font-medium">
                  {subtitle.split(" ").slice(1).join(" ")}
                </span>
              </p>
            )}
            {subtitle2 && (
              <p className="text-sm">
                <span className="text-[#8ca8c4]">{subtitle2.split(" ")[0]} </span>
                <span
                  className={cn(
                    "font-medium",
                    subtitle2.includes("-") || subtitle2.includes("▼")
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
  )
}
