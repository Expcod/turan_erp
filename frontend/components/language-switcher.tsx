"use client"

import { useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/50 backdrop-blur-sm p-1 border border-blue-100">
      <button
        onClick={() => setLanguage("uz")}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          language === "uz" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50",
        )}
      >
        UZ
      </button>
      <button
        onClick={() => setLanguage("tr")}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          language === "tr" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50",
        )}
      >
        TR
      </button>
    </div>
  )
}
