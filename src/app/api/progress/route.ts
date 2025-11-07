import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/progress - 학습 진행률 업데이트
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lesson_id, status, time_spent_minutes, notes } = body

    if (!lesson_id || !status) {
      return NextResponse.json(
        { error: 'lesson_id and status are required' },
        { status: 400 }
      )
    }

    // 기존 진행률 확인
    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson_id)
      .single()

    let result

    if (existingProgress) {
      // 업데이트
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'in_progress' && !existingProgress.started_at) {
        updateData.started_at = new Date().toISOString()
      }

      if (status === 'completed' && !existingProgress.completed_at) {
        updateData.completed_at = new Date().toISOString()
      }

      if (time_spent_minutes !== undefined) {
        updateData.time_spent_minutes = existingProgress.time_spent_minutes + time_spent_minutes
      }

      if (notes !== undefined) {
        updateData.notes = notes
      }

      const { data, error } = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data
    } else {
      // 신규 생성
      const insertData: any = {
        user_id: user.id,
        lesson_id,
        status,
        time_spent_minutes: time_spent_minutes || 0,
        notes: notes || null
      }

      if (status === 'in_progress') {
        insertData.started_at = new Date().toISOString()
      }

      if (status === 'completed') {
        insertData.started_at = new Date().toISOString()
        insertData.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_progress')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data
    }

    // 업데이트된 사용자 프로필 조회 (포인트 확인)
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      progress: result,
      points: profile?.points || 0
    })
  } catch (error: any) {
    console.error('Progress API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET /api/progress - 사용자 진행률 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 전체 진행률 조회
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select(`
        *,
        lessons(
          id,
          title,
          lesson_type,
          points_reward,
          day_id,
          curriculum_days(day_number, title)
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 })
    }

    // 통계 계산
    const stats = {
      total_lessons_started: progress.filter(p => p.status !== 'not_started').length,
      completed_lessons: progress.filter(p => p.status === 'completed').length,
      in_progress_lessons: progress.filter(p => p.status === 'in_progress').length,
      total_time_spent: progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0)
    }

    return NextResponse.json({
      progress,
      stats
    })
  } catch (error: any) {
    console.error('Progress GET API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
