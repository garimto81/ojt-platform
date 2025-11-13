import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Trophy, Medal, Crown, TrendingUp, Award, Home } from 'lucide-react'

/**
 * Leaderboard Page - TOP 10 Rankings
 *
 * Features:
 * - Real-time leaderboard data from API
 * - Trophy icons for top 3 (Gold, Silver, Bronze)
 * - Current user highlight
 * - Points display with formatting
 * - Responsive design (mobile-first)
 * - Dark mode support
 * - Fade-in animations
 * - Accessible (ARIA labels, semantic HTML)
 *
 * Performance:
 * - Server-side data fetching
 * - Optimized queries with Supabase
 *
 * Usage:
 * /dashboard/leaderboard route
 */

interface LeaderboardEntry {
  rank: number
  user_id: string
  full_name: string
  avatar_url: string | null
  points: number
  completed_lessons: number
  is_current_user: boolean
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  current_user_rank: number | null
  total_users: number
}

export default async function LeaderboardPage() {
  const supabase = createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // Fetch leaderboard data directly from Supabase (more efficient than API call)
  let leaderboardData: LeaderboardData | null = null
  let error: string | null = null

  try {
    // Get top 10 users
    const { data: topUsers, error: topError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, points, role')
      .eq('role', 'trainee')
      .order('points', { ascending: false })
      .limit(10)

    if (topError) throw topError

    // Get completed lessons count for each user
    const leaderboard = await Promise.all(
      topUsers.map(async (profile, index) => {
        const { count } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('status', 'completed')

        return {
          rank: index + 1,
          user_id: profile.id,
          full_name: profile.full_name || 'Unknown User',
          avatar_url: profile.avatar_url,
          points: profile.points,
          completed_lessons: count || 0,
          is_current_user: profile.id === user.id
        }
      })
    )

    // Get current user rank if not in top 10
    const currentUserInTop10 = leaderboard.find(entry => entry.is_current_user)
    let currentUserRank = null

    if (!currentUserInTop10) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()

      if (currentProfile) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'trainee')
          .gt('points', currentProfile.points)

        currentUserRank = (count || 0) + 1
      }
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'trainee')

    leaderboardData = {
      leaderboard,
      current_user_rank: currentUserInTop10?.rank || currentUserRank,
      total_users: totalUsers || 0
    }
  } catch (err: any) {
    error = err.message
    console.error('Leaderboard fetch error:', err)
  }

  // Get trophy icon based on rank
  const getTrophyIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" aria-label="1위 금메달" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" aria-label="2위 은메달" />
      case 3:
        return <Medal className="h-6 w-6 text-yellow-700" aria-label="3위 동메달" />
      default:
        return null
    }
  }

  // Get rank badge color
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-br from-yellow-600 to-yellow-800 text-white'
      default:
        return 'bg-wsop-medium-gray text-white'
    }
  }

  return (
    <div className="container py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-wsop-black dark:text-white mb-2 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-wsop-red" aria-hidden="true" />
          Leaderboard
        </h1>
        <p className="text-wsop-medium-gray dark:text-gray-400">
          교육생 순위 및 포인트 현황
        </p>
      </div>

      {/* Stats Cards */}
      {leaderboardData && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Current User Rank */}
          <Card className="animate-in slide-in-from-bottom-4 duration-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-wsop-medium-gray">내 순위</span>
                <Award className="h-5 w-5 text-wsop-red" aria-hidden="true" />
              </div>
              <div className="text-3xl font-black text-wsop-black dark:text-white mb-1">
                #{leaderboardData.current_user_rank || '-'}
              </div>
              <p className="text-xs text-wsop-medium-gray">
                전체 {leaderboardData.total_users}명 중
              </p>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-wsop-medium-gray">전체 교육생</span>
                <Crown className="h-5 w-5 text-wsop-red" aria-hidden="true" />
              </div>
              <div className="text-3xl font-black text-wsop-black dark:text-white mb-1">
                {leaderboardData.total_users}
              </div>
              <p className="text-xs text-wsop-medium-gray">명</p>
            </CardContent>
          </Card>

          {/* Top Score */}
          <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-wsop-medium-gray">최고 점수</span>
                <TrendingUp className="h-5 w-5 text-wsop-red" aria-hidden="true" />
              </div>
              <div className="text-3xl font-black text-wsop-black dark:text-white mb-1">
                {leaderboardData.leaderboard[0]?.points.toLocaleString() || 0}
              </div>
              <p className="text-xs text-wsop-medium-gray">포인트</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="mb-8 border-2 border-red-500/20">
          <CardContent className="p-8 text-center">
            <p className="text-red-500 dark:text-red-400 mb-4">
              리더보드 데이터를 불러오는 중 오류가 발생했습니다.
            </p>
            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
              <Home className="h-5 w-5" />
              대시보드로 돌아가기
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      {leaderboardData && leaderboardData.leaderboard.length > 0 && (
        <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader>
            <CardTitle className="text-xl font-black text-wsop-black dark:text-white">
              TOP 10 랭킹
            </CardTitle>
            <CardDescription className="text-wsop-medium-gray dark:text-gray-400">
              포인트 기준 상위 10명
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboardData.leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    entry.is_current_user
                      ? 'bg-wsop-red/10 dark:bg-wsop-red/20 border-2 border-wsop-red shadow-md'
                      : entry.rank <= 3
                      ? 'bg-wsop-light-gray dark:bg-wsop-black border border-wsop-medium-gray/20'
                      : 'bg-white dark:bg-wsop-dark-gray border border-wsop-light-gray dark:border-wsop-medium-gray/10'
                  } ${
                    entry.is_current_user ? 'animate-pulse' : ''
                  }`}
                  aria-label={`${entry.rank}위: ${entry.full_name}, ${entry.points.toLocaleString()} 포인트`}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-sm ${getRankBadgeColor(
                        entry.rank
                      )}`}
                    >
                      {entry.rank <= 3 ? (
                        getTrophyIcon(entry.rank)
                      ) : (
                        <span>#{entry.rank}</span>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`font-bold text-base truncate ${
                          entry.is_current_user
                            ? 'text-wsop-red dark:text-wsop-red'
                            : 'text-wsop-black dark:text-white'
                        }`}
                      >
                        {entry.full_name}
                        {entry.is_current_user && (
                          <span className="ml-2 text-xs font-normal text-wsop-red">
                            (나)
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-wsop-medium-gray dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" aria-hidden="true" />
                        {entry.points.toLocaleString()} 포인트
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1">
                        <Award className="h-4 w-4" aria-hidden="true" />
                        {entry.completed_lessons}개 완료
                      </span>
                    </div>
                  </div>

                  {/* Trophy Icon for Top 3 */}
                  {entry.rank <= 3 && (
                    <div className="flex-shrink-0 hidden md:block">
                      {getTrophyIcon(entry.rank)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {leaderboardData && leaderboardData.leaderboard.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-wsop-medium-gray mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-bold text-wsop-black dark:text-white mb-2">
              아직 랭킹이 없습니다
            </h3>
            <p className="text-wsop-medium-gray dark:text-gray-400 mb-6">
              첫 번째 레슨을 완료하고 리더보드에 올라보세요!
            </p>
            <Link href="/dashboard/learning" className="btn-primary inline-flex items-center gap-2">
              학습 시작하기
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
