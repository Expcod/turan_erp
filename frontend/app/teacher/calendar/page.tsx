"use client"

import { useState } from "react"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { CalendarView } from "@/components/ui/calendar-view"
import { Modal } from "@/components/ui/modal"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Clock, Users, BookOpen } from "lucide-react"
import Link from "next/link"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  type: "lesson" | "homework" | "other"
  groupName?: string
}

export default function TeacherCalendarPage() {
  const { t } = useTranslation()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Generate mock events
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Group A1 - Lesson",
      date: new Date(2024, 0, 15),
      time: "09:00",
      type: "lesson",
      groupName: "Group A1",
    },
    {
      id: "2",
      title: "Group B2 - Lesson",
      date: new Date(2024, 0, 15),
      time: "11:00",
      type: "lesson",
      groupName: "Group B2",
    },
    {
      id: "3",
      title: "Group A1 - Homework Due",
      date: new Date(2024, 0, 17),
      time: "23:59",
      type: "homework",
      groupName: "Group A1",
    },
    {
      id: "4",
      title: "Group C1 - Lesson",
      date: new Date(2024, 0, 18),
      time: "14:00",
      type: "lesson",
      groupName: "Group C1",
    },
    // Add more events for current month
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `gen-${i}`,
      title: `Group ${["A1", "B2", "C1"][i % 3]} - Lesson`,
      date: new Date(new Date().getFullYear(), new Date().getMonth(), ((i * 3) % 28) + 1),
      time: `${9 + (i % 3) * 2}:00`,
      type: "lesson" as const,
      groupName: `Group ${["A1", "B2", "C1"][i % 3]}`,
    })),
  ]

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("teacher.calendar")}</h1>
          <p className="text-slate-500 mt-1">
            {t("teacher.monthlyView")} / {t("teacher.weeklyView")}
          </p>
        </div>

        {/* Calendar */}
        <CalendarView events={events} onEventClick={setSelectedEvent} />

        {/* Event Detail Modal */}
        <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={t("teacher.lessonDetail")}>
          {selectedEvent && (
            <div className="space-y-4">
              <GlassCard className="p-4">
                <h3 className="font-semibold text-slate-800 text-lg mb-4">{selectedEvent.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Clock size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Time</p>
                      <p className="font-medium text-slate-700">{selectedEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Group</p>
                      <p className="font-medium text-slate-700">{selectedEvent.groupName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <BookOpen size={16} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Type</p>
                      <p className="font-medium text-slate-700 capitalize">{selectedEvent.type}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {selectedEvent.type === "lesson" && (
                <Link href={`/teacher/lessons/1`}>
                  <GlassButton variant="primary" className="w-full">
                    {t("common.view")} {t("teacher.lessonDetail")}
                  </GlassButton>
                </Link>
              )}
            </div>
          )}
        </Modal>
      </div>
    </TeacherLayout>
  )
}
