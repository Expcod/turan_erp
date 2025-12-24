import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        "bg-gradient-to-br from-white/95 via-white/90 to-white/80",
        "backdrop-blur-xl saturate-[180%]",
        "border border-white/60",
        "shadow-[0_8px_32px_rgba(37,99,235,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]",
        hover && "transition-all duration-300 hover:shadow-[0_12px_48px_rgba(37,99,235,0.12)] hover:-translate-y-1",
        className,
      )}
    >
      {children}
    </div>
  )
}
