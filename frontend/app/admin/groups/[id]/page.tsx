"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { GlassInput } from "@/components/ui/glass-input"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft, Users, Calendar, Clock, BookOpen, Edit } from "lucide-react"

export default function GroupDetailPage() {
  const { t } = useTranslation()
  const params = useParams()
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

  // Mock data
  const group = {
    id: params.id,
    name: "Group A1 - Beginner",
    teacher: "Nodira Olimova",
    studentsCount: 12,
    schedule: "Mon, Wed, Fri 09:00",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    status: "active",
  }

  const students = [
    { id: "1", name: "Ali Valiyev", phone: "+998 90 123 4567", attendance: 95 },
    { id: "2", name: "Malika Karimova", phone: "+998 91 234 5678", attendance: 88 },
    { id: "3", name: "Jasur Toshev", phone: "+998 93 345 6789", attendance: 92 },
  ]

  const lessons = [
    {
      id: "1",
      week: 1,
      lesson: 1,
      title: "Introduction to Basics",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      week: 1,
      lesson: 2,
      title: "Fundamentals Part 1",
      date: "2024-01-17",
      status: "completed",
    },
    {
      id: "3",
      week: 1,
      lesson: 3,
      title: "Fundamentals Part 2",
      date: "2024-01-19",
      status: "scheduled",
    },
  ]

  const studentColumns = [
    { key: "name", header: t("common.name") },
    { key: "phone", header: t("common.phone") },
    {
      key: "attendance",
      header: t("teacher.attendance"),
      render: (item: (typeof students)[0]) => (
        <span className={item.attendance >= 90 ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
          {item.attendance}%
        </span>
      ),
    },
  ]

  const lessonColumns = [
    {
      key: "week",
      header: t("lessons.week"),
      render: (item: (typeof lessons)[0]) => `W${item.week} L${item.lesson}`,
    },
    { key: "title", header: t("lessons.title") },
    { key: "date", header: t("common.date") },
    {
      key: "status",
      header: t("lessons.status"),
      render: (item: (typeof lessons)[0]) => (
        <StatusBadge status={item.status === "completed" ? "success" : "info"}>
          {item.status === "completed" ? t("lessons.completed") : t("lessons.scheduled")}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: () => (
        <GlassButton variant="ghost" size="sm" onClick={() => setIsRescheduleModalOpen(true)}>
          <Edit size={14} className="mr-1" />
          {t("admin.rescheduleLesson")}
        </GlassButton>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/admin/groups"
          className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("common.back")}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{group.name}</h1>
            <p className="text-slate-500 mt-1">{t("admin.groupDetail")}</p>
          </div>
          <GlassButton variant="primary">
            <Edit size={18} className="mr-2" />
            {t("common.edit")}
          </GlassButton>
        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t("groups.teacher")}</p>
                <p className="font-semibold text-slate-700">{group.teacher}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t("groups.studentsCount")}</p>
                <p className="font-semibold text-slate-700">{group.studentsCount}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t("groups.schedule")}</p>
                <p className="font-semibold text-slate-700">{group.schedule}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{t("groups.startDate")}</p>
                <p className="font-semibold text-slate-700">{group.startDate}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Lessons Section */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-100/50 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800">{t("admin.schedule")}</h2>
          </div>
          <div className="p-4">
            <DataTable columns={lessonColumns} data={lessons} />
          </div>
        </GlassCard>

        {/* Students Section */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-100/50 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800">{t("admin.students")}</h2>
          </div>
          <div className="p-4">
            <DataTable columns={studentColumns} data={students} />
          </div>
        </GlassCard>

        {/* Reschedule Modal */}
        <Modal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          title={t("admin.rescheduleLesson")}
        >
          <form className="space-y-4">
            <GlassInput label={t("common.date")} type="date" />
            <GlassInput label={t("common.time")} type="time" />
            <div className="flex justify-end gap-3 pt-4">
              <GlassButton variant="ghost" onClick={() => setIsRescheduleModalOpen(false)}>
                {t("common.cancel")}
              </GlassButton>
              <GlassButton variant="primary">{t("common.save")}</GlassButton>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
