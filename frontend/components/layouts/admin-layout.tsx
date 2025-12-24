"use client"

import { type ReactNode, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { useUser } from "@/lib/user-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { AuthGuard } from "@/components/auth-guard"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  UserCircle,
} from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { t } = useTranslation()
  const { user, logout } = useUser()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: t("admin.dashboard") },
    { href: "/admin/groups", icon: Users, label: t("admin.groups") },
    { href: "/admin/teachers", icon: UserCircle, label: t("admin.teachers") },
    { href: "/admin/students", icon: GraduationCap, label: t("admin.students") },
    { href: "/admin/lessons", icon: BookOpen, label: t("admin.lessons") },
    { href: "/admin/payments", icon: CreditCard, label: t("admin.payments") },
    { href: "/admin/settings", icon: Settings, label: t("admin.settings") },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-yellow-50/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
          "bg-gradient-to-b from-white/95 via-white/90 to-slate-50/95",
          "backdrop-blur-xl border-r border-blue-100/50",
          "shadow-[4px_0_24px_rgba(37,99,235,0.05)]",
          sidebarOpen ? "w-64" : "w-20",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-100/50">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                TuranTalim
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-600",
                )}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                {sidebarOpen && isActive && <ChevronRight className="ml-auto" size={16} />}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-100/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-700 truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-slate-500">{t("auth.admin")}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "ml-64" : "ml-20")}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-blue-100/50">
          <div className="flex items-center justify-between h-full px-6">
            <h1 className="text-lg font-semibold text-slate-700">{t("admin.title")}</h1>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthGuard>
  )
}
