"use client"

import { useEffect, useState } from "react"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { StatCard } from "@/components/ui/stat-card"
import { GlassCard } from "@/components/ui/glass-card"
import { LessonCard } from "@/components/ui/lesson-card"
import { GlassButton } from "@/components/ui/glass-button"
import { Users, BookOpen, FileCheck, Calendar, ArrowRight, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { groupsApi, lessonsApi, homeworkApi, type Lesson } from "@/lib/api"

interface TeacherStats {
  totalStudents: number
  activeGroups: number
  pendingReviews: number
  todayLessons: number
}

interface UpcomingLesson {
  time: string
  group: string
  lesson: string
}

export default function TeacherDashboard() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    activeGroups: 0,
    pendingReviews: 0,
    todayLessons: 0,
  })
  const [todayLesson, setTodayLesson] = useState<{
    week: number
    lessonNumber: number
    title: string
    time: string
    groupName: string
  } | null>(null)
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsResponse, lessonsResponse, homeworkResponse] = await Promise.all([
          groupsApi.getAll().catch(() => []),
          lessonsApi.getAll().catch(() => []),
          homeworkApi.getAll().catch(() => []),
        ])

        // Helper to ensure array (handle paginated responses)
        const ensureArray = <T,>(data: T[] | { results?: T[] } | null | undefined): T[] => {
          if (Array.isArray(data)) return data
          if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
            return data.results
          }
          return []
        }

        // Ensure arrays
        const groupsData = ensureArray(groupsResponse)
        const lessonsData = ensureArray(lessonsResponse)
        const homeworkData = ensureArray(homeworkResponse)

        // Calculate stats
        const activeGroups = groupsData.filter(g => g.status === "active")
        const totalStudents = activeGroups.reduce((sum, g) => sum + (g.students_count || g.students?.length || 0), 0)
        const pendingReviews = homeworkData.filter(h => h.status === "submitted").length

        // Today's lessons
        const today = new Date().toISOString().split("T")[0]
        const todaysLessons = lessonsData.filter((l: Lesson) => l.scheduled_date === today)

        setStats({
          totalStudents,
          activeGroups: activeGroups.length,
          pendingReviews,
          todayLessons: todaysLessons.length,
        })

        // Set today's first lesson
        if (todaysLessons.length > 0) {
          const first = todaysLessons[0]
          setTodayLesson({
            week: first.week_number,
            lessonNumber: first.lesson_number,
            title: first.title,
            time: first.scheduled_time || "09:00",
            groupName: first.group_name || `Group #${first.group}`,
          })
        }

        // Set upcoming lessons
        const upcoming = todaysLessons.slice(1, 3).map((l: Lesson) => ({
          time: l.scheduled_time || "00:00",
          group: l.group_name || `Group #${l.group}`,
          lesson: `Week ${l.week_number}, Lesson ${l.lesson_number}`,
        }))
        setUpcomingLessons(upcoming)
      } catch (error) {
        console.error("Failed to fetch teacher dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const quickStats = [
    { label: "Total Students", value: stats.totalStudents, icon: Users },
    { label: "Active Groups", value: stats.activeGroups, icon: BookOpen },
    { label: "Pending Reviews", value: stats.pendingReviews, icon: FileCheck },
    { label: "Today's Lessons", value: stats.todayLessons, icon: Calendar },
  ]

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("teacher.dashboard")}</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here&apos;s your teaching overview.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, idx) => (
            <StatCard
              key={idx}
              title={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={idx === 0 ? "blue" : idx === 1 ? "green" : idx === 2 ? "yellow" : "purple"}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Lesson */}
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-slate-800">{t("teacher.todayLesson")}</h2>
                </div>
                {todayLesson && (
                  <Link href={`/teacher/lessons/1`}>
                    <GlassButton variant="ghost" size="sm">
                      View Details <ArrowRight size={16} className="ml-1" />
                    </GlassButton>
                  </Link>
                )}
              </div>
              {todayLesson ? (
                <LessonCard
                  week={todayLesson.week}
                  lessonNumber={todayLesson.lessonNumber}
                  title={todayLesson.title}
                  time={todayLesson.time}
                  groupName={todayLesson.groupName}
                  status="ongoing"
                />
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No lessons scheduled for today</p>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Quick Links */}
          <div>
            <GlassCard>
              <h2 className="font-semibold text-slate-800 mb-4">{t("teacher.quickLinks")}</h2>
              <div className="space-y-2">
                <Link href="/teacher/calendar" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{t("teacher.calendar")}</p>
                      <p className="text-sm text-slate-500">View schedule</p>
                    </div>
                  </div>
                </Link>
                <Link href="/teacher/submissions" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{t("teacher.homeworkSubmissions")}</p>
                      <p className="text-sm text-slate-500">12 pending</p>
                    </div>
                  </div>
                </Link>
                <Link href="/teacher/students" className="block">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{t("teacher.myStudents")}</p>
                      <p className="text-sm text-slate-500">48 students</p>
                    </div>
                  </div>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Upcoming Lessons */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Upcoming Today</h2>
            <Link href="/teacher/calendar">
              <GlassButton variant="ghost" size="sm">
                View Calendar <ArrowRight size={16} className="ml-1" />
              </GlassButton>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {upcomingLessons.map((lesson, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100/50">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  {lesson.time.split(":")[0]}
                </div>
                <div>
                  <p className="font-medium text-slate-700">{lesson.group}</p>
                  <p className="text-sm text-slate-500">{lesson.lesson}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </TeacherLayout>
  )
}
