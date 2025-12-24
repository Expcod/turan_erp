"use client"

import { useState, useEffect } from "react"
import { StudentLayout } from "@/components/layouts/student-layout"
import { useI18n } from "@/lib/i18n"
import { GlassCard } from "@/components/ui/glass-card"
import { Coins, Trophy, Medal, Award, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { gamificationApi, authApi, groupsApi } from "@/lib/api"

interface LeaderboardEntry {
  rank: number
  id: number
  name: string
  avatar: string
  coins: number
  completedLessons: number
  averageScore: number
  isCurrentUser?: boolean
}

export default function LeaderboardPage() {
  const { t, language } = useI18n()
  const [timeFilter, setTimeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [groupName, setGroupName] = useState<string>("")

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get current user
        const currentUser = await authApi.getCurrentUser()
        console.log('Current user:', currentUser)
        
        // Get user's groups to find group ID
        const groupsResponse = await groupsApi.getAll()
        console.log('Groups response:', groupsResponse)
        
        const groupsData = Array.isArray(groupsResponse) ? groupsResponse : (groupsResponse as any)?.results || []
        console.log('Groups data:', groupsData)
        
        if (groupsData.length === 0) {
          console.log('No groups found for user')
          setError(t("common.noData"))
          setLoading(false)
          return
        }
        
        const firstGroup = groupsData[0]
        console.log('Using group:', firstGroup)
        setGroupName(firstGroup.name)
        
        // Fetch leaderboard for the group
        console.log('Fetching leaderboard for group ID:', firstGroup.id)
        const leaderboardResponse = await gamificationApi.getLeaderboard(firstGroup.id)
        console.log('Leaderboard response:', leaderboardResponse)
        
        // Ensure array
        const leaderboardData = Array.isArray(leaderboardResponse) 
          ? leaderboardResponse 
          : (leaderboardResponse as any)?.results || []
        
        console.log('Leaderboard data:', leaderboardData)
        
        if (leaderboardData.length === 0) {
          console.log('No leaderboard entries found')
          setError(t("common.noData"))
          setLoading(false)
          return
        }
        
        // Map to leaderboard entries
        const mappedLeaderboard: LeaderboardEntry[] = leaderboardData.map((entry: any, index: number) => {
          const fullName = `${entry.student_first_name || ''} ${entry.student_last_name || ''}`.trim() || entry.student_email || 'Student'
          
          return {
            rank: index + 1,
            id: entry.student_id,
            name: fullName,
            avatar: entry.student_avatar || '',
            coins: entry.total_coins || 0,
            completedLessons: entry.completed_lessons || 0,
            averageScore: entry.average_score || 0,
            isCurrentUser: entry.student_id === currentUser.id
          }
        })
        
        console.log('Mapped leaderboard:', mappedLeaderboard)
        setLeaderboard(mappedLeaderboard)
        
      } catch (err) {
        console.error('Leaderboard fetch error:', err)
        setError(t("common.error"))
      } finally {
        setLoading(false)
      }
    }
    
    fetchLeaderboard()
  }, [t])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>
    }
  }

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30"
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30"
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-600/5 border-amber-600/30"
      default:
        return "bg-muted/50"
    }
  }

  const currentUser = leaderboard.find((entry) => entry.isCurrentUser)

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
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("leaderboard.title")}</h1>
            <p className="text-muted-foreground mt-1">{groupName || t("common.noData")}</p>
          </div>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)} 
            className="w-48 px-4 py-2 rounded-xl bg-background/50 backdrop-blur-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{t("common.all")} {t("common.time")}</option>
            <option value="week">{t("common.week")}</option>
            <option value="month">{language === 'uz' ? 'Oy' : 'Ay'}</option>
          </select>
        </div>

        {/* Current User Stats */}
        {currentUser && (
          <GlassCard className="p-6 border-2 border-primary/30 bg-primary/5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={currentUser.avatar || "/placeholder.svg"}
                    alt={currentUser.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.rank}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-lg">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("leaderboard.yourRank")}: #{currentUser.rank}
                  </p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-background/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="text-xl font-bold text-yellow-600">{currentUser.coins}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("gamification.coins")}</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-xl">
                  <div className="text-xl font-bold text-primary">{currentUser.completedLessons}</div>
                  <p className="text-xs text-muted-foreground">{t("lessons.title")}</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-xl">
                  <div className="text-xl font-bold text-green-600">{currentUser.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">{t("student.averageScore")}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 items-end">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="relative inline-block mb-2">
              <img
                src={leaderboard[1].avatar || "/placeholder.svg"}
                alt={leaderboard[1].name}
                className="w-16 h-16 rounded-full object-cover border-4 border-gray-400 mx-auto"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <Medal className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="font-semibold text-sm mt-3">{leaderboard[1].name}</p>
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <Coins className="w-4 h-4" />
              <span className="font-bold">{leaderboard[1].coins}</span>
            </div>
            <div className="h-20 bg-gray-400/20 rounded-t-xl mt-2 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-500">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="relative inline-block mb-2">
              <img
                src={leaderboard[0].avatar || "/placeholder.svg"}
                alt={leaderboard[0].name}
                className="w-20 h-20 rounded-full object-cover border-4 border-yellow-500 mx-auto"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="font-semibold mt-3">{leaderboard[0].name}</p>
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <Coins className="w-4 h-4" />
              <span className="font-bold">{leaderboard[0].coins}</span>
            </div>
            <div className="h-28 bg-yellow-500/20 rounded-t-xl mt-2 flex items-center justify-center">
              <span className="text-3xl font-bold text-yellow-600">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="relative inline-block mb-2">
              <img
                src={leaderboard[2].avatar || "/placeholder.svg"}
                alt={leaderboard[2].name}
                className={`w-16 h-16 rounded-full object-cover border-4 ${leaderboard[2].isCurrentUser ? "border-primary" : "border-amber-600"} mx-auto`}
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="font-semibold text-sm mt-3">{leaderboard[2].name}</p>
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <Coins className="w-4 h-4" />
              <span className="font-bold">{leaderboard[2].coins}</span>
            </div>
            <div className="h-16 bg-amber-600/20 rounded-t-xl mt-2 flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-600">3</span>
            </div>
          </div>
        </div>
        )}

        {/* Full Leaderboard */}
        <GlassCard className="p-6">
          <h3 className="font-semibold mb-4">
            {t("common.all")} {t("students.title")}
          </h3>
          <div className="space-y-2">
            {leaderboard.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p>{t("common.noData")}</p>
              </div>
            )}
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  entry.isCurrentUser ? "border-primary/50 bg-primary/10" : getRankBackground(entry.rank)
                } ${entry.rank <= 3 ? "border" : "border-transparent"}`}
              >
                <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                <img
                  src={entry.avatar || "/placeholder.svg"}
                  alt={entry.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className={`font-medium ${entry.isCurrentUser ? "text-primary" : ""}`}>
                    {entry.name}
                    {entry.isCurrentUser && <span className="text-xs ml-2 text-muted-foreground">({t("common.you")})</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.completedLessons} {t("lessons.title")} • {entry.averageScore}% {t("student.averageScore")}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                  <Coins className="w-4 h-4" />
                  {entry.coins}
                </div>
                {entry.rank <= 3 && (
                  <TrendingUp
                    className={`w-4 h-4 ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : "text-amber-600"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </StudentLayout>
  )
}
