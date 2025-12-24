"use client"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { GlassButton } from "@/components/ui/glass-button"
import { BookOpen, Coins, Clock, TrendingUp, Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { studentDashboardApi, StudentDashboardData } from "@/lib/api"

export default function StudentDashboard() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await studentDashboardApi.getDashboard()
        setDashboardData(data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError(t("common.error"))
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [t])

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

  if (error || !dashboardData) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-muted-foreground">{error || t("common.noData")}</p>
          <GlassButton 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            {t("common.back")}
          </GlassButton>
        </div>
      </StudentLayout>
    )
  }

  const { user, stats, course_progress, upcoming_lessons, recent_submissions } = dashboardData

  const userName = user.first_name || user.last_name 
    ? `${user.first_name} ${user.last_name}`.trim() 
    : user.email

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("student.dashboard")}</h1>
          <p className="text-muted-foreground mt-1">{t("auth.welcomeBack")}, {userName}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t("student.myCoins")}
            value={stats.coins}
            icon={Coins}
            trend={stats.coins_trend !== 0 ? { value: Math.abs(stats.coins_trend), isPositive: stats.coins_trend > 0 } : undefined}
            className="border-l-4 border-l-yellow-500"
          />
          <StatCard
            title={t("student.completedLessons")}
            value={`${stats.completed_lessons}/${stats.total_lessons}`}
            icon={BookOpen}
          />
          <StatCard
            title={t("student.pendingHomework")}
            value={stats.pending_homework}
            icon={Clock}
            className="border-l-4 border-l-orange-500"
          />
          <StatCard
            title={t("student.averageScore")}
            value={`${stats.average_score}%`}
            icon={TrendingUp}
            trend={stats.average_score > 0 ? { value: 5, isPositive: true } : undefined}
          />
        </div>

        {/* Progress Section */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t("student.courseProgress")}</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{course_progress?.group_name || t("common.noData")}</span>
                <span>{course_progress?.progress_percent || 0}%</span>
              </div>
              <ProgressBar value={course_progress?.progress_percent || 0} color="primary" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.completed_lessons}</div>
                <div className="text-xs text-muted-foreground">{t("student.completed")}</div>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_homework}</div>
                <div className="text-xs text-muted-foreground">{t("student.pending")}</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-muted-foreground">
                  {Math.max(0, stats.total_lessons - stats.completed_lessons - stats.pending_homework)}
                </div>
                <div className="text-xs text-muted-foreground">{t("student.upcoming")}</div>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Lessons */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("student.upcomingLessons")}</h2>
              <Link href="/student/lessons">
                <GlassButton variant="ghost" size="sm">
                  {t("common.viewAll")}
                </GlassButton>
              </Link>
            </div>
            <div className="space-y-3">
              {upcoming_lessons.length > 0 ? (
                upcoming_lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{lesson.title}</p>
                        <p className="text-sm text-muted-foreground">{lesson.group}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{lesson.date}</p>
                      <p className="text-xs text-muted-foreground">{lesson.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("common.noData")}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Recent Submissions */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("student.recentSubmissions")}</h2>
              <Link href="/student/submissions">
                <GlassButton variant="ghost" size="sm">
                  {t("common.viewAll")}
                </GlassButton>
              </Link>
            </div>
            <div className="space-y-3">
              {recent_submissions.length > 0 ? (
                recent_submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {submission.status === "accepted" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : submission.status === "rejected" ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{submission.lesson}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("student.score")}: {submission.score}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.coins > 0 && (
                        <span className="flex items-center gap-1 text-yellow-600 font-medium">
                          <Coins className="w-4 h-4" />+{submission.coins}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("common.noData")}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </StudentLayout>
  )
}
