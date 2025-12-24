"use client"

import { cn } from "@/lib/utils"
import { Check, X, Minus } from "lucide-react"

interface Student {
  id: string
  name: string
  avatar?: string
}

type AttendanceStatus = "present" | "absent" | "late" | "excused" | null

interface AttendanceTableProps {
  students: Student[]
  attendance: Record<string, AttendanceStatus>
  onStatusChange?: (studentId: string, status: AttendanceStatus) => void
  readonly?: boolean
}

export function AttendanceTable({ students, attendance, onStatusChange, readonly = false }: AttendanceTableProps) {
  const statusStyles: Record<string, string> = {
    present: "bg-green-500 text-white",
    absent: "bg-red-500 text-white",
    late: "bg-yellow-500 text-white",
    excused: "bg-blue-500 text-white",
  }

  const StatusIcon = ({ status }: { status: AttendanceStatus }) => {
    if (!status || status === "excused") return <Minus size={14} />
    if (status === "present") return <Check size={14} />
    if (status === "absent") return <X size={14} />
    return <Check size={14} />
  }

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-[0_8px_32px_rgba(37,99,235,0.06)] overflow-hidden">
      <div className="px-6 py-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
        <h3 className="font-semibold text-slate-800">Attendance</h3>
      </div>
      <div className="divide-y divide-blue-50">
        {students.map((student) => (
          <div key={student.id} className="flex items-center justify-between px-6 py-3 hover:bg-blue-50/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
                {student.avatar || student.name.charAt(0)}
              </div>
              <span className="font-medium text-slate-700">{student.name}</span>
            </div>

            {readonly ? (
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  attendance[student.id] ? statusStyles[attendance[student.id]!] : "bg-slate-100 text-slate-400",
                )}
              >
                <StatusIcon status={attendance[student.id]} />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {(["present", "late", "absent", "excused"] as AttendanceStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange?.(student.id, status)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      attendance[student.id] === status
                        ? statusStyles[status!]
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200",
                    )}
                    title={status || "none"}
                  >
                    <StatusIcon status={status} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
