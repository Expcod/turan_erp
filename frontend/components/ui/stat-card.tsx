import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "blue" | "green" | "yellow" | "purple" | "red"
}

export function StatCard({ title, value, icon: Icon, trend, color = "blue" }: StatCardProps) {
  const colors = {
    blue: {
      bg: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/20",
      light: "bg-blue-50",
    },
    green: {
      bg: "from-green-500 to-green-600",
      shadow: "shadow-green-500/20",
      light: "bg-green-50",
    },
    yellow: {
      bg: "from-yellow-400 to-yellow-500",
      shadow: "shadow-yellow-500/20",
      light: "bg-yellow-50",
    },
    purple: {
      bg: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-500/20",
      light: "bg-purple-50",
    },
    red: {
      bg: "from-red-500 to-red-600",
      shadow: "shadow-red-500/20",
      light: "bg-red-50",
    },
  }

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-[0_8px_32px_rgba(37,99,235,0.06)] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {trend && (
            <p className={cn("text-sm mt-1", trend.isPositive ? "text-green-600" : "text-red-600")}>
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
            colors[color].bg,
            colors[color].shadow,
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}
