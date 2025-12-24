"use client"

import { useState } from "react"
import Link from "next/link"
import { TeacherLayout } from "@/components/layouts/teacher-layout"
import { useTranslation } from "@/lib/i18n"
import { DataTable } from "@/components/ui/data-table"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassSelect } from "@/components/ui/glass-select"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Search, Eye, Coins } from "lucide-react"

interface Student {
  id: string
  name: string
  group: string
  attendance: number
  coins: number
  submissionsCompleted: number
  totalSubmissions: number
}

export default function TeacherStudentsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [groupFilter, setGroupFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const students: Student[] = [
    {
      id: "1",
      name: "Ali Valiyev",
      group: "Group A1",
      attendance: 95,
      coins: 150,
      submissionsCompleted: 8,
      totalSubmissions: 10,
    },
    {
      id: "2",
      name: "Malika Karimova",
      group: "Group A1",
      attendance: 88,
      coins: 120,
      submissionsCompleted: 7,
      totalSubmissions: 10,
    },
    {
      id: "3",
      name: "Jasur Toshev",
      group: "Group A1",
      attendance: 92,
      coins: 180,
      submissionsCompleted: 9,
      totalSubmissions: 10,
    },
    {
      id: "4",
      name: "Dilnoza Rahimova",
      group: "Group B2",
      attendance: 78,
      coins: 90,
      submissionsCompleted: 6,
      totalSubmissions: 10,
    },
    {
      id: "5",
      name: "Bobur Aliyev",
      group: "Group B2",
      attendance: 85,
      coins: 110,
      submissionsCompleted: 7,
      totalSubmissions: 10,
    },
    {
      id: "6",
      name: "Shaxnoza Tursunova",
      group: "Group C1",
      attendance: 100,
      coins: 200,
      submissionsCompleted: 10,
      totalSubmissions: 10,
    },
  ]

  const columns = [
    { key: "name", header: t("common.name") },
    { key: "group", header: t("payments.group") },
    {
      key: "attendance",
      header: t("teacher.attendance"),
      render: (item: Student) => (
        <ProgressBar
          value={item.attendance}
          showValue
          size="sm"
          color={item.attendance >= 90 ? "green" : item.attendance >= 75 ? "yellow" : "red"}
        />
      ),
    },
    {
      key: "coins",
      header: t("teacher.coins"),
      render: (item: Student) => (
        <div className="flex items-center gap-1.5">
          <Coins size={14} className="text-yellow-500" />
          <span className="font-medium">{item.coins}</span>
        </div>
      ),
    },
    {
      key: "submissions",
      header: t("teacher.submissions"),
      render: (item: Student) => (
        <span className="text-sm">
          {item.submissionsCompleted}/{item.totalSubmissions}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (item: Student) => (
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
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = !groupFilter || student.group === groupFilter
    return matchesSearch && matchesGroup
  })

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("teacher.myStudents")}</h1>
          <p className="text-slate-500 mt-1">View and manage your students</p>
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
              { value: "", label: "All Groups" },
              { value: "Group A1", label: "Group A1" },
              { value: "Group B2", label: "Group B2" },
              { value: "Group C1", label: "Group C1" },
            ]}
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredStudents}
          currentPage={currentPage}
          totalPages={2}
          onPageChange={setCurrentPage}
          emptyMessage={t("common.noData")}
        />
      </div>
    </TeacherLayout>
  )
}
