"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { AudioPlayer } from "@/components/ui/audio-player"
import { AudioRecorder } from "@/components/ui/audio-recorder"
import { Modal } from "@/components/ui/modal"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ArrowLeft, Headphones, CheckCircle, XCircle, Coins, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function HomeworkSubmissionPage() {
  const { t } = useI18n()
  const params = useParams()
  const router = useRouter()
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    show: boolean
    passed: boolean
    score: number
    coins: number
    transcription: string
    feedback: string
  } | null>(null)

  const lesson = {
    id: params.id,
    title: "Dars 4: Ranglar",
    referenceAudio: "#",
    referenceText: "Bugün hava çok güzel. Gökyüzü mavi ve güneş sarı.",
    attemptsLeft: 3,
    passingScore: 70,
  }

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedAudio(blob)
  }

  const handleSubmit = async () => {
    if (!recordedAudio) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock result
    const score = Math.floor(Math.random() * 40) + 60 // Random score 60-100
    const passed = score >= lesson.passingScore

    setResult({
      show: true,
      passed,
      score,
      coins: passed ? 10 : 0,
      transcription: "Bugün hava çok güzel. Gökyüzü mavi ve güneş sarı.",
      feedback: passed
        ? "Ajoyib! Sizning talaffuzingiz juda yaxshi."
        : "Yana urinib ko'ring. Talaffuzni yaxshilash kerak.",
    })

    setIsSubmitting(false)
  }

  const handleRetry = () => {
    setRecordedAudio(null)
    setResult(null)
  }

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/student/lessons/${params.id}`}>
            <GlassButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </GlassButton>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("homework")}</h1>
            <p className="text-muted-foreground">{lesson.title}</p>
          </div>
        </div>

        {/* Instructions */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-3">{t("instructions")}</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Quyidagi audio yozuvni diqqat bilan tinglang</li>
            <li>O'zingiz ham xuddi shunday talaffuz qiling va yozib yuboring</li>
            <li>Tizim sizning talaffuzingizni tekshiradi</li>
            <li>70% dan yuqori ball olsangiz, uy vazifasi qabul qilinadi</li>
          </ol>
          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              <strong>{t("attemptsLeft")}:</strong> {lesson.attemptsLeft}
            </p>
          </div>
        </GlassCard>

        {/* Reference Audio */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Headphones className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{t("referenceAudio")}</h3>
              <p className="text-sm text-muted-foreground">{t("listenCarefully")}</p>
            </div>
          </div>
          <AudioPlayer src={lesson.referenceAudio} />
          <div className="mt-4 p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">{t("referenceText")}:</p>
            <p className="font-medium italic">"{lesson.referenceText}"</p>
          </div>
        </GlassCard>

        {/* Recording Section */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">{t("yourRecording")}</h3>
          <AudioRecorder onRecordingComplete={handleRecordingComplete} maxDuration={60} />

          {recordedAudio && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex gap-3">
                <GlassButton onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? t("submitting") : t("submit")}
                </GlassButton>
                <GlassButton variant="outline" onClick={handleRetry}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("recordAgain")}
                </GlassButton>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Result Modal */}
        <Modal
          isOpen={result?.show || false}
          onClose={() => {
            if (result?.passed) {
              router.push(`/student/lessons/${params.id}`)
            } else {
              handleRetry()
            }
          }}
          title={result?.passed ? t("congratulations") : t("tryAgain")}
          size="md"
        >
          {result && (
            <div className="space-y-6">
              <div className="text-center">
                {result.passed ? (
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{result.score}%</h3>
                <p className="text-muted-foreground">{result.feedback}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t("similarityScore")}</p>
                  <ProgressBar value={result.score} color={result.passed ? "success" : "error"} />
                </div>

                {result.coins > 0 && (
                  <div className="flex items-center justify-center gap-2 p-4 bg-yellow-500/10 rounded-xl">
                    <Coins className="w-6 h-6 text-yellow-500" />
                    <span className="text-xl font-bold text-yellow-600">+{result.coins}</span>
                    <span className="text-muted-foreground">{t("coinsEarned")}</span>
                  </div>
                )}

                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">{t("yourTranscription")}:</p>
                  <p className="italic">"{result.transcription}"</p>
                </div>
              </div>

              <div className="flex gap-3">
                {result.passed ? (
                  <GlassButton className="w-full" onClick={() => router.push("/student/lessons")}>
                    {t("backToLessons")}
                  </GlassButton>
                ) : (
                  <>
                    <GlassButton
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/student/lessons/${params.id}`)}
                    >
                      {t("cancel")}
                    </GlassButton>
                    <GlassButton className="flex-1" onClick={handleRetry}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t("tryAgain")}
                    </GlassButton>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </StudentLayout>
  )
}
