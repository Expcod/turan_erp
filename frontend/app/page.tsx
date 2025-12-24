"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react"

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-blue-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                TuranTalim
              </span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 text-balance">
            {t("common.appName")}
            <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
              Educational ERP Platform
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">{t("auth.loginSubtitle")}</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Admin Card */}
          <GlassCard hover className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{t("auth.admin")}</h2>
            <p className="text-slate-500 text-sm mb-6">{t("admin.title")}</p>
            <Link href="/admin">
              <GlassButton variant="primary" className="w-full">
                {t("auth.login")}
              </GlassButton>
            </Link>
          </GlassCard>

          {/* Teacher Card */}
          <GlassCard hover className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{t("auth.teacher")}</h2>
            <p className="text-slate-500 text-sm mb-6">{t("teacher.title")}</p>
            <Link href="/teacher">
              <GlassButton variant="primary" className="w-full">
                {t("auth.login")}
              </GlassButton>
            </Link>
          </GlassCard>

          {/* Student Card */}
          <GlassCard hover className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{t("auth.student")}</h2>
            <p className="text-slate-500 text-sm mb-6">{t("student.title")}</p>
            <Link href="/student">
              <GlassButton variant="primary" className="w-full">
                {t("auth.login")}
              </GlassButton>
            </Link>
          </GlassCard>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-12">Platform Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, title: "Lesson Management", desc: "Organize and track all lessons" },
              { icon: Users, title: "Group System", desc: "Manage student groups efficiently" },
              { icon: GraduationCap, title: "Progress Tracking", desc: "Monitor student achievements" },
              { icon: Shield, title: "Secure Platform", desc: "Role-based access control" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-blue-100/50"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700">{feature.title}</h3>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
