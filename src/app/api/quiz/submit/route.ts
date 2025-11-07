import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

    const { quiz_id, user_answer } = await request.json()

    if (!quiz_id || user_answer === undefined || user_answer === null) {
      return NextResponse.json(
        { error: 'Missing quiz_id or user_answer' },
        { status: 400 }
      )
    }

    // Fetch the quiz to check correct answer
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quiz_id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Check if answer is correct
    const isCorrect = user_answer.toString().toLowerCase() === quiz.correct_answer.toLowerCase()
    const pointsEarned = isCorrect ? quiz.points : 0

    // Insert quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_id,
        user_answer,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        attempted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (attemptError) {
      return NextResponse.json(
        { error: attemptError.message },
        { status: 500 }
      )
    }

    // If correct, add points to user profile
    if (isCorrect) {
      const { error: pointsError } = await supabase.rpc('increment_user_points', {
        user_id_param: user.id,
        points_param: pointsEarned
      })

      if (pointsError) {
        console.error('Failed to increment points:', pointsError)
      }
    }

    return NextResponse.json({
      attempt,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      correct_answer: quiz.correct_answer,
      explanation: quiz.explanation
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit quiz answer' },
      { status: 500 }
    )
  }
}
