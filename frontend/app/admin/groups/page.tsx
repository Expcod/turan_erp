"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useTranslation } from "@/lib/i18n"
import { DataTable } from "@/components/ui/data-table"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { StatusBadge } from "@/components/ui/status-badge"
import { Modal } from "@/components/ui/modal"
import { GlassSelect } from "@/components/ui/glass-select"
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { groupsApi, teachersApi, coursesApi, type Group as ApiGroup, type User, type Course } from "@/lib/api"

interface Group {
  id: string
  name: string
  teacher: string
  teacherId: number
  studentsCount: number
  schedule: string
  status: "active" | "inactive" | "completed"
}

export default function GroupsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    teacher_id: "",
    course_id: "",
    start_date: "",
    end_date: "",
    schedule: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [groupsResponse, teachersResponse, coursesResponse] = await Promise.all([
        groupsApi.getAll().catch(() => []),
        teachersApi.getAll().catch(() => []),
        coursesApi.getAll().catch(() => []),
      ])
      
      // Ensure arrays (handle paginated or non-array responses)
      const groupsData = Array.isArray(groupsResponse) ? groupsResponse : []
      const teachersData = Array.isArray(teachersResponse) ? teachersResponse : []
      const coursesData = Array.isArray(coursesResponse) ? coursesResponse : []
      
      const mapped = groupsData.map((g: ApiGroup) => ({
        id: String(g.id),
        name: g.name,
        teacher: g.teacher_name || `Teacher #${g.teacher}`,
        teacherId: g.teacher,
        studentsCount: g.students_count || g.students?.length || 0,
        schedule: g.schedule || "-",
        status: g.status,
      }))
      setGroups(mapped)
      setTeachers(teachersData)
      setCourses(coursesData)
    } catch (error) {
      console.error("Failed to fetch groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError("")
    setCreateLoading(true)

    try {
      await groupsApi.create({
        name: formData.name,
        teacher: Number(formData.teacher_id),
        course: Number(formData.course_id),
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        schedule: formData.schedule,
        status: "active",
      })
      setIsCreateModalOpen(false)
      setFormData({ name: "", teacher_id: "", course_id: "", start_date: "", end_date: "", schedule: "" })
      fetchData()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create group")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return
    try {
      await groupsApi.delete(Number(id))
      fetchData()
    } catch (error) {
      console.error("Failed to delete group:", error)
    }
  }

  const statusMap = {
    active: { type: "success" as const, label: t("groups.active") },
    inactive: { type: "warning" as const, label: t("groups.inactive") },
    completed: { type: "info" as const, label: t("groups.completed") },
  }

  const columns = [
    { key: "name", header: t("groups.name") },
    { key: "teacher", header: t("groups.teacher") },
    {
      key: "studentsCount",
      header: t("groups.studentsCount"),
      render: (item: Group) => <span className="font-medium">{item.studentsCount}</span>,
    },
    { key: "schedule", header: t("groups.schedule") },
    {
      key: "status",
      header: t("groups.status"),
      render: (item: Group) => (
        <StatusBadge status={statusMap[item.status].type}>{statusMap[item.status].label}</StatusBadge>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (item: Group) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/groups/${item.id}`}>
            <GlassButton variant="ghost" size="sm">
              <Eye size={16} />
            </GlassButton>
          </Link>
          <GlassButton variant="ghost" size="sm">
            <Edit size={16} />
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onClick={() => handleDeleteGroup(item.id)}>
            <Trash2 size={16} className="text-red-500" />
          </GlassButton>
        </div>
      ),
    },
  ]

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t("admin.groups")}</h1>
            <p className="text-slate-500 mt-1">{t("admin.groupList")}</p>
          </div>
          <GlassButton variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            {t("admin.createGroup")}
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
          data={filteredGroups}
          currentPage={currentPage}
          totalPages={3}
          onPageChange={setCurrentPage}
          emptyMessage={t("common.noData")}
        />

        {/* Create Group Modal */}
        <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={t("admin.createGroup")}>
          <form className="space-y-4" onSubmit={handleCreateGroup}>
            <GlassInput 
              label={t("groups.name")} 
              placeholder="Enter group name" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <GlassSelect
              label={t("groups.course") || "Course"}
              value={formData.course_id}
              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
              options={[
                { value: "", label: "Select course" },
                ...courses.map(c => ({ value: String(c.id), label: c.name }))
              ]}
            />
            <GlassSelect
              label={t("groups.teacher")}
              value={formData.teacher_id}
              onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
              options={[
                { value: "", label: "Select teacher" },
                ...teachers.map(t => ({ value: String(t.id), label: `${t.first_name} ${t.last_name}`.trim() || t.username }))
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <GlassInput 
                label={t("groups.startDate")} 
                type="date" 
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
              <GlassInput 
                label={t("groups.endDate")} 
                type="date" 
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <GlassInput 
              label={t("groups.schedule")} 
              placeholder="e.g., Mon, Wed, Fri 09:00" 
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
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
