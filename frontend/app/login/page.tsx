"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { useUser } from "@/lib/user-context"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { LanguageSwitcher } from "@/components/language-switcher"
import { GraduationCap, Eye, EyeOff, Shield, User, BookOpen, Loader2 } from "lucide-react"
import Link from "next/link"

type UserRole = "admin" | "teacher" | "student"

export default function LoginPage() {
  const { t } = useI18n()
  const router = useRouter()
  const { login, user } = useUser()
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")

  const roles = [
    {
      id: "admin" as UserRole,
      label: t("admin"),
      icon: Shield,
      color: "bg-red-500",
    },
    {
      id: "teacher" as UserRole,
      label: t("teacher"),
      icon: BookOpen,
      color: "bg-primary",
    },
    {
      id: "student" as UserRole,
      label: t("student"),
      icon: User,
      color: "bg-green-500",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!formData.username || !formData.password) {
      setError(t("invalidCredentials"))
      setIsLoading(false)
      return
    }

    const result = await login(formData.username, formData.password)
    
    if (result.success && result.user) {
      // Redirect based on actual user role, not selected role
      router.push(`/${result.user.role}`)
    } else {
      setError(result.error || t("invalidCredentials"))
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-yellow-500/10 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        <GlassCard className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">TuranTalim</h1>
            <p className="text-muted-foreground mt-1">{t("loginSubtitle")}</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-muted-foreground mb-3 block">{t("selectRole")}</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedRole === role.id
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${role.color} flex items-center justify-center mx-auto mb-2`}>
                    <role.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-medium">{role.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("email")}</label>
              <GlassInput
                type="text"
                placeholder={t("enterEmail")}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("password")}</label>
              <div className="relative">
                <GlassInput
                  type={showPassword ? "text" : "password"}
                  placeholder={t("enterPassword")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-muted-foreground">{t("rememberMe")}</span>
              </label>
              <Link href="/forgot-password" className="text-primary hover:underline">
                {t("forgotPassword")}
              </Link>
            </div>

            <GlassButton type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("loggingIn")}
                </>
              ) : (
                t("login")
              )}
            </GlassButton>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <p className="text-sm font-medium text-center mb-2">{t("demoCredentials")}</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Admin: admin@turantalim.uz</p>
              <p>Teacher: teacher@turantalim.uz</p>
              <p>Student: student@turantalim.uz</p>
              <p>{t("password")}: demo123</p>
            </div>
          </div>
        </GlassCard>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}
