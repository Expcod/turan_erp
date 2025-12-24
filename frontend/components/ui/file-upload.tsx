"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Upload, X, File, FileText, Music } from "lucide-react"

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onFilesChange?: (files: File[]) => void
  label?: string
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  onFilesChange,
  label = "Upload files",
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFiles = (fileList: FileList | File[]): File[] => {
    const validFiles: File[] = []
    const fileArray = Array.from(fileList)

    for (const file of fileArray) {
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`)
        continue
      }
      validFiles.push(file)
    }

    return validFiles
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      setError(null)

      const validFiles = validateFiles(e.dataTransfer.files)
      const newFiles = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1)
      setFiles(newFiles)
      onFilesChange?.(newFiles)
    },
    [files, multiple, onFilesChange, maxSize],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files) {
      const validFiles = validateFiles(e.target.files)
      const newFiles = multiple ? [...files, ...validFiles] : validFiles.slice(0, 1)
      setFiles(newFiles)
      onFilesChange?.(newFiles)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange?.(newFiles)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("audio/")) return Music
    if (file.type.includes("word") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) return FileText
    return File
  }

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-200 p-8",
          isDragging ? "border-blue-500 bg-blue-50/50" : "border-blue-200 hover:border-blue-300",
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              Drag and drop files here, or <span className="text-blue-600">browse</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Max file size: {maxSize / 1024 / 1024}MB</p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => {
            const FileIcon = getFileIcon(file)
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-blue-100/50">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
