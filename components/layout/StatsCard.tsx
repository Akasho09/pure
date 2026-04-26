import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  iconBg?: string
  trend?: { value: number; label: string }
}

export function StatsCard({ title, value, subtitle, icon, iconBg = "bg-emerald-100 text-emerald-700" }: StatsCardProps) {
  return (
    <div className="bg-card border rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-display font-bold text-foreground leading-none">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}
