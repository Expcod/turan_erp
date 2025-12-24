"use client"

import { useState } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { WordPreview } from "@/components/ui/word-preview"
import { AudioPlayer } from "@/components/ui/audio-player"
import { FileUpload } from "@/components/ui/file-upload"
import { ArrowLeft, FileText, Music, Upload } from "lucide-react"

export default function LessonDetailPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<"preview" | "upload">("preview")

  const lesson = {
    week: 1,
    lessonNumber: 1,
    title: "Introduction to Basics",
  }

  const mockHtmlContent = `
    <h1>Introduction to Basics</h1>
    <p>Welcome to your first lesson! In this lesson, we will cover the fundamental concepts that will serve as the foundation for your learning journey.</p>
    <h2>Learning Objectives</h2>
    <ul>
      <li>Understand basic terminology</li>
      <li>Learn essential vocabulary</li>
      <li>Practice pronunciation</li>
    </ul>
    <h2>Key Concepts</h2>
    <p>Before we begin, let's familiarize ourselves with some important concepts that will be used throughout this course.</p>
    <blockquote>Remember: Practice makes perfect!</blockquote>
  `

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/admin/lessons"
          className="inline-flex items-center text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t("common.back")}
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-sm text-blue-600 font-medium">
              Week {lesson.week}, Lesson {lesson.lessonNumber}
            </span>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <GlassButton
              variant={activeTab === "preview" ? "primary" : "ghost"}
              onClick={() => setActiveTab("preview")}
            >
              <FileText size={16} className="mr-2" />
              Preview
            </GlassButton>
            <GlassButton variant={activeTab === "upload" ? "primary" : "ghost"} onClick={() => setActiveTab("upload")}>
              <Upload size={16} className="mr-2" />
              Upload
            </GlassButton>
          </div>
        </div>

        {activeTab === "preview" ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Word Preview */}
            <div className="lg:col-span-2">
              <WordPreview htmlContent={mockHtmlContent} />
            </div>

            {/* Audio Resources */}
            <div className="space-y-4">
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <Music className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-slate-800">Audio Resources</h3>
                </div>
                <div className="space-y-3">
                  <AudioPlayer src="/audio-placeholder" title="Lesson Audio 1" />
                  <AudioPlayer src="/audio-placeholder" title="Practice Audio" />
                </div>
              </GlassCard>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800">Word Document</h3>
              </div>
              <FileUpload accept=".doc,.docx" label="Upload Word File" onFilesChange={(files) => console.log(files)} />
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-slate-800">Audio Files</h3>
              </div>
              <FileUpload
                accept=".mp3,.wav,.m4a"
                multiple
                label="Upload Audio Files"
                onFilesChange={(files) => console.log(files)}
              />
            </GlassCard>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
