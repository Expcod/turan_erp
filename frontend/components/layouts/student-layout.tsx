"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { useUser } from "@/lib/user-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { AuthGuard } from "@/components/auth-guard"
import { GlassButton } from "@/components/ui/glass-button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Calendar,
  Trophy,
  LogOut,
  Coins,
  User,
  FileText,
  Menu,
  X,
  GraduationCap,
} from "lucide-react"
import { useState, useEffect } from "react"
import { gamificationApi } from "@/lib/api"

interface StudentLayoutProps {
  children: ReactNode
}

function StudentLayoutContent({ children }: StudentLayoutProps) {
  const { t } = useI18n()
  const { user, setUser } = useUser()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [coins, setCoins] = useState<number>(0)

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const data = await gamificationApi.getMyCoins()
        setCoins(data.coins)
      } catch (err) {
        console.error('Failed to fetch coins:', err)
      }
    }
    fetchCoins()
  }, [])

  const handleLogout = () => {
    setUser(null)
    window.location.href = "/login"
  }

  const navItems = [
    { href: "/student", icon: LayoutDashboard, label: t("common.dashboard") },
    { href: "/student/lessons", icon: BookOpen, label: t("lessons.title") },
    { href: "/student/submissions", icon: FileText, label: t("submissions.title") },
    { href: "/student/attendance", icon: Calendar, label: t("attendance.title") },
    { href: "/student/payments", icon: CreditCard, label: t("payments.title") },
    { href: "/student/leaderboard", icon: Trophy, label: t("gamification.leaderboard") },
    { href: "/student/profile", icon: User, label: t("common.profile") },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-yellow-500/5">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/student" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hidden sm:block">
                TuranTalim
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                    )}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Coins Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700">
                <Coins size={16} className="text-yellow-600" />
                <span className="font-semibold text-yellow-700 dark:text-yellow-400">{coins}</span>
              </div>

              <LanguageSwitcher />

              {/* User Menu */}
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/student/profile">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-medium text-sm cursor-pointer hover:scale-105 transition-transform">
                    {user?.name?.charAt(0) || "S"}
                  </div>
                </Link>
                <GlassButton variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:bg-red-50">
                  <LogOut size={18} />
                </GlassButton>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full"
              >
                <LogOut size={20} />
                <span>{t("common.logout")}</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  )
}

export function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <StudentLayoutContent>{children}</StudentLayoutContent>
    </AuthGuard>
  )
}
