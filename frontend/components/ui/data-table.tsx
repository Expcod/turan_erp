"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { GlassButton } from "./glass-button"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  loading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const getValue = (item: T, key: string): unknown => {
    const keys = key.split(".")
    let value: unknown = item
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return undefined
      }
    }
    return value
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-[0_8px_32px_rgba(37,99,235,0.06)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-blue-100/50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-6 py-4 text-left text-sm font-semibold text-slate-700 bg-gradient-to-b from-blue-50/50 to-transparent",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-slate-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  {columns.map((column) => (
                    <td key={String(column.key)} className={cn("px-6 py-4 text-sm text-slate-600", column.className)}>
                      {column.render ? column.render(item) : String(getValue(item, String(column.key)) ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <GlassButton size="sm" variant="ghost" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
              <ChevronsLeft size={16} />
            </GlassButton>
            <GlassButton
              size="sm"
              variant="ghost"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </GlassButton>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200",
                      currentPage === pageNum ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-blue-50",
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <GlassButton
              size="sm"
              variant="ghost"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </GlassButton>
            <GlassButton
              size="sm"
              variant="ghost"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight size={16} />
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  )
}
