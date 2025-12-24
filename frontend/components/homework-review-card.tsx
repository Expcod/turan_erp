"use client"
import { AudioPlayer } from "./ui/audio-player"
import { GlassButton } from "./ui/glass-button"
import { StatusBadge } from "./ui/status-badge"
import { ProgressBar } from "./ui/progress-bar"
import { Check, X, RotateCcw } from "lucide-react"

interface HomeworkReviewCardProps {
  studentName: string
  studentAvatar?: string
  audioUrl: string
  transcription: string
  similarityScore: number
  status: "pending" | "accepted" | "rejected"
  submittedAt: string
  onAccept?: () => void
  onReject?: () => void
  onGrantSecondChance?: () => void
}

export function HomeworkReviewCard({
  studentName,
  studentAvatar,
  audioUrl,
  transcription,
  similarityScore,
  status,
  submittedAt,
  onAccept,
  onReject,
  onGrantSecondChance,
}: HomeworkReviewCardProps) {
  const statusMap = {
    pending: { type: "pending" as const, label: "Pending Review" },
    accepted: { type: "success" as const, label: "Accepted" },
    rejected: { type: "error" as const, label: "Rejected" },
  }

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-[0_8px_32px_rgba(37,99,235,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-blue-100/50 bg-gradient-to-r from-blue-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white font-medium">
              {studentAvatar || studentName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{studentName}</h3>
              <p className="text-xs text-slate-500">Submitted {submittedAt}</p>
            </div>
          </div>
          <StatusBadge status={statusMap[status].type}>{statusMap[status].label}</StatusBadge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Audio Player */}
        <AudioPlayer src={audioUrl} title="Student Recording" />

        {/* Transcription */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-sm font-medium text-slate-700 mb-2">Transcription</p>
          <p className="text-sm text-slate-600 leading-relaxed">{transcription}</p>
        </div>

        {/* Similarity Score */}
        <div>
          <ProgressBar
            label="Similarity Score"
            value={similarityScore}
            color={similarityScore >= 80 ? "green" : similarityScore >= 60 ? "yellow" : "red"}
          />
        </div>

        {/* Actions */}
        {status === "pending" && (
          <div className="flex items-center gap-3 pt-2">
            <GlassButton variant="primary" className="flex-1" onClick={onAccept}>
              <Check size={16} className="mr-2" />
              Accept
            </GlassButton>
            <GlassButton variant="destructive" className="flex-1" onClick={onReject}>
              <X size={16} className="mr-2" />
              Reject
            </GlassButton>
          </div>
        )}

        {status === "rejected" && (
          <GlassButton variant="accent" className="w-full" onClick={onGrantSecondChance}>
            <RotateCcw size={16} className="mr-2" />
            Grant Second Chance
          </GlassButton>
        )}
      </div>
    </div>
  )
}
