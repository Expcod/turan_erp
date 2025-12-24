"use client"

import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "accent" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const baseStyles = `
      relative overflow-hidden font-medium transition-all duration-300 
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `

    const variants = {
      default: `
        rounded-xl text-slate-700
        bg-gradient-to-br from-white/90 via-white/60 to-white/80
        backdrop-blur-xl saturate-[180%]
        border border-white/50
        shadow-[0_4px_30px_rgba(37,99,235,0.1),inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-1px_0_rgba(0,0,0,0.05)]
        hover:shadow-[0_8px_40px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.05)]
        hover:-translate-y-0.5
        focus:ring-blue-500/30
      `,
      primary: `
        rounded-xl text-white
        bg-gradient-to-br from-blue-600/95 via-blue-500/85 to-blue-600/90
        backdrop-blur-xl saturate-[180%]
        border border-blue-400/50
        shadow-[0_4px_30px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.1)]
        hover:shadow-[0_8px_40px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.1)]
        hover:-translate-y-0.5
        focus:ring-blue-500/50
      `,
      accent: `
        rounded-xl text-yellow-900
        bg-gradient-to-br from-yellow-400/95 via-yellow-300/85 to-yellow-400/90
        backdrop-blur-xl saturate-[180%]
        border border-yellow-200/60
        shadow-[0_4px_30px_rgba(250,204,21,0.25),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.05)]
        hover:shadow-[0_8px_40px_rgba(250,204,21,0.35),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(0,0,0,0.05)]
        hover:-translate-y-0.5
        focus:ring-yellow-500/50
      `,
      ghost: `
        rounded-xl text-slate-600
        bg-transparent
        hover:bg-slate-100/50
        backdrop-blur-sm
        border border-transparent
        hover:border-slate-200/50
        focus:ring-slate-500/30
      `,
      destructive: `
        rounded-xl text-white
        bg-gradient-to-br from-red-600/95 via-red-500/85 to-red-600/90
        backdrop-blur-xl saturate-[180%]
        border border-red-400/50
        shadow-[0_4px_30px_rgba(239,68,68,0.25),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.1)]
        hover:shadow-[0_8px_40px_rgba(239,68,68,0.35),inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(0,0,0,0.1)]
        hover:-translate-y-0.5
        focus:ring-red-500/50
      `,
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    }

    return (
      <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    )
  },
)

GlassButton.displayName = "GlassButton"

export { GlassButton }
