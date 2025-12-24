"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useTranslation } from "@/lib/i18n"
import { DataTable } from "@/components/ui/data-table"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, Eye, FileText, Music, Loader2 } from "lucide-react"
import { lessonsApi, type Lesson as ApiLesson } from "@/lib/api"

interface Lesson {
  id: string
  week: number
  lessonNumber: number
  title: string
  groupName: string
  hasWord: boolean
  hasAudio: boolean
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
}

export default function LessonsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      setLoading(true)
      const response = await lessonsApi.getAll().catch(() => [])
      const data = Array.isArray(response) ? response : []
      const mapped = data.map((l: ApiLesson) => ({
        id: String(l.id),
        week: l.week_number,
        lessonNumber: l.lesson_number,
        title: l.title,
        groupName: l.group_name || `Group #${l.group}`,
        hasWord: !!l.word_file,
        hasAudio: !!l.audio_file,
        status: l.status,
      }))
      setLessons(mapped)
    } catch (error) {
      console.error("Failed to fetch lessons:", error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: "weekLesson",
      header: t("lessons.week"),
      render: (item: Lesson) => (
        <span className="font-medium">
          W{item.week} L{item.lessonNumber}
        </span>
      ),
    },
    { key: "title", header: t("lessons.title") },
    {
      key: "resources",
      header: t("teacher.resources"),
      render: (item: Lesson) => (
        <div className="flex items-center gap-2">
          {item.hasWord && (
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center" title="Word Document">
              <FileText size={14} className="text-blue-600" />
            </div>
          )}
          {item.hasAudio && (
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center" title="Audio File">
              <Music size={14} className="text-green-600" />
            </div>
          )}
          {!item.hasWord && !item.hasAudio && <span className="text-slate-400 text-sm">None</span>}
        </div>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (item: Lesson) => {
        const statusMap = {
          scheduled: { type: "pending" as const, label: t("lessons.scheduled") },
          completed: { type: "success" as const, label: t("lessons.completed") },
          cancelled: { type: "error" as const, label: t("lessons.cancelled") },
          rescheduled: { type: "warning" as const, label: t("lessons.rescheduled") },
        }
        const status = statusMap[item.status] || statusMap.scheduled
        return <StatusBadge status={status.type}>{status.label}</StatusBadge>
      },
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (item: Lesson) => (
        <Link href={`/admin/lessons/${item.id}`}>
          <GlassButton variant="ghost" size="sm">
            <Eye size={16} className="mr-1" />
            {t("common.view")}
          </GlassButton>
        </Link>
      ),
    },
  ]

  const filteredLessons = lessons.filter((lesson) => lesson.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("admin.lessons")}</h1>
          <p className="text-slate-500 mt-1">{t("admin.lessonTemplate")}</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <GlassInput
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredLessons}
          currentPage={currentPage}
          totalPages={3}
          onPageChange={setCurrentPage}
          emptyMessage={t("common.noData")}
        />
      </div>
    </AdminLayout>
  )
}
