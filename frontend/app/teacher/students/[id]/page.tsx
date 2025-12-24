"use client"

import Link from "next/link"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ArrowLeft, GraduationCap, Coins, Calendar, FileCheck } from "lucide-react"

export default function TeacherStudentDetailPage() {
  const { t } = useTranslation()

  const student = {
    name: "Ali Valiyev",
    email: "ali@gmail.com",
    phone: "+998 90 123 4567",
    group: "Group A1",
    attendance: 95,
    coins: 150,
  }

  const attendanceHistory = [
    { date: "Jan 17, 2024", lesson: "Week 3, Lesson 2", status: "present" },
    { date: "Jan 15, 2024", lesson: "Week 3, Lesson 1", status: "present" },
    { date: "Jan 12, 2024", lesson: "Week 2, Lesson 3", status: "late" },
    { date: "Jan 10, 2024", lesson: "Week 2, Lesson 2", status: "present" },
    { date: "Jan 8, 2024", lesson: "Week 2, Lesson 1", status: "absent" },
  ]

  const submissions = [
    { id: "1", lesson: "Week 3, Lesson 1", submittedAt: "Jan 16, 2024", score: 92, status: "accepted" },
    { id: "2", lesson: "Week 2, Lesson 3", submittedAt: "Jan 13, 2024", score: 85, status: "accepted" },
    { id: "3", lesson: "Week 2, Lesson 2", submittedAt: "Jan 11, 2024", score: 78, status: "rejected" },
  ]

  const attendanceColumns = [
    { key: "date", header: t("common.date") },
    { key: "lesson", header: "Lesson" },
    {
      key: "status",
      header: t("common.status"),
      render: (item: (typeof attendanceHistory)[0]) => (
        <StatusBadge status={item.status === "present" ? "success" : item.status === "late" ? "warning" : "error"}>
          {item.status}
        </StatusBadge>
      ),
    },
  ]

  const submissionColumns = [
    { key: "lesson", header: "Lesson" },
    { key: "submittedAt", header: "Submitted" },
    {
      key: "score",
      header: t("teacher.similarityScore"),
      render: (item: (typeof submissions)[0]) => (
        <span className={item.score >= 80 ? "text-green-600 font-medium" : "text-yellow-600"}>{item.score}%</span>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (item: (typeof submissions)[0]) => (
        <StatusBadge status={item.status === "accepted" ? "success" : "error"}>{item.status}</StatusBadge>
      ),
    },
  ]

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/teacher/students"
          className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("common.back")}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/20">
            {student.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
            <p className="text-slate-500">
              {student.group} | {student.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t("teacher.attendance")} value={`${student.attendance}%`} icon={Calendar} color="green" />
          <StatCard title={t("teacher.coins")} value={student.coins} icon={Coins} color="yellow" />
          <StatCard title="Submissions" value="8/10" icon={FileCheck} color="blue" />
          <StatCard title="Ranking" value="#3" icon={GraduationCap} color="purple" />
        </div>

        {/* Progress */}
        <GlassCard>
          <h3 className="font-semibold text-slate-800 mb-4">Overall Progress</h3>
          <div className="space-y-4">
            <ProgressBar label={t("teacher.attendance")} value={student.attendance} color="green" />
            <ProgressBar label="Homework Completion" value={80} color="blue" />
            <ProgressBar label="Average Score" value={85} color="yellow" />
          </div>
        </GlassCard>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Attendance History */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
              <h3 className="font-semibold text-slate-800">{t("teacher.attendance")} History</h3>
            </div>
            <div className="p-4">
              <DataTable columns={attendanceColumns} data={attendanceHistory} />
            </div>
          </GlassCard>

          {/* Submissions */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-100/50 bg-gradient-to-r from-yellow-50/50 to-transparent">
              <h3 className="font-semibold text-slate-800">{t("teacher.submissions")}</h3>
            </div>
            <div className="p-4">
              <DataTable columns={submissionColumns} data={submissions} />
            </div>
          </GlassCard>
        </div>
      </div>
    </TeacherLayout>
  )
}
