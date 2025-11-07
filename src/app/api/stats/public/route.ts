import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()

    // Get total trainee count
    const { count: totalTrainees } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'trainee')

    // Get completed trainees (100% progress)
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('user_id, status')
      .eq('status', 'completed')

    // Count completed lessons per user
    const completedByUser: Record<string, number> = {}
    progressData?.forEach((progress) => {
      completedByUser[progress.user_id] = (completedByUser[progress.user_id] || 0) + 1
    })

    // Get total lessons count
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })

    // Count users who completed all lessons
    const graduatedTrainees = Object.values(completedByUser).filter(
      (count) => count >= (totalLessons || 0)
    ).length

    // Use default value 0 if totalTrainees is null
    const safeTotal = totalTrainees || 0

    // Calculate deployment rate (users who completed all vs total)
    const deploymentRate = safeTotal > 0
      ? Math.round((graduatedTrainees / safeTotal) * 100)
      : 0

    // Get curriculum duration (max day number)
    const { data: maxDay } = await supabase
      .from('curriculum_days')
      .select('day_number')
      .order('day_number', { ascending: false })
      .limit(1)
      .single()

    const trainingDays = maxDay?.day_number || 7

    return NextResponse.json({
      deploymentRate,      // 투입률 (%)
      graduatedTrainees,   // 수료 인원
      trainingDays,        // 교육 기간 (일)
      totalTrainees: safeTotal,       // 전체 교육생
      activeTrainees: safeTotal - graduatedTrainees  // 학습 중
    })

  } catch (error: any) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      {
        deploymentRate: 0,
        graduatedTrainees: 0,
        trainingDays: 7,
        totalTrainees: 0,
        activeTrainees: 0
      },
      { status: 200 } // Return default values instead of error
    )
  }
}
