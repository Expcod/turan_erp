"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Mic, Square, Play, Pause, RotateCcw, Upload } from "lucide-react"
import { GlassButton } from "./glass-button"

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob) => void
  maxDuration?: number
}

export function AudioRecorder({ onRecordingComplete, maxDuration = 300 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onRecordingComplete?.(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch {
      console.error("Error accessing microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => setDuration((prev) => prev + 1), 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setDuration(0)
    setIsPlaying(false)
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur-xl border border-blue-100/50 shadow-[0_8px_32px_rgba(37,99,235,0.06)] p-6">
      <div className="flex flex-col items-center gap-6">
        {/* Visualization */}
        <div
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
            isRecording
              ? "bg-gradient-to-br from-red-500 to-red-600 animate-pulse"
              : audioUrl
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-blue-500 to-blue-600",
          )}
        >
          <Mic className="w-12 h-12 text-white" />
        </div>

        {/* Timer */}
        <div className="text-center">
          <p className="text-3xl font-mono font-bold text-slate-800">{formatTime(duration)}</p>
          <p className="text-sm text-slate-500 mt-1">
            {isRecording ? (isPaused ? "Paused" : "Recording...") : audioUrl ? "Recording complete" : "Ready to record"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isRecording && !audioUrl && (
            <GlassButton variant="primary" size="lg" onClick={startRecording}>
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </GlassButton>
          )}

          {isRecording && (
            <>
              <GlassButton variant="ghost" onClick={togglePause}>
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
              </GlassButton>
              <GlassButton variant="destructive" onClick={stopRecording}>
                <Square size={20} className="mr-2" />
                Stop
              </GlassButton>
            </>
          )}

          {audioUrl && (
            <>
              <GlassButton variant="ghost" onClick={togglePlayback}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </GlassButton>
              <GlassButton variant="ghost" onClick={resetRecording}>
                <RotateCcw size={20} />
              </GlassButton>
              <GlassButton variant="accent">
                <Upload size={20} className="mr-2" />
                Submit
              </GlassButton>
            </>
          )}
        </div>

        {/* Hidden audio element for playback */}
        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}
      </div>
    </div>
  )
}
