"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useTranslation } from "@/lib/i18n"
import { StatCard } from "@/components/ui/stat-card"
import { GlassCard } from "@/components/ui/glass-card"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Users, GraduationCap, BookOpen, CreditCard, TrendingUp, Calendar, Loader2 } from "lucide-react"
import { dashboardApi, type Payment, type DashboardStats } from "@/lib/api"

interface UpcomingLesson {
  group: string
  time: string
  teacher: string
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0,
    total_teachers: 0,
    total_groups: 0,
    total_revenue: 0,
    active_groups: 0,
    pending_payments: 0,
  })
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, paymentsData] = await Promise.all([
          dashboardApi.getStats().catch(() => ({
            total_students: 0,
            total_teachers: 0,
            total_groups: 0,
            total_revenue: 0,
            active_groups: 0,
            pending_payments: 0,
          })),
          dashboardApi.getRecentPayments(5).catch(() => []),
        ])
        setStats(statsData)
        setRecentPayments(Array.isArray(paymentsData) ? paymentsData : [])
        
        // For upcoming lessons, we'll use placeholder for now
        // since lesson data structure needs group/teacher names
        setUpcomingLessons([])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format payment data for display
  const formattedPayments = recentPayments.map(p => ({
    id: String(p.id),
    student: p.student_name || `Student #${p.student}`,
    amount: `${p.amount?.toLocaleString()} UZS`,
    date: p.created_at ? new Date(p.created_at).toLocaleDateString() : '-',
    status: p.status,
  }))

  const paymentColumns = [
    { key: "student", header: t("payments.student") },
    { key: "amount", header: t("payments.amount") },
    { key: "date", header: t("payments.date") },
    {
      key: "status",
      header: t("payments.status"),
      render: (item: { status: string }) => (
        <StatusBadge status={item.status === "confirmed" ? "success" : "pending"}>
          {item.status === "confirmed" ? t("payments.confirmed") : t("payments.pending")}
        </StatusBadge>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("admin.dashboard")}</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t("admin.totalStudents")}
              value={String(stats.total_students)}
              icon={GraduationCap}
              color="blue"
            />
            <StatCard
              title={t("admin.totalTeachers")}
              value={String(stats.total_teachers)}
              icon={Users}
              color="green"
            />
            <StatCard 
              title={t("admin.totalGroups")} 
              value={String(stats.total_groups)} 
              icon={BookOpen} 
              color="yellow" 
            />
            <StatCard
              title={t("admin.totalRevenue")}
              value={`${(stats.total_revenue / 1000000).toFixed(1)}M UZS`}
              icon={CreditCard}
              color="purple"
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Payments */}
          <div className="lg:col-span-2">
            <GlassCard className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-100/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-slate-800">{t("admin.recentPayments")}</h2>
                </div>
              </div>
              <div className="p-4">
                <DataTable columns={paymentColumns} data={formattedPayments} />
              </div>
            </GlassCard>
          </div>

          {/* Upcoming Lessons */}
          <div>
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800">{t("admin.upcomingLessons")}</h2>
              </div>
              <div className="space-y-3">
                {upcomingLessons.map((lesson, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100/50"
                  >
                    <div>
                      <p className="font-medium text-slate-700">{lesson.group}</p>
                      <p className="text-sm text-slate-500">{lesson.teacher}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium">
                        {lesson.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
