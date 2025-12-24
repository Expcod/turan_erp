"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useTranslation } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Percent, Coins, Clock, RefreshCw, Save } from "lucide-react"

export default function SettingsPage() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState({
    similarityThreshold: 80,
    coinsPerLesson: 10,
    coinsPerHomework: 5,
    assignmentDeadline: 7,
    maxAttempts: 1,
  })

  const handleChange = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: Number.parseInt(value) || 0,
    }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t("admin.settings")}</h1>
            <p className="text-slate-500 mt-1">{t("settings.configureSettings")}</p>
          </div>
          <GlassButton variant="primary">
            <Save size={18} className="mr-2" />
            {t("settings.save")}
          </GlassButton>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Similarity Settings */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Percent className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{t("admin.similarityThreshold")}</h3>
                <p className="text-sm text-slate-500">Minimum similarity score for homework acceptance</p>
              </div>
            </div>
            <div className="space-y-4">
              <GlassInput
                label="Threshold (%)"
                type="number"
                min="0"
                max="100"
                value={settings.similarityThreshold}
                onChange={(e) => handleChange("similarityThreshold", e.target.value)}
              />
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-700">
                  Homework with similarity score below {settings.similarityThreshold}% will be automatically rejected.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Coin Settings */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Coins className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{t("admin.coinSettings")}</h3>
                <p className="text-sm text-slate-500">Configure coin rewards for activities</p>
              </div>
            </div>
            <div className="space-y-4">
              <GlassInput
                label="Coins per lesson attendance"
                type="number"
                min="0"
                value={settings.coinsPerLesson}
                onChange={(e) => handleChange("coinsPerLesson", e.target.value)}
              />
              <GlassInput
                label="Coins per homework completion"
                type="number"
                min="0"
                value={settings.coinsPerHomework}
                onChange={(e) => handleChange("coinsPerHomework", e.target.value)}
              />
            </div>
          </GlassCard>

          {/* Assignment Deadline */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{t("admin.assignmentDeadline")}</h3>
                <p className="text-sm text-slate-500">Default deadline for homework submissions</p>
              </div>
            </div>
            <div className="space-y-4">
              <GlassInput
                label="Days after lesson"
                type="number"
                min="1"
                value={settings.assignmentDeadline}
                onChange={(e) => handleChange("assignmentDeadline", e.target.value)}
              />
              <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                <p className="text-sm text-green-700">
                  Students will have {settings.assignmentDeadline} days to submit their homework after each lesson.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Max Attempts */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{t("admin.maxAttempts")}</h3>
                <p className="text-sm text-slate-500">Maximum homework submission attempts</p>
              </div>
            </div>
            <div className="space-y-4">
              <GlassInput
                label="Default attempts"
                type="number"
                min="1"
                max="10"
                value={settings.maxAttempts}
                onChange={(e) => handleChange("maxAttempts", e.target.value)}
              />
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-sm text-purple-700">
                  Students can submit homework up to {settings.maxAttempts} time(s). Teachers can grant additional
                  attempts.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AdminLayout>
  )
}
