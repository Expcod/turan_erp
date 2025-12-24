"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { AudioPlayer } from "@/components/ui/audio-player"
import { WordPreview } from "@/components/ui/word-preview"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft, FileText, Headphones, Mic, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function StudentLessonDetailPage() {
  const { t } = useI18n()
  const params = useParams()
  const [activeTab, setActiveTab] = useState<"content" | "resources" | "homework">("content")

  // Mock lesson data
  const lesson = {
    id: params.id,
    title: "Dars 4: Ranglar",
    description: "Ranglar va ularning nomlari haqida o'rganamiz",
    date: "2024-01-08",
    wordContent: `
# Dars 4: Ranglar

## Asosiy ranglar

- **Qizil** - Kırmızı
- **Ko'k** - Mavi
- **Sariq** - Sarı
- **Yashil** - Yeşil
- **Oq** - Beyaz
- **Qora** - Siyah

## Mashqlar

1. Ranglarni takrorlang
2. Audio materiallarni tinglang
3. Uy vazifasini bajaring

## Qo'shimcha ma'lumot

Ranglar kundalik hayotda juda muhim rol o'ynaydi. Ularni bilish sizga turli narsalarni tasvirlashda yordam beradi.
    `,
    audioFiles: [
      { id: 1, name: "Ranglar - Talaffuz", duration: "3:45", url: "#" },
      { id: 2, name: "Dialog - Do'konda", duration: "5:20", url: "#" },
    ],
    homework: {
      status: "not_started" as const,
      deadline: "2024-01-10",
      attemptsLeft: 3,
      maxAttempts: 3,
    },
  }

  const tabs = [
    { id: "content", label: t("lessonContent"), icon: FileText },
    { id: "resources", label: t("audioResources"), icon: Headphones },
    { id: "homework", label: t("homework"), icon: Mic },
  ]

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/student/lessons">
            <GlassButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </GlassButton>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
            <p className="text-muted-foreground">{lesson.description}</p>
          </div>
          <StatusBadge status="warning">{t("inProgress")}</StatusBadge>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Tab */}
        {activeTab === "content" && (
          <GlassCard className="p-6">
            <WordPreview content={lesson.wordContent} />
          </GlassCard>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t("audioMaterials")}</h3>
              <div className="space-y-4">
                {lesson.audioFiles.map((audio) => (
                  <div key={audio.id} className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{audio.name}</p>
                          <p className="text-sm text-muted-foreground">{audio.duration}</p>
                        </div>
                      </div>
                    </div>
                    <AudioPlayer src={audio.url} />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Homework Tab */}
        {activeTab === "homework" && (
          <div className="space-y-4">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">{t("homeworkAssignment")}</h3>
                <StatusBadge status={lesson.homework.status === "not_started" ? "default" : "warning"}>
                  {lesson.homework.status === "not_started" ? t("notStarted") : t("pending")}
                </StatusBadge>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-medium mb-2">{t("instructions")}</h4>
                  <p className="text-muted-foreground text-sm">
                    Audio yozuvni tinglang va o'zingiz talaffuz qilib, yozib yuboring. Tizim sizning talaffuzingizni
                    tekshiradi va ball beradi.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-xl text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-muted-foreground">{t("deadline")}</p>
                    <p className="font-semibold">{lesson.homework.deadline}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl text-center">
                    <Mic className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">{t("attemptsLeft")}</p>
                    <p className="font-semibold">
                      {lesson.homework.attemptsLeft}/{lesson.homework.maxAttempts}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-xl text-center">
                    <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-sm text-muted-foreground">{t("passingScore")}</p>
                    <p className="font-semibold">70%</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href={`/student/lessons/${lesson.id}/homework`}>
                    <GlassButton className="w-full" size="lg">
                      <Mic className="w-5 h-5 mr-2" />
                      {t("startHomework")}
                    </GlassButton>
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
