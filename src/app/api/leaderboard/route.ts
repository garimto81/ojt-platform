import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// GET /api/leaderboard - 리더보드 조회
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 상위 10명 조회 (포인트 기준)
    const { data: topUsers, error: topError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, points, role')
      .eq('role', 'trainee')
      .order('points', { ascending: false })
      .limit(10)

    if (topError) {
      return NextResponse.json({ error: topError.message }, { status: 500 })
    }

    // 각 사용자의 완료한 레슨 수 조회
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

    // 현재 사용자 순위 조회 (TOP 10 밖인 경우)
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

    // 전체 사용자 수
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'trainee')

    return NextResponse.json({
      leaderboard,
      current_user_rank: currentUserInTop10?.rank || currentUserRank,
      total_users: totalUsers || 0
    })
  } catch (error: any) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
