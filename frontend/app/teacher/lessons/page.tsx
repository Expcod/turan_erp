"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassSelect } from "@/components/ui/glass-select"
import { LessonCard } from "@/components/ui/lesson-card"
import { Search, Filter } from "lucide-react"
import { lessonsApi, groupsApi, type Lesson, type Group } from "@/lib/api"

export default function TeacherLessonsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [groupFilter, setGroupFilter] = useState("")
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsResponse, groupsResponse] = await Promise.all([
          lessonsApi.getAll(),
          groupsApi.getAll(),
        ])

        // Handle paginated response
        const ensureArray = <T,>(data: T[] | { results?: T[] } | null | undefined): T[] => {
          if (Array.isArray(data)) return data
          if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
            return data.results
          }
          return []
        }

        setLessons(ensureArray(lessonsResponse))
        setGroups(ensureArray(groupsResponse))
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = !groupFilter || lesson.group.toString() === groupFilter
    return matchesSearch && matchesGroup
  })

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
          <h1 className="text-2xl font-bold text-slate-800">{t("admin.lessons")}</h1>
          <p className="text-slate-500 mt-1">{t("teacher.manageLessons")}</p>
        </div>

        {/* Filters */}
        <GlassCard className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <GlassInput
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              <GlassSelect
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                options={[
                  { value: "", label: t("teacher.allGroups") },
                  ...groups.map((group) => ({
                    value: group.id.toString(),
                    label: group.name,
                  })),
                ]}
              />
            </div>
          </div>
        </GlassCard>

        {/* Lessons Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLessons.map((lesson) => (
            <Link key={lesson.id} href={`/teacher/lessons/${lesson.id}`}>
              <LessonCard
                week={lesson.week_number}
                lessonNumber={lesson.lesson_number}
                title={lesson.title}
                groupName={lesson.group_name || `${t("teacher.group")} ${lesson.group}`}
                status={lesson.status}
              />
            </Link>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">{t("common.noData")}</p>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
