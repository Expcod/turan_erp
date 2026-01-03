"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { DataTable } from "@/components/ui/data-table"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassSelect } from "@/components/ui/glass-select"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Search, Eye, Coins } from "lucide-react"
import { groupsApi, attendanceApi, homeworkApi, gamificationApi, type Group, type User } from "@/lib/api"

interface StudentData extends User {
  group_name?: string
  group_id?: number
  attendance_rate?: number
  coins?: number
  completed_homework?: number
  total_homework?: number
}

export default function TeacherStudentsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [groupFilter, setGroupFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [students, setStudents] = useState<StudentData[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsResponse = await groupsApi.getAll()

        // Handle paginated response
        const ensureArray = <T,>(data: T[] | { results?: T[] } | null | undefined): T[] => {
          if (Array.isArray(data)) return data
          if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
            return data.results
          }
          return []
        }

        const groupsData = ensureArray(groupsResponse)
        setGroups(groupsData)

        // Fetch students from all teacher's groups
        const allStudents: StudentData[] = []

        for (const group of groupsData) {
          const groupDetail = await groupsApi.getById(group.id)

          if (groupDetail.students && Array.isArray(groupDetail.students)) {
            for (const student of groupDetail.students) {
              // Fetch additional data for each student
              try {
                const [attendanceResponse, homeworkResponse, coinsData] = await Promise.all([
                  attendanceApi.getByStudent(student.id).catch(() => []),
                  homeworkApi.getByStudent(student.id).catch(() => []),
                  gamificationApi.getStudentCoins(student.id).catch(() => ({ coins: 0 })),
                ])

                const attendanceData = ensureArray(attendanceResponse)
                const homeworkData = ensureArray(homeworkResponse)

                const totalAttendance = attendanceData.length
                const presentCount = attendanceData.filter((a: any) => a.status === 'present').length
                const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

                const completedHomework = homeworkData.filter((h: any) => h.status === 'accepted').length

                allStudents.push({
                  ...student,
                  group_name: group.name,
                  group_id: group.id,
                  attendance_rate: attendanceRate,
                  coins: coinsData.coins || 0,
                  completed_homework: completedHomework,
                  total_homework: homeworkData.length,
                })
              } catch (error) {
                console.error(`Failed to fetch data for student ${student.id}:`, error)
                allStudents.push({
                  ...student,
                  group_name: group.name,
                  group_id: group.id,
                  attendance_rate: 0,
                  coins: 0,
                  completed_homework: 0,
                  total_homework: 0,
                })
              }
            }
          }
        }

        setStudents(allStudents)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const columns = [
    {
      key: "name",
      header: t("common.name"),
      render: (item: StudentData) => `${item.first_name} ${item.last_name}`
    },
    {
      key: "group",
      header: t("payments.group"),
      render: (item: StudentData) => item.group_name || "-"
    },
    {
      key: "attendance",
      header: t("teacher.attendance"),
      render: (item: StudentData) => (
        <ProgressBar
          value={item.attendance_rate || 0}
          showValue
          size="sm"
          color={(item.attendance_rate || 0) >= 90 ? "green" : (item.attendance_rate || 0) >= 75 ? "yellow" : "red"}
        />
      ),
    },
    {
      key: "coins",
      header: t("teacher.coins"),
      render: (item: StudentData) => (
        <div className="flex items-center gap-1.5">
          <Coins size={14} className="text-yellow-500" />
          <span className="font-medium">{item.coins || 0}</span>
        </div>
      ),
    },
    {
      key: "submissions",
      header: t("teacher.submissions"),
      render: (item: StudentData) => (
        <span className="text-sm">
          {item.completed_homework || 0}/{item.total_homework || 0}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (item: StudentData) => (
        <Link href={`/teacher/students/${item.id}`}>
          <GlassButton variant="ghost" size="sm">
            <Eye size={16} className="mr-1" />
            {t("common.view")}
          </GlassButton>
        </Link>
      ),
    },
  ]

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase())
    const matchesGroup = !groupFilter || student.group_id?.toString() === groupFilter
    return matchesSearch && matchesGroup
  })

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">{t("common.loading")}</p>
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("teacher.myStudents")}</h1>
          <p className="text-slate-500 mt-1">{t("teacher.manageStudents")}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <GlassInput
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <GlassSelect
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            options={[
              { value: "", label: t("teacher.allGroups") },
              ...groups.map((group) => ({
                value: group.id.toString(),
                label: group.name,
              })),
            ]}
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredStudents}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredStudents.length / 10)}
          onPageChange={setCurrentPage}
          emptyMessage={t("common.noData")}
        />
      </div>
    </TeacherLayout>
  )
}
