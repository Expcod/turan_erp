"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Mail, Phone, Calendar, Award, Coins, BookOpen, TrendingUp, Edit, Save, Loader2, AlertCircle } from "lucide-react"
import { authApi, usersApi, studentDashboardApi, gamificationApi, StudentDashboardData } from "@/lib/api"

interface ProfileData {
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone_number: string | null
    avatar: string | null
    created_at: string
  }
  stats: {
    coins: number
    completed_lessons: number
    total_lessons: number
    average_score: number
    pending_homework: number
  }
  course_progress: {
    group_name: string
    group_id: number
    total_lessons: number
    completed_lessons: number
    progress_percent: number
  } | null
  rank: {
    position: number
    total: number
  }
  achievements: {
    id: number
    title: string
    description: string
    icon: string
    earned: boolean
  }[]
}

export default function StudentProfilePage() {
  const { t, language } = useI18n()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch current user and dashboard data
        const [userData, dashboardData, coinsData] = await Promise.all([
          authApi.getCurrentUser(),
          studentDashboardApi.getDashboard(),
          gamificationApi.getMyCoins()
        ])
        
        // Get achievements
        let achievements: ProfileData['achievements'] = []
        try {
          const achievementsData = await gamificationApi.getAchievements(userData.id)
          achievements = (achievementsData as any[]).map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.description,
            icon: a.icon || '🏆',
            earned: true
          }))
        } catch {
          // No achievements yet
        }
        
        // Default achievements if none exist
        const defaultAchievements = [
          { id: 1, title: language === 'uz' ? "Birinchi qadam" : "İlk Adım", description: language === 'uz' ? "Birinchi darsni tugatdi" : "İlk dersi tamamladı", icon: "🎯", earned: dashboardData.stats.completed_lessons > 0 },
          { id: 2, title: language === 'uz' ? "Izchil o'quvchi" : "Düzenli Öğrenci", description: language === 'uz' ? "5 kun ketma-ket o'qidi" : "5 gün üst üste çalıştı", icon: "🔥", earned: dashboardData.stats.completed_lessons >= 5 },
          { id: 3, title: language === 'uz' ? "A'lochi" : "Başarılı", description: language === 'uz' ? "90% dan yuqori ball oldi" : "90%'dan yüksek puan aldı", icon: "⭐", earned: dashboardData.stats.average_score >= 90 },
          { id: 4, title: language === 'uz' ? "Poliglot" : "Poliglot", description: language === 'uz' ? "100 ta so'z o'rgandi" : "100 kelime öğrendi", icon: "📚", earned: false },
          { id: 5, title: language === 'uz' ? "Usta talaffuz" : "Telaffuz Ustası", description: language === 'uz' ? "10 ta audio topshirdi" : "10 ses kaydı gönderdi", icon: "🎤", earned: false },
        ]
        
        setProfileData({
          user: {
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            phone_number: userData.phone_number || null,
            avatar: userData.avatar || null,
            created_at: userData.created_at
          },
          stats: {
            coins: coinsData.coins,
            completed_lessons: dashboardData.stats.completed_lessons,
            total_lessons: dashboardData.stats.total_lessons,
            average_score: dashboardData.stats.average_score,
            pending_homework: dashboardData.stats.pending_homework
          },
          course_progress: dashboardData.course_progress,
          rank: {
            position: 0,
            total: 0
          },
          achievements: achievements.length > 0 ? achievements : defaultAchievements
        })
        
        setFormData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone_number: userData.phone_number || ""
        })
        
      } catch (err) {
        console.error('Profile fetch error:', err)
        setError(t("common.error"))
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfileData()
  }, [t, language])

  const handleSave = async () => {
    if (!profileData) return
    
    try {
      setSaving(true)
      await usersApi.update(profileData.user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number || undefined
      })
      
      setProfileData({
        ...profileData,
        user: {
          ...profileData.user,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number
        }
      })
      
      setIsEditing(false)
    } catch (err) {
      console.error('Save error:', err)
      setError(t("common.error"))
    } finally {
      setSaving(false)
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

  if (error || !profileData) {
    return (
      <StudentLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-muted-foreground">{error || t("common.noData")}</p>
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

  const { user, stats, course_progress, rank, achievements } = profileData
  const fullName = `${user.first_name} ${user.last_name}`.trim() || user.email
  const joinedDate = new Date(user.created_at).toLocaleDateString()

  return (
    <StudentLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">{t("profile.my")}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard className="p-6 lg:col-span-1">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto mb-4 overflow-hidden flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {user.first_name?.charAt(0) || user.email?.charAt(0) || 'S'}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold">{fullName}</h2>
              <p className="text-muted-foreground">{course_progress?.group_name || t("common.noData")}</p>

              <div className="flex items-center justify-center gap-2 mt-3">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="text-xl font-bold text-yellow-600">{stats.coins}</span>
              </div>

              {rank.total > 0 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground">{t("gamification.yourRank")}</p>
                  <p className="text-lg font-semibold">
                    #{rank.position} / {rank.total}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {user.phone_number && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{user.phone_number}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {t("profile.joinedAt")}: {joinedDate}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Stats & Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="p-4 text-center">
                <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.completed_lessons}</p>
                <p className="text-xs text-muted-foreground">{t("student.completedLessons")}</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{stats.average_score}%</p>
                <p className="text-xs text-muted-foreground">{t("student.averageScore")}</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{stats.coins}</p>
                <p className="text-xs text-muted-foreground">{t("gamification.coins")}</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{achievements.filter((a) => a.earned).length}</p>
                <p className="text-xs text-muted-foreground">{t("gamification.achievements")}</p>
              </GlassCard>
            </div>

            {/* Course Progress */}
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4">{t("student.courseProgress")}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{course_progress?.group_name || t("common.noData")}</span>
                  <span>
                    {stats.completed_lessons}/{stats.total_lessons} {t("lessons.title")}
                  </span>
                </div>
                <ProgressBar 
                  value={stats.total_lessons > 0 ? (stats.completed_lessons / stats.total_lessons) * 100 : 0} 
                  color="blue" 
                />
              </div>
            </GlassCard>

            {/* Edit Profile */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{t("profile.personalInfo")}</h3>
                <GlassButton
                  variant={isEditing ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {t("common.save")}
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      {t("common.edit")}
                    </>
                  )}
                </GlassButton>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">{t("common.name")}</label>
                    <GlassInput
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder={language === 'uz' ? "Ism" : "Ad"}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">{language === 'uz' ? "Familiya" : "Soyad"}</label>
                    <GlassInput
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder={language === 'uz' ? "Familiya" : "Soyad"}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("common.email")}</label>
                  <GlassInput
                    type="email"
                    value={formData.email}
                    disabled={true}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t("common.phone")}</label>
                  <GlassInput
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    disabled={!isEditing}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Achievements */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">{t("gamification.achievements")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl text-center transition-all ${
                  achievement.earned ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-muted/50 opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className="font-medium text-sm">{achievement.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </StudentLayout>
  )
}
