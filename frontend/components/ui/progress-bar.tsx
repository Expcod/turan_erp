import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  color?: "blue" | "green" | "yellow" | "red"
  size?: "sm" | "md" | "lg"
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = "blue",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-400 to-yellow-500",
    red: "from-red-500 to-red-600",
  }

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
          {showValue && <span className="text-sm text-slate-500">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
