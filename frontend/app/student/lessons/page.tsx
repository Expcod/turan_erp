"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, BookOpen, Clock, CheckCircle, Lock, Play, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { lessonsApi, homeworkApi, groupsApi, Lesson as ApiLesson, Homework, Group } from "@/lib/api"

interface LessonWithHomework {
  id: number
  title: string
  description: string
  date: string
  time: string
  status: "completed" | "available" | "locked"
  score?: number
  homeworkStatus?: "submitted" | "pending" | "not_started"
  groupName: string
}

export default function StudentLessonsPage() {
  const { t, language } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lessons, setLessons] = useState<LessonWithHomework[]>([])
  const [groupName, setGroupName] = useState<string>("")

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch lessons and homeworks
        const [lessonsResponse, homeworksResponse] = await Promise.all([
          lessonsApi.getAll(),
          homeworkApi.getAll()
        ])
        
        // Ensure lessonsData is an array
        const lessonsData: ApiLesson[] = Array.isArray(lessonsResponse) 
          ? lessonsResponse 
          : (lessonsResponse as any)?.results || []
        
        // Ensure homeworksData is an array
        const homeworksData: Homework[] = Array.isArray(homeworksResponse) 
          ? homeworksResponse 
          : (homeworksResponse as any)?.results || []
        
        // Create homework map by lesson id
        const homeworkMap = new Map<number, Homework>()
        homeworksData.forEach((hw: Homework) => {
          homeworkMap.set(hw.lesson, hw)
        })
        
        // Get group name from first lesson
        let currentGroupName = ""
        if (lessonsData.length > 0 && lessonsData[0].group_name) {
          currentGroupName = lessonsData[0].group_name
        }
        setGroupName(currentGroupName)
        
        // Map lessons with homework status
        const mappedLessons: LessonWithHomework[] = lessonsData.map((lesson: ApiLesson, index: number) => {
          const homework = homeworkMap.get(lesson.id)
          
          // Determine lesson status
          let status: "completed" | "available" | "locked" = "available"
          if (lesson.status === "completed") {
            status = "completed"
          } else if (lesson.status === "scheduled") {
            // Check if previous lessons are completed
            const previousLessons = lessonsData.slice(0, index)
            const allPreviousCompleted = previousLessons.every((l: ApiLesson) => l.status === "completed")
            status = allPreviousCompleted ? "available" : "locked"
          }
          
          // Determine homework status
          let homeworkStatus: "submitted" | "pending" | "not_started" | undefined
          if (homework) {
            if (homework.status === "approved" || homework.status === "submitted" || homework.status === "reviewed") {
              homeworkStatus = "submitted"
            } else if (homework.status === "pending" || homework.status === "rejected") {
              homeworkStatus = "pending"
            }
          } else if (status !== "locked") {
            homeworkStatus = "not_started"
          }
          
          // Calculate score from homework
          let score: number | undefined
          if (homework && homework.similarity_score !== null && homework.similarity_score !== undefined) {
            score = Math.round(homework.similarity_score * 100)
          }
          
          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description || "",
            date: lesson.scheduled_date,
            time: lesson.scheduled_time,
            status,
            score,
            homeworkStatus,
            groupName: lesson.group_name || currentGroupName
          }
        })
        
        setLessons(mappedLessons)
      } catch (err) {
        console.error('Lessons fetch error:', err)
        setError(t("common.error"))
      } finally {
        setLoading(false)
      }
    }
    
    fetchLessons()
  }, [t])

  const filteredLessons = lessons.filter((lesson) => lesson.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "available":
        return <Play className="w-5 h-5 text-primary" />
      case "locked":
        return <Lock className="w-5 h-5 text-muted-foreground" />
      default:
        return null
    }
  }

  const getHomeworkBadge = (status?: string) => {
    switch (status) {
      case "submitted":
        return <StatusBadge status="success">{t("status.submitted")}</StatusBadge>
      case "pending":
        return <StatusBadge status="warning">{t("student.pending")}</StatusBadge>
      case "not_started":
        return <StatusBadge status="info">{t("status.notStarted")}</StatusBadge>
      default:
        return null
    }
  }

  // Calculate stats
  const completedCount = lessons.filter(l => l.status === "completed").length
  const availableCount = lessons.filter(l => l.status === "available").length
  const lockedCount = lessons.filter(l => l.status === "locked").length

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">{t("common.loading")}</span>
        </div>
      </StudentLayout>
    )
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-muted-foreground">{error}</p>
          <GlassButton 
            variant="ghost" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            {t("common.back")}
          </GlassButton>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("lessons.my")}</h1>
            <p className="text-muted-foreground mt-1">{groupName || t("common.noData")}</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <GlassInput
              placeholder={t("lessons.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Progress Overview */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{completedCount} {t("student.completed")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" />
                <span className="text-sm">{availableCount} {t("status.available")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{lockedCount} {t("status.locked")}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Lessons List */}
        <div className="space-y-4">
          {filteredLessons.length === 0 && (
            <GlassCard className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("common.noData")}</p>
            </GlassCard>
          )}
          {filteredLessons.map((lesson) => (
            <GlassCard
              key={lesson.id}
              className={`p-6 transition-all ${lesson.status === "locked" ? "opacity-60" : "hover:shadow-lg"}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      lesson.status === "completed"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : lesson.status === "available"
                          ? "bg-primary/20"
                          : "bg-muted"
                    }`}
                  >
                    {getStatusIcon(lesson.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{lesson.title}</h3>
                      {getHomeworkBadge(lesson.homeworkStatus)}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{lesson.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {lesson.date}
                      </span>
                      {lesson.score !== undefined && (
                        <span className="text-green-600 font-medium">
                          {t("student.score")}: {lesson.score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {lesson.status !== "locked" && (
                    <>
                      <Link href={`/student/lessons/${lesson.id}`}>
                        <GlassButton variant="ghost">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {t("lessons.view")}
                        </GlassButton>
                      </Link>
                      {lesson.status === "available" && lesson.homeworkStatus !== "submitted" && (
                        <Link href={`/student/lessons/${lesson.id}/homework`}>
                          <GlassButton>{t("homework.do")}</GlassButton>
                        </Link>
                      )}
                    </>
                  )}
                  {lesson.status === "locked" && (
                    <GlassButton disabled variant="ghost">
                      <Lock className="w-4 h-4 mr-2" />
                      {t("status.locked")}
                    </GlassButton>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}
