"use client"

import Link from "next/link"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { AudioPlayer } from "@/components/ui/audio-player"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ArrowLeft, Check, X, RotateCcw, User, BookOpen, Clock } from "lucide-react"

export default function SubmissionDetailPage() {
  const { t } = useTranslation()

  const submission = {
    studentName: "Ali Valiyev",
    studentGroup: "Group A1",
    lessonTitle: "Week 3, Lesson 2 - Intermediate Grammar",
    audioUrl: "/audio-placeholder",
    transcription: `This is the full transcription of the student's audio submission. 

The student demonstrated good understanding of the lesson material and practiced the vocabulary and grammar structures covered in class.

Key points:
- Correct usage of present tense
- Good pronunciation of difficult words
- Minor errors in article usage

Overall, the submission shows significant improvement from previous attempts.`,
    similarityScore: 92,
    submittedAt: "January 17, 2024 at 10:30 AM",
    attempt: 1,
    maxAttempts: 1,
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/teacher/submissions"
          className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("common.back")}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t("teacher.homeworkReview")}</h1>
            <p className="text-slate-500 mt-1">Review and grade student submission</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Player */}
            <GlassCard>
              <h3 className="font-semibold text-slate-800 mb-4">{t("teacher.studentAudio")}</h3>
              <AudioPlayer src={submission.audioUrl} title="Student Recording" />
            </GlassCard>

            {/* Transcription */}
            <GlassCard>
              <h3 className="font-semibold text-slate-800 mb-4">{t("teacher.transcription")}</h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">{submission.transcription}</p>
              </div>
            </GlassCard>

            {/* Actions */}
            <GlassCard>
              <h3 className="font-semibold text-slate-800 mb-4">Actions</h3>
              <div className="flex flex-wrap gap-3">
                <GlassButton variant="primary" className="flex-1 min-w-[120px]">
                  <Check size={18} className="mr-2" />
                  {t("teacher.accept")}
                </GlassButton>
                <GlassButton variant="destructive" className="flex-1 min-w-[120px]">
                  <X size={18} className="mr-2" />
                  {t("teacher.reject")}
                </GlassButton>
                <GlassButton variant="accent" className="flex-1 min-w-[120px]">
                  <RotateCcw size={18} className="mr-2" />
                  {t("teacher.grantSecondChance")}
                </GlassButton>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Student Info */}
            <GlassCard>
              <h3 className="font-semibold text-slate-800 mb-4">Student Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <User size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Student</p>
                    <p className="font-medium text-slate-700">{submission.studentName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BookOpen size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Lesson</p>
                    <p className="font-medium text-slate-700">{submission.lessonTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Clock size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Submitted</p>
                    <p className="font-medium text-slate-700">{submission.submittedAt}</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Similarity Score */}
            <GlassCard>
              <h3 className="font-semibold text-slate-800 mb-4">{t("teacher.similarityScore")}</h3>
              <div className="text-center mb-4">
                <span
                  className={`text-4xl font-bold ${
                    submission.similarityScore >= 80
                      ? "text-green-600"
                      : submission.similarityScore >= 60
                        ? "text-yellow-600"
                        : "text-red-500"
                  }`}
                >
                  {submission.similarityScore}%
                </span>
              </div>
              <ProgressBar
                value={submission.similarityScore}
                color={submission.similarityScore >= 80 ? "green" : submission.similarityScore >= 60 ? "yellow" : "red"}
                showValue={false}
              />
              <p className="text-sm text-slate-500 text-center mt-2">
                {submission.similarityScore >= 80
                  ? "Excellent match!"
                  : submission.similarityScore >= 60
                    ? "Good effort"
                    : "Needs improvement"}
              </p>
            </GlassCard>

            {/* Attempt Info */}
            <GlassCard>
              <h3 className="font-semibold text-slate-800 mb-4">Attempt</h3>
              <p className="text-slate-600">
                Attempt {submission.attempt} of {submission.maxAttempts}
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </TeacherLayout>
  )
}
