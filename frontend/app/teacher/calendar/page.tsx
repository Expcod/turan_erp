"use client"

import { useState, useEffect } from "react"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { CalendarView } from "@/components/ui/calendar-view"
import { Modal } from "@/components/ui/modal"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Clock, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { lessonsApi, type Lesson } from "@/lib/api"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  type: "lesson" | "homework" | "other"
  groupName?: string
  lessonData?: Lesson
}

export default function TeacherCalendarPage() {
  const { t } = useTranslation()
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const lessonsResponse = await lessonsApi.getAll()

        // Handle paginated response
        const ensureArray = <T,>(data: T[] | { results?: T[] } | null | undefined): T[] => {
          if (Array.isArray(data)) return data
          if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
            return data.results
          }
          return []
        }

        const lessons = ensureArray(lessonsResponse)

        // Convert lessons to calendar events
        const calendarEvents: CalendarEvent[] = lessons.map((lesson) => {
          const lessonDate = new Date(lesson.scheduled_date)
          return {
            id: lesson.id.toString(),
            title: `${lesson.group_name || t("teacher.group")} - ${lesson.title}`,
            date: lessonDate,
            time: lesson.scheduled_time,
            type: "lesson" as const,
            groupName: lesson.group_name,
            lessonData: lesson,
          }
        })

        setEvents(calendarEvents)
      } catch (error) {
        console.error("Failed to fetch lessons:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [t])

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">{t("common.loading")}</p>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("teacher.calendar")}</h1>
          <p className="text-slate-500 mt-1">
            {t("teacher.calendarDescription")}
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
                      <p className="text-sm text-slate-500">{t("teacher.time")}</p>
                      <p className="font-medium text-slate-700">{selectedEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{t("teacher.group")}</p>
                      <p className="font-medium text-slate-700">{selectedEvent.groupName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <BookOpen size={16} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{t("teacher.type")}</p>
                      <p className="font-medium text-slate-700 capitalize">{t(`teacher.${selectedEvent.type}`)}</p>
                    </div>
                  </div>
                  {selectedEvent.lessonData && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-slate-500">{t("teacher.status")}</p>
                      <p className="font-medium text-slate-700 capitalize">
                        {t(`teacher.status_${selectedEvent.lessonData.status}`)}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {selectedEvent.type === "lesson" && selectedEvent.lessonData && (
                <Link href={`/teacher/lessons/${selectedEvent.lessonData.id}`}>
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
