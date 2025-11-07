import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// GET /api/curriculum - 전체 커리큘럼 조회 (Day별 레슨 포함)
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 커리큘럼 조회 (Day별)
    const { data: days, error: daysError } = await supabase
      .from('curriculum_days')
      .select('*')
      .eq('is_active', true)
      .order('day_number', { ascending: true })

    if (daysError) {
      return NextResponse.json({ error: daysError.message }, { status: 500 })
    }

    // 각 Day별 레슨 조회
    const daysWithLessons = await Promise.all(
      days.map(async (day) => {
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select(`
            *,
            user_progress!left(
              id,
              status,
              started_at,
              completed_at,
              time_spent_minutes
            )
          `)
          .eq('day_id', day.id)
          .eq('user_progress.user_id', user.id)
          .order('order_index', { ascending: true })

        if (lessonsError) {
          console.error('Lessons query error:', lessonsError)
          return { ...day, lessons: [] }
        }

        return {
          ...day,
          lessons: lessons || []
        }
      })
    )

    // 전체 진행률 계산
    const totalLessons = daysWithLessons.reduce((sum, day) => sum + day.lessons.length, 0)
    const completedLessons = daysWithLessons.reduce(
      (sum, day) =>
        sum + day.lessons.filter((l: any) =>
          l.user_progress && l.user_progress[0]?.status === 'completed'
        ).length,
      0
    )

    return NextResponse.json({
      days: daysWithLessons,
      stats: {
        total_days: days.length,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      }
    })
  } catch (error: any) {
    console.error('Curriculum API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
