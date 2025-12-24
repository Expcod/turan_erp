"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl px-4 py-2.5 transition-all duration-200",
          "bg-white/80 backdrop-blur-sm",
          "border border-blue-600/15",
          "shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]",
          "placeholder:text-slate-400",
          "focus:outline-none focus:border-blue-500/50",
          "focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1),inset_0_1px_2px_rgba(0,0,0,0.05)]",
          error && "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]",
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
})

GlassInput.displayName = "GlassInput"

export { GlassInput }
