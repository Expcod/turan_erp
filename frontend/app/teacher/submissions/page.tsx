"use client"

import { useState, useEffect } from "react"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassSelect } from "@/components/ui/glass-select"
import { HomeworkReviewCard } from "@/components/homework-review-card"
import { Search } from "lucide-react"
import { homeworkApi, type Homework } from "@/lib/api"

export default function TeacherSubmissionsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [submissions, setSubmissions] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await homeworkApi.getAll()

      // Handle paginated response
      const ensureArray = <T,>(data: T[] | { results?: T[] } | null | undefined): T[] => {
        if (Array.isArray(data)) return data
        if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
          return data.results
        }
        return []
      }

      setSubmissions(ensureArray(response))
    } catch (error) {
      console.error("Failed to fetch submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id: number) => {
    try {
      await homeworkApi.review(id, {
        status: "accepted",
        coins_earned: 10,
      })
      // Refresh submissions
      await fetchSubmissions()
    } catch (error) {
      console.error("Failed to accept submission:", error)
    }
  }

  const handleReject = async (id: number) => {
    try {
      await homeworkApi.review(id, {
        status: "rejected",
        feedback: t("teacher.rejectedFeedback"),
      })
      // Refresh submissions
      await fetchSubmissions()
    } catch (error) {
      console.error("Failed to reject submission:", error)
    }
  }

  const handleSecondChance = async (id: number) => {
    try {
      await homeworkApi.review(id, {
        status: "second_chance",
        feedback: t("teacher.secondChanceFeedback"),
      })
      // Refresh submissions
      await fetchSubmissions()
    } catch (error) {
      console.error("Failed to grant second chance:", error)
    }
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = sub.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || sub.status === statusFilter
    return matchesSearch && matchesStatus
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
              { value: "", label: t("teacher.allStatus") },
              { value: "pending", label: t("teacher.status_pending") },
              { value: "accepted", label: t("teacher.status_accepted") },
              { value: "rejected", label: t("teacher.status_rejected") },
            ]}
          />
        </div>

        {/* Submissions Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredSubmissions.map((submission) => (
            <HomeworkReviewCard
              key={submission.id}
              studentName={submission.student_name || t("common.unknown")}
              audioUrl={submission.audio_file || ""}
              transcription={submission.transcription || t("teacher.noTranscription")}
              similarityScore={submission.similarity_score || 0}
              status={submission.status as "pending" | "accepted" | "rejected"}
              submittedAt={new Date(submission.submitted_at || "").toLocaleString()}
              onAccept={() => handleAccept(submission.id)}
              onReject={() => handleReject(submission.id)}
              onGrantSecondChance={() => handleSecondChance(submission.id)}
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
