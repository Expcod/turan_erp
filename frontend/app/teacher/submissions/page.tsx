"use client"

import { useState } from "react"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassSelect } from "@/components/ui/glass-select"
import { HomeworkReviewCard } from "@/components/homework-review-card"
import { Search } from "lucide-react"

export default function TeacherSubmissionsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const submissions = [
    {
      id: "1",
      studentName: "Ali Valiyev",
      audioUrl: "/audio-placeholder",
      transcription:
        "This is the transcribed text from the student's audio submission. The student practiced pronunciation and vocabulary from the lesson.",
      similarityScore: 92,
      status: "pending" as const,
      submittedAt: "2 hours ago",
    },
    {
      id: "2",
      studentName: "Malika Karimova",
      audioUrl: "/audio-placeholder",
      transcription:
        "Another example of transcribed audio content from a student's homework submission with good pronunciation.",
      similarityScore: 85,
      status: "accepted" as const,
      submittedAt: "5 hours ago",
    },
    {
      id: "3",
      studentName: "Jasur Toshev",
      audioUrl: "/audio-placeholder",
      transcription: "This submission had some issues with pronunciation and vocabulary usage that needs improvement.",
      similarityScore: 58,
      status: "rejected" as const,
      submittedAt: "1 day ago",
    },
    {
      id: "4",
      studentName: "Dilnoza Rahimova",
      audioUrl: "/audio-placeholder",
      transcription: "The student showed good understanding of the material with minor pronunciation errors.",
      similarityScore: 78,
      status: "pending" as const,
      submittedAt: "3 hours ago",
    },
  ]

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = sub.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("teacher.homeworkSubmissions")}</h1>
          <p className="text-slate-500 mt-1">{t("teacher.homeworkReview")}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <GlassInput
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <GlassSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "accepted", label: "Accepted" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
        </div>

        {/* Submissions Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredSubmissions.map((submission) => (
            <HomeworkReviewCard
              key={submission.id}
              studentName={submission.studentName}
              audioUrl={submission.audioUrl}
              transcription={submission.transcription}
              similarityScore={submission.similarityScore}
              status={submission.status}
              submittedAt={submission.submittedAt}
              onAccept={() => console.log("Accept", submission.id)}
              onReject={() => console.log("Reject", submission.id)}
              onGrantSecondChance={() => console.log("Grant second chance", submission.id)}
            />
          ))}
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">{t("common.noData")}</p>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
}
