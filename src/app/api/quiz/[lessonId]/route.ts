import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const supabase = createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { lessonId } = params

    // Fetch all quizzes for this lesson
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (quizError) {
      return NextResponse.json(
        { error: quizError.message },
        { status: 500 }
      )
    }

    // Fetch user's previous attempts for these quizzes
    const quizIds = (quizzes || []).map(q => q.id)
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('*')
      .in('quiz_id', quizIds)
      .eq('user_id', user.id)
      .order('attempted_at', { ascending: false })

    // Map attempts to quizzes (most recent attempt per quiz)
    const attemptsByQuiz = (attempts || []).reduce((acc: any, attempt: any) => {
      if (!acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = attempt
      }
      return acc
    }, {})

    // Combine quizzes with attempt data
    const quizzesWithAttempts = (quizzes || []).map(quiz => ({
      ...quiz,
      userAttempt: attemptsByQuiz[quiz.id] || null
    }))

    return NextResponse.json({
      quizzes: quizzesWithAttempts,
      totalQuestions: quizzes?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
