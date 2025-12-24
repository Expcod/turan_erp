"use client"

import { useState } from "react"
import Link from "next/link"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassSelect } from "@/components/ui/glass-select"
import { LessonCard } from "@/components/ui/lesson-card"
import { Search, Filter } from "lucide-react"

export default function TeacherLessonsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [groupFilter, setGroupFilter] = useState("")

  const lessons = [
    { id: "1", week: 1, lesson: 1, title: "Introduction to Basics", group: "Group A1", status: "completed" as const },
    { id: "2", week: 1, lesson: 2, title: "Fundamentals Part 1", group: "Group A1", status: "completed" as const },
    { id: "3", week: 1, lesson: 3, title: "Fundamentals Part 2", group: "Group A1", status: "ongoing" as const },
    { id: "4", week: 2, lesson: 1, title: "Advanced Concepts", group: "Group B2", status: "upcoming" as const },
    { id: "5", week: 2, lesson: 2, title: "Practice Session", group: "Group B2", status: "upcoming" as const },
    { id: "6", week: 1, lesson: 1, title: "Beginner Grammar", group: "Group C1", status: "completed" as const },
  ]

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = !groupFilter || lesson.group === groupFilter
    return matchesSearch && matchesGroup
  })

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("admin.lessons")}</h1>
          <p className="text-slate-500 mt-1">Manage your lessons across all groups</p>
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
                  { value: "", label: "All Groups" },
                  { value: "Group A1", label: "Group A1" },
                  { value: "Group B2", label: "Group B2" },
                  { value: "Group C1", label: "Group C1" },
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
                week={lesson.week}
                lessonNumber={lesson.lesson}
                title={lesson.title}
                groupName={lesson.group}
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
