"use client"

import { useState } from "react"
import Link from "next/link"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { WordPreview } from "@/components/ui/word-preview"
import { AudioPlayer } from "@/components/ui/audio-player"
import { AttendanceTable } from "@/components/ui/attendance-table"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft, FileText, Music, Users, CheckCircle, Eye } from "lucide-react"

type AttendanceStatus = "present" | "absent" | "late" | "excused" | null

export default function TeacherLessonDetailPage() {
  const { t } = useTranslation()
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({
    "1": "present",
    "2": "present",
    "3": "late",
    "4": null,
  })

  const lesson = {
    week: 1,
    lessonNumber: 2,
    title: "Fundamentals Part 1",
    groupName: "Group A1",
    date: "January 17, 2024",
    time: "09:00 - 10:30",
  }

  const students = [
    { id: "1", name: "Ali Valiyev" },
    { id: "2", name: "Malika Karimova" },
    { id: "3", name: "Jasur Toshev" },
    { id: "4", name: "Dilnoza Rahimova" },
  ]

  const submissions = [
    { id: "1", student: "Ali Valiyev", submittedAt: "2 hours ago", score: 92, status: "pending" },
    { id: "2", student: "Malika Karimova", submittedAt: "5 hours ago", score: 85, status: "accepted" },
    { id: "3", student: "Jasur Toshev", submittedAt: "1 day ago", score: 78, status: "rejected" },
  ]

  const mockHtmlContent = `
    <h1>Fundamentals Part 1</h1>
    <p>In this lesson, we continue building on the basics introduced previously.</p>
    <h2>Topics Covered</h2>
    <ul>
      <li>Grammar structures</li>
      <li>Vocabulary expansion</li>
      <li>Pronunciation practice</li>
    </ul>
    <h2>Exercises</h2>
    <p>Complete the following exercises to reinforce your learning.</p>
  `

  const submissionColumns = [
    { key: "student", header: t("payments.student") },
    { key: "submittedAt", header: "Submitted" },
    {
      key: "score",
      header: t("teacher.similarityScore"),
      render: (item: (typeof submissions)[0]) => (
        <span
          className={
            item.score >= 80 ? "text-green-600 font-medium" : item.score >= 60 ? "text-yellow-600" : "text-red-500"
          }
        >
          {item.score}%
        </span>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      render: (item: (typeof submissions)[0]) => (
        <StatusBadge status={item.status === "accepted" ? "success" : item.status === "rejected" ? "error" : "pending"}>
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (item: (typeof submissions)[0]) => (
        <Link href={`/teacher/submissions/${item.id}`}>
          <GlassButton variant="ghost" size="sm">
            <Eye size={14} className="mr-1" />
            Review
          </GlassButton>
        </Link>
      ),
    },
  ]

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }))
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/teacher/lessons"
          className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("common.back")}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-sm text-blue-600 font-medium">
              Week {lesson.week}, Lesson {lesson.lessonNumber} - {lesson.groupName}
            </span>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">{lesson.title}</h1>
            <p className="text-slate-500 mt-1">
              {lesson.date} | {lesson.time}
            </p>
          </div>
          <GlassButton variant="accent">
            <CheckCircle size={18} className="mr-2" />
            {t("teacher.markDone")}
          </GlassButton>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resources */}
          <div className="lg:col-span-2 space-y-6">
            {/* Word Preview */}
            <GlassCard className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-100/50 flex items-center gap-2 bg-gradient-to-r from-blue-50/50 to-transparent">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-slate-800">{t("teacher.resources")}</h2>
              </div>
              <div className="p-4">
                <WordPreview htmlContent={mockHtmlContent} className="border-0 shadow-none" />
              </div>
            </GlassCard>

            {/* Audio */}
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-slate-800">Audio Resources</h2>
              </div>
              <div className="space-y-3">
                <AudioPlayer src="/audio-placeholder" title="Lesson Audio" />
                <AudioPlayer src="/audio-placeholder" title="Practice Dialogue" />
              </div>
            </GlassCard>

            {/* Homework Submissions */}
            <GlassCard className="p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-blue-100/50 flex items-center justify-between bg-gradient-to-r from-yellow-50/50 to-transparent">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  <h2 className="font-semibold text-slate-800">{t("teacher.homeworkSubmissions")}</h2>
                </div>
                <span className="text-sm text-slate-500">{submissions.length} submissions</span>
              </div>
              <div className="p-4">
                <DataTable columns={submissionColumns} data={submissions} />
              </div>
            </GlassCard>
          </div>

          {/* Attendance */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-slate-800">{t("teacher.attendance")}</h2>
            </div>
            <AttendanceTable students={students} attendance={attendance} onStatusChange={handleAttendanceChange} />
          </div>
        </div>
      </div>
    </TeacherLayout>
  )
}
