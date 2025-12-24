"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Calendar, Loader2, AlertCircle } from "lucide-react"
import { attendanceApi, lessonsApi, authApi, Attendance, Lesson as ApiLesson } from "@/lib/api"

interface AttendanceRecord {
  date: string
  status: "present" | "absent" | "late"
  lesson: string
  lessonId: number
}

export default function StudentAttendancePage() {
  const { t, language } = useI18n()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [groupName, setGroupName] = useState<string>("")

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get current user first
        const currentUser = await authApi.getCurrentUser()
        
        // Fetch attendance and lessons
        const [attendanceResponse, lessonsResponse] = await Promise.all([
          attendanceApi.getByStudent(currentUser.id),
          lessonsApi.getAll()
        ])
        
        // Ensure arrays
        const attendanceData: Attendance[] = Array.isArray(attendanceResponse) 
          ? attendanceResponse 
          : (attendanceResponse as any)?.results || []
        
        const lessonsData: ApiLesson[] = Array.isArray(lessonsResponse) 
          ? lessonsResponse 
          : (lessonsResponse as any)?.results || []
        
        // Create lessons map
        const lessonsMap = new Map<number, ApiLesson>()
        lessonsData.forEach((lesson: ApiLesson) => {
          lessonsMap.set(lesson.id, lesson)
        })
        
        // Get group name from first lesson
        if (lessonsData.length > 0 && lessonsData[0].group_name) {
          setGroupName(lessonsData[0].group_name)
        }
        
        // Map attendance records
        const mappedRecords: AttendanceRecord[] = attendanceData
          .map((att: Attendance) => {
            const lesson = lessonsMap.get(att.lesson)
            
            // Determine status
            let status: "present" | "absent" | "late" = "present"
            if (att.status === "absent") {
              status = "absent"
            } else if (att.status === "late") {
              status = "late"
            }
            
            return {
              date: att.created_at.split('T')[0],
              status,
              lesson: lesson?.title || `Lesson ${att.lesson}`,
              lessonId: att.lesson
            }
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        setAttendanceRecords(mappedRecords)
      } catch (err) {
        console.error('Attendance fetch error:', err)
        setError(t("common.error"))
      } finally {
        setLoading(false)
      }
    }
    
    fetchAttendance()
  }, [t])

  // Calendar data
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  // Build calendar attendance from records
  const calendarAttendance: Record<number, "present" | "absent" | "late"> = {}
  attendanceRecords.forEach(record => {
    const recordDate = new Date(record.date)
    if (recordDate.getMonth() === currentMonth.getMonth() && 
        recordDate.getFullYear() === currentMonth.getFullYear()) {
      calendarAttendance[recordDate.getDate()] = record.status
    }
  })

  // Calculate stats
  const attendanceStats = {
    totalClasses: attendanceRecords.length,
    attended: attendanceRecords.filter(r => r.status === "present").length,
    absent: attendanceRecords.filter(r => r.status === "absent").length,
    late: attendanceRecords.filter(r => r.status === "late").length,
    percentage: attendanceRecords.length > 0 
      ? Math.round((attendanceRecords.filter(r => r.status === "present").length / attendanceRecords.length) * 100)
      : 0
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = language === 'uz' 
    ? ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"]
    : ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"]

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "absent":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "late":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500"
      case "absent":
        return "bg-red-500"
      case "late":
        return "bg-yellow-500"
      default:
        return "bg-transparent"
    }
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">{t("common.loading")}</span>
        </div>
      </StudentLayout>
    )
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-muted-foreground">{error}</p>
          <GlassButton 
            variant="ghost" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            {t("common.back")}
          </GlassButton>
        </div>
      </StudentLayout>
    )
  }

  // Filter records by selected month
  const filteredRecords = attendanceRecords.filter(record => {
    return record.date.startsWith(selectedMonth)
  })

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("attendance.title")}</h1>
          <p className="text-muted-foreground mt-1">{groupName || t("common.noData")}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <GlassCard className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{attendanceStats.totalClasses}</p>
            <p className="text-xs text-muted-foreground">{t("lessons.totalClasses")}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-l-4 border-l-green-500">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-600">{attendanceStats.attended}</p>
            <p className="text-xs text-muted-foreground">{t("attendance.present")}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-l-4 border-l-red-500">
            <XCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
            <p className="text-xs text-muted-foreground">{t("attendance.absent")}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-l-4 border-l-yellow-500">
            <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
            <p className="text-xs text-muted-foreground">{t("attendance.late")}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-l-4 border-l-primary">
            <div className="text-2xl font-bold text-primary mb-1">{attendanceStats.percentage}%</div>
            <ProgressBar value={attendanceStats.percentage} color="blue" />
            <p className="text-xs text-muted-foreground mt-1">{t("attendance.rate")}</p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar View */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">{t("calendar.title")}</h3>
              <div className="flex items-center gap-2">
                <GlassButton variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </GlassButton>
                <span className="font-medium min-w-[120px] text-center">
                  {currentMonth.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'tr-TR', { month: "long", year: "numeric" })}
                </span>
                <GlassButton variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {days.map((day, index) => (
                <div key={index} className="aspect-square p-1">
                  {day && (
                    <div
                      className={`w-full h-full rounded-lg flex items-center justify-center text-sm relative ${
                        calendarAttendance[day]
                          ? "bg-muted"
                          : day === new Date().getDate() &&
                              currentMonth.getMonth() === new Date().getMonth() &&
                              currentMonth.getFullYear() === new Date().getFullYear()
                            ? "bg-primary/10 border border-primary"
                            : ""
                      }`}
                    >
                      <span className={calendarAttendance[day] ? "font-medium" : "text-muted-foreground"}>{day}</span>
                      {calendarAttendance[day] && (
                        <div
                          className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${getStatusColor(calendarAttendance[day])}`}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">{t("attendance.present")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">{t("attendance.absent")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-muted-foreground">{t("attendance.late")}</span>
              </div>
            </div>
          </GlassCard>

          {/* Attendance Records */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t("attendance.history")}</h3>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
                className="w-40 px-3 py-2 rounded-xl bg-background/50 backdrop-blur-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value={new Date().toISOString().slice(0, 7)}>
                  {new Date().toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'tr-TR', { month: 'long', year: 'numeric' })}
                </option>
                <option value={new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)}>
                  {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'tr-TR', { month: 'long', year: 'numeric' })}
                </option>
                <option value={new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString().slice(0, 7)}>
                  {new Date(new Date().setMonth(new Date().getMonth() - 2)).toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'tr-TR', { month: 'long', year: 'numeric' })}
                </option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredRecords.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t("common.noData")}
                </div>
              )}
              {filteredRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        record.status === "present"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : record.status === "absent"
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-yellow-100 dark:bg-yellow-900/30"
                      }`}
                    >
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{record.lesson}</p>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      record.status === "present"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : record.status === "absent"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {record.status === "present" 
                      ? t("attendance.present") 
                      : record.status === "absent" 
                      ? t("attendance.absent") 
                      : t("attendance.late")}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </StudentLayout>
  )
}
