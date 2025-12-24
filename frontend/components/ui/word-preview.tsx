"use client"

import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

interface WordPreviewProps {
  htmlContent?: string
  className?: string
}

export function WordPreview({ htmlContent, className }: WordPreviewProps) {
  if (!htmlContent) {
    return (
      <div
        className={cn(
          "rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-[0_8px_32px_rgba(37,99,235,0.06)] p-8",
          "flex flex-col items-center justify-center min-h-[300px] text-center",
          className,
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-slate-500">No document to preview</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-[0_8px_32px_rgba(37,99,235,0.06)] overflow-hidden",
        className,
      )}
    >
      <div className="px-6 py-3 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-100/50">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-slate-700">Document Preview</span>
        </div>
      </div>
      <div
        className="p-6 prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-600"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  )
}
