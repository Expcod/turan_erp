"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useTranslation } from "@/lib/i18n"
import { DataTable } from "@/components/ui/data-table"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Modal } from "@/components/ui/modal"
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { teachersApi, type User } from "@/lib/api"

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  groupsCount: number
  studentsCount: number
}

export default function TeachersPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
  })

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const response = await teachersApi.getAll().catch(() => [])
      const data = Array.isArray(response) ? response : []
      const mapped = data.map((t: User) => ({
        id: String(t.id),
        name: `${t.first_name} ${t.last_name}`.trim() || t.username,
        email: t.email,
        phone: t.phone_number || "-",
        groupsCount: 0,
        studentsCount: 0,
      }))
      setTeachers(mapped)
    } catch (error) {
      console.error("Failed to fetch teachers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    setCreateLoading(true)

    try {
      await teachersApi.create({
        username: formData.email.split("@")[0],
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        password: formData.password,
        confirm_password: formData.password,
      })
      setIsCreateModalOpen(false)
      setFormData({ first_name: "", last_name: "", email: "", phone_number: "", password: "" })
      fetchTeachers()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create teacher")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return
    try {
      await teachersApi.delete(Number(id))
      fetchTeachers()
    } catch (error) {
      console.error("Failed to delete teacher:", error)
    }
  }

  const columns = [
    { key: "name", header: t("common.name") },
    { key: "email", header: t("common.email") },
    { key: "phone", header: t("common.phone") },
    {
      key: "groupsCount",
      header: t("admin.totalGroups"),
      render: (item: Teacher) => <span className="font-medium">{item.groupsCount}</span>,
    },
    {
      key: "studentsCount",
      header: t("admin.totalStudents"),
      render: (item: Teacher) => <span className="font-medium">{item.studentsCount}</span>,
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (item: Teacher) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/teachers/${item.id}`}>
            <GlassButton variant="ghost" size="sm">
              <Eye size={16} />
            </GlassButton>
          </Link>
          <GlassButton variant="ghost" size="sm">
            <Edit size={16} />
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={() => handleDeleteTeacher(item.id)}>
            <Trash2 size={16} className="text-red-500" />
          </GlassButton>
        </div>
      ),
    },
  ]

  const filteredTeachers = teachers.filter((teacher) => teacher.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t("admin.teachers")}</h1>
            <p className="text-slate-500 mt-1">{t("admin.teacherList")}</p>
          </div>
          <GlassButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            {t("admin.createTeacher")}
          </GlassButton>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <GlassInput
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredTeachers}
          currentPage={currentPage}
          totalPages={2}
          onPageChange={setCurrentPage}
          emptyMessage={t("common.noData")}
        />

        {/* Create Teacher Modal */}
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t("admin.createTeacher")}>
          <form className="space-y-4" onSubmit={handleCreateTeacher}>
            <div className="grid grid-cols-2 gap-4">
              <GlassInput 
                label={t("common.firstName") || "First Name"} 
                placeholder="First name" 
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
              <GlassInput 
                label={t("common.lastName") || "Last Name"} 
                placeholder="Last name" 
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
            <GlassInput 
              label={t("common.email")} 
              type="email" 
              placeholder="email@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <GlassInput 
              label={t("common.phone")} 
              placeholder="+998 XX XXX XXXX" 
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
            <GlassInput 
              label={t("auth.password")} 
              type="password" 
              placeholder="Enter password" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {createError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
                {createError}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <GlassButton type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                {t("common.cancel")}
              </GlassButton>
              <GlassButton type="submit" variant="primary" disabled={createLoading}>
                {createLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t("common.create")}
              </GlassButton>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  )
}
