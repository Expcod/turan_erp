"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { GlassButton } from "./glass-button"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  type: "lesson" | "homework" | "other"
  groupName?: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  view?: "month" | "week"
}

export function CalendarView({ events, onEventClick, view = "month" }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<"month" | "week">(view)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getWeekDays = (date: Date) => {
    const week: Date[] = []
    const day = date.getDay()
    const diff = date.getDate() - day

    for (let i = 0; i < 7; i++) {
      week.push(new Date(date.getFullYear(), date.getMonth(), diff + i))
    }
    return week
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const navigateWeek = (direction: number) => {
    setCurrentDate(new Date(currentDate.getTime() + direction * 7 * 24 * 60 * 60 * 1000))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const eventTypeColors = {
    lesson: "bg-blue-100 text-blue-700 border-blue-200",
    homework: "bg-yellow-100 text-yellow-700 border-yellow-200",
    other: "bg-slate-100 text-slate-700 border-slate-200",
  }

  const days = currentView === "month" ? getDaysInMonth(currentDate) : getWeekDays(currentDate)

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-[0_8px_32px_rgba(37,99,235,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <GlassButton
                variant={currentView === "month" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("month")}
              >
                Month
              </GlassButton>
              <GlassButton
                variant={currentView === "week" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("week")}
              >
                Week
              </GlassButton>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => (currentView === "month" ? navigateMonth(-1) : navigateWeek(-1))}
            >
              <ChevronLeft size={18} />
            </GlassButton>
            <GlassButton variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </GlassButton>
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={() => (currentView === "month" ? navigateMonth(1) : navigateWeek(1))}
            >
              <ChevronRight size={18} />
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 border-b border-blue-100/50">
        {dayNames.map((day) => (
          <div key={day} className="px-2 py-3 text-center text-sm font-medium text-slate-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={cn("grid grid-cols-7", currentView === "week" ? "min-h-[400px]" : "")}>
        {days.map((date, idx) => {
          const dayEvents = date ? getEventsForDate(date) : []
          return (
            <div
              key={idx}
              className={cn(
                "min-h-[100px] p-2 border-r border-b border-blue-50 transition-colors",
                date && "hover:bg-blue-50/30 cursor-pointer",
                !date && "bg-slate-50/50",
                currentView === "week" && "min-h-[400px]",
              )}
            >
              {date && (
                <>
                  <span
                    className={cn(
                      "inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium",
                      isToday(date)
                        ? "bg-blue-600 text-white"
                        : date.getDay() === 0 || date.getDay() === 6
                          ? "text-slate-400"
                          : "text-slate-700",
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, currentView === "week" ? 10 : 3).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => onEventClick?.(event)}
                        className={cn(
                          "w-full text-left px-2 py-1 rounded text-xs font-medium border truncate",
                          eventTypeColors[event.type],
                        )}
                      >
                        {event.time} {event.title}
                      </button>
                    ))}
                    {dayEvents.length > (currentView === "week" ? 10 : 3) && (
                      <span className="text-xs text-slate-500 px-2">
                        +{dayEvents.length - (currentView === "week" ? 10 : 3)} more
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
