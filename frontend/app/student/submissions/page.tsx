"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassSelect } from "@/components/ui/glass-select"
import { StatusBadge } from "@/components/ui/status-badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { CheckCircle, XCircle, Clock, Coins, Eye, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { homeworkApi, lessonsApi, Homework, Lesson as ApiLesson } from "@/lib/api"

interface Submission {
  id: number
  lessonId: number
  lessonTitle: string
  submittedAt: string
  status: "accepted" | "rejected" | "pending"
  score?: number
  coinsEarned?: number
  feedback?: string
  attempt: number
}

export default function StudentSubmissionsPage() {
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch homeworks and lessons
        const [homeworksResponse, lessonsResponse] = await Promise.all([
          homeworkApi.getAll(),
          lessonsApi.getAll()
        ])
        
        // Ensure arrays
        const homeworksData: Homework[] = Array.isArray(homeworksResponse) 
          ? homeworksResponse 
          : (homeworksResponse as any)?.results || []
        
        const lessonsData: ApiLesson[] = Array.isArray(lessonsResponse) 
          ? lessonsResponse 
          : (lessonsResponse as any)?.results || []
        
        // Create lessons map
        const lessonsMap = new Map<number, ApiLesson>()
        lessonsData.forEach((lesson: ApiLesson) => {
          lessonsMap.set(lesson.id, lesson)
        })
        
        // Filter only submitted homeworks and map to submissions
        const mappedSubmissions: Submission[] = homeworksData
          .filter((hw: Homework) => hw.status !== 'pending' || hw.submitted_at)
          .map((hw: Homework) => {
            const lesson = lessonsMap.get(hw.lesson)
            
            // Determine status
            let status: "accepted" | "rejected" | "pending" = "pending"
            if (hw.status === "approved") {
              status = "accepted"
            } else if (hw.status === "rejected") {
              status = "rejected"
            } else if (hw.status === "submitted" || hw.status === "reviewed") {
              status = "pending"
            }
            
            // Calculate score
            const score = hw.similarity_score !== null && hw.similarity_score !== undefined
              ? Math.round(hw.similarity_score * 100)
              : undefined
            
            return {
              id: hw.id,
              lessonId: hw.lesson,
              lessonTitle: lesson?.title || `Lesson ${hw.lesson}`,
              submittedAt: hw.submitted_at 
                ? new Date(hw.submitted_at).toLocaleString()
                : new Date().toLocaleString(),
              status,
              score,
              coinsEarned: hw.coins_earned,
              feedback: hw.feedback,
              attempt: 1 // Backend doesn't track attempt number yet
            }
          })
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        
        setSubmissions(mappedSubmissions)
      } catch (err) {
        console.error('Submissions fetch error:', err)
        setError(t("common.error"))
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubmissions()
  }, [t])

  const filteredSubmissions =
    statusFilter === "all" ? submissions : submissions.filter((s) => s.status === statusFilter)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const stats = {
    total: submissions.length,
    accepted: submissions.filter((s) => s.status === "accepted").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    pending: submissions.filter((s) => s.status === "pending").length,
    totalCoins: submissions.reduce((sum, s) => sum + (s.coinsEarned || 0), 0),
  }

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("submissions.my")}</h1>
          <p className="text-muted-foreground mt-1">{t("dashboard.trackYourProgress")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <GlassCard className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-sm text-muted-foreground">{t("common.total")}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-l-4 border-l-green-500">
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-sm text-muted-foreground">{t("status.accepted")}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-l-4 border-l-red-500">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">{t("actions.reject")}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-l-4 border-l-yellow-500">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">{t("student.pending")}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-l-4 border-l-yellow-400">
            <div className="flex items-center justify-center gap-1">
              <Coins className="w-5 h-5 text-yellow-500" />
              <p className="text-2xl font-bold text-yellow-600">{stats.totalCoins}</p>
            </div>
            <p className="text-sm text-muted-foreground">{t("homework.coinsEarned")}</p>
          </GlassCard>
        </div>

        {/* Filter */}
        <div className="flex justify-end">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="w-48 px-4 py-2 rounded-xl bg-background/50 backdrop-blur-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{t("status.all")}</option>
            <option value="accepted">{t("status.accepted")}</option>
            <option value="rejected">{t("actions.reject")}</option>
            <option value="pending">{t("student.pending")}</option>
          </select>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 && (
            <GlassCard className="p-8 text-center">
              <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t("common.noData")}</p>
            </GlassCard>
          )}
          {filteredSubmissions.map((submission) => (
            <GlassCard key={submission.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      submission.status === "accepted"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : submission.status === "rejected"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-yellow-100 dark:bg-yellow-900/30"
                    }`}
                  >
                    {getStatusIcon(submission.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{submission.lessonTitle}</h3>
                      <StatusBadge
                        status={
                          submission.status === "accepted"
                            ? "success"
                            : submission.status === "rejected"
                              ? "error"
                              : "warning"
                        }
                      >
                        {submission.status === "accepted" 
                          ? t("status.accepted") 
                          : submission.status === "rejected" 
                          ? t("actions.reject") 
                          : t("student.pending")}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("submissions.attempt")} #{submission.attempt} • {submission.submittedAt}
                    </p>
                    {submission.feedback && (
                      <p className="text-sm mt-2 italic text-muted-foreground">"{submission.feedback}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {submission.score !== undefined && (
                    <div className="text-center">
                      <div className="w-20">
                        <ProgressBar
                          value={submission.score}
                          color={submission.score >= 70 ? "green" : submission.score >= 50 ? "yellow" : "red"}
                        />
                        <p className="text-xs text-center mt-1 font-medium">{submission.score}%</p>
                      </div>
                    </div>
                  )}

                  {submission.coinsEarned !== undefined && submission.coinsEarned > 0 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Coins className="w-4 h-4" />
                      <span className="font-semibold">+{submission.coinsEarned}</span>
                    </div>
                  )}

                  <Link href={`/student/submissions/${submission.id}`}>
                    <GlassButton variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      {t("common.view")}
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </StudentLayout>
  )
}
