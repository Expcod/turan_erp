import type React from "react"
import { cn } from "@/lib/utils"

type StatusType = "success" | "warning" | "error" | "info" | "pending"

interface StatusBadgeProps {
  status: StatusType
  children: React.ReactNode
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const styles = {
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-slate-100 text-slate-700 border-slate-200",
  }

  const dotStyles = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    pending: "bg-slate-500",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        styles[status],
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotStyles[status])} />
      {children}
    </span>
  )
}
