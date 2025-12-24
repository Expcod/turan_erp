"use client"

import { cn } from "@/lib/utils"
import { Clock, Users, BookOpen } from "lucide-react"
import { GlassButton } from "./glass-button"

interface LessonCardProps {
  week: number
  lessonNumber: number
  title: string
  time?: string
  groupName?: string
  status?: "upcoming" | "ongoing" | "completed"
  onViewDetails?: () => void
}

export function LessonCard({
  week,
  lessonNumber,
  title,
  time,
  groupName,
  status = "upcoming",
  onViewDetails,
}: LessonCardProps) {
  const statusStyles = {
    upcoming: "border-blue-200 bg-blue-50/50",
    ongoing: "border-green-200 bg-green-50/50",
    completed: "border-slate-200 bg-slate-50/50",
  }

  const statusBadge = {
    upcoming: "bg-blue-100 text-blue-700",
    ongoing: "bg-green-100 text-green-700",
    completed: "bg-slate-100 text-slate-600",
  }

  return (
    <div className={cn("rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-lg", statusStyles[status])}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusBadge[status])}>
            Week {week}, Lesson {lessonNumber}
          </span>
          <h3 className="text-lg font-semibold text-slate-800 mt-2">{title}</h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
        {time && (
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{time}</span>
          </div>
        )}
        {groupName && (
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>{groupName}</span>
          </div>
        )}
      </div>

      <GlassButton variant="primary" size="sm" className="w-full" onClick={onViewDetails}>
        View Details
      </GlassButton>
    </div>
  )
}
