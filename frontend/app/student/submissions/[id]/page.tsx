"use client"

import { useParams } from "next/navigation"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { AudioPlayer } from "@/components/ui/audio-player"
import { StatusBadge } from "@/components/ui/status-badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ArrowLeft, Headphones, Coins, CheckCircle, XCircle, Clock, User } from "lucide-react"
import Link from "next/link"

export default function SubmissionDetailPage() {
  const { t } = useI18n()
  const params = useParams()

  // Mock submission data
  const submission = {
    id: params.id,
    lessonId: 3,
    lessonTitle: "Dars 3: Oila",
    submittedAt: "2024-01-07 14:30",
    status: "accepted" as const,
    score: 90,
    coinsEarned: 10,
    attempt: 1,
    referenceAudio: "#",
    referenceText: "Annem ve babam Ankara'da yaşıyor. Kardeşim İstanbul'da çalışıyor.",
    studentAudio: "#",
    studentTranscription: "Annem ve babam Ankara'da yaşıyor. Kardeşim İstanbul'da çalışıyor.",
    feedback: "Ajoyib talaffuz! Davom eting. Oila a'zolari haqidagi so'zlarni juda yaxshi talaffuz qildingiz.",
    reviewedBy: "Ahmet Yılmaz",
    reviewedAt: "2024-01-07 15:00",
  }

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/student/submissions">
            <GlassButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </GlassButton>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{submission.lessonTitle}</h1>
            <p className="text-muted-foreground">
              {t("attempt")} #{submission.attempt} • {submission.submittedAt}
            </p>
          </div>
          <StatusBadge
            status={
              submission.status === "accepted" ? "success" : submission.status === "rejected" ? "error" : "warning"
            }
          >
            {t(submission.status)}
          </StatusBadge>
        </div>

        {/* Result Card */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ${
                submission.status === "accepted"
                  ? "bg-green-100 dark:bg-green-900/30"
                  : submission.status === "rejected"
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-yellow-100 dark:bg-yellow-900/30"
              }`}
            >
              {submission.status === "accepted" ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : submission.status === "rejected" ? (
                <XCircle className="w-12 h-12 text-red-500" />
              ) : (
                <Clock className="w-12 h-12 text-yellow-500" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="text-4xl font-bold mb-2">{submission.score}%</div>
              <p className="text-muted-foreground">{t("similarityScore")}</p>
              <div className="mt-3 max-w-xs mx-auto md:mx-0">
                <ProgressBar value={submission.score} color={submission.score >= 70 ? "success" : "error"} />
              </div>
            </div>

            {submission.coinsEarned > 0 && (
              <div className="flex items-center gap-2 p-4 bg-yellow-500/10 rounded-xl">
                <Coins className="w-8 h-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">+{submission.coinsEarned}</div>
                  <div className="text-sm text-muted-foreground">{t("coinsEarned")}</div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Reference Audio */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Headphones className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold">{t("referenceAudio")}</h3>
          </div>
          <AudioPlayer src={submission.referenceAudio} />
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm italic">"{submission.referenceText}"</p>
          </div>
        </GlassCard>

        {/* Student Audio */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold">{t("yourRecording")}</h3>
          </div>
          <AudioPlayer src={submission.studentAudio} />
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">{t("transcription")}:</p>
            <p className="text-sm italic">"{submission.studentTranscription}"</p>
          </div>
        </GlassCard>

        {/* Feedback */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-3">{t("teacherFeedback")}</h3>
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="italic">"{submission.feedback}"</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>
              {t("reviewedBy")} {submission.reviewedBy} • {submission.reviewedAt}
            </span>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/student/submissions" className="flex-1">
            <GlassButton variant="outline" className="w-full">
              {t("backToSubmissions")}
            </GlassButton>
          </Link>
          <Link href={`/student/lessons/${submission.lessonId}`} className="flex-1">
            <GlassButton className="w-full">{t("viewLesson")}</GlassButton>
          </Link>
        </div>
      </div>
    </StudentLayout>
  )
}
