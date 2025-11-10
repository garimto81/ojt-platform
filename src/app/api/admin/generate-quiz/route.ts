import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Validate GEMINI_API_KEY at initialization
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일을 확인해주세요.')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verify user is authenticated and is admin/trainer
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin or trainer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'trainer'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins and trainers can generate quizzes' },
        { status: 403 }
      )
    }

    const { lesson_id, question_count = 5, question_types = ['multiple_choice', 'true_false'] } = await request.json()

    if (!lesson_id) {
      return NextResponse.json(
        { error: 'Missing lesson_id' },
        { status: 400 }
      )
    }

    // Fetch lesson content
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        *,
        curriculum_days(day_number, title, description)
      `)
      .eq('id', lesson_id)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    if (!lesson.content) {
      return NextResponse.json(
        { error: 'Lesson has no content to generate quizzes from' },
        { status: 400 }
      )
    }

    // Generate quizzes using Gemini
    const prompt = `
You are an expert poker training instructor creating quiz questions for a professional poker training program.

**Lesson Context:**
- Day: ${(lesson as any).curriculum_days?.day_number} - ${(lesson as any).curriculum_days?.title}
- Lesson: ${lesson.title}
- Description: ${lesson.description || 'No description'}

**Lesson Content:**
${lesson.content}

**Task:**
Generate ${question_count} quiz questions to test understanding of this lesson content.

**Requirements:**
- Question types to include: ${question_types.join(', ')}
- Each question must directly relate to the lesson content
- Include clear, educational explanations for each answer
- For multiple_choice questions, provide 4 options (one correct, three plausible distractors)
- For true_false questions, make statements clear and unambiguous
- Assign appropriate points (10-20 points per question based on difficulty)

**Output Format (JSON):**
{
  "quizzes": [
    {
      "question": "Question text here",
      "question_type": "multiple_choice" | "true_false" | "short_answer",
      "options": [
        {"id": "a", "text": "Option A", "is_correct": false},
        {"id": "b", "text": "Option B", "is_correct": true},
        {"id": "c", "text": "Option C", "is_correct": false},
        {"id": "d", "text": "Option D", "is_correct": false}
      ],
      "correct_answer": "b",
      "explanation": "Detailed explanation of why this is correct",
      "points": 10
    }
  ]
}

**Important:**
- For true_false questions, use "true" or "false" as the correct_answer
- For short_answer questions, options should be null
- Explanations should be educational and reference the lesson content
- Return ONLY valid JSON, no additional text
- Do not include markdown code blocks, just raw JSON
`

    // Use Gemini Pro model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
        responseMimeType: 'application/json'
      }
    })

    const result = await model.generateContent(prompt)
    const response = result.response
    const responseText = response.text()

    if (!responseText) {
      throw new Error('Gemini returned empty response')
    }

    // Clean response (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '')
    }

    const generatedQuizzes = JSON.parse(cleanedResponse)

    // Validate generated quizzes
    if (!generatedQuizzes.quizzes || !Array.isArray(generatedQuizzes.quizzes)) {
      throw new Error('Invalid quiz format from Gemini')
    }

    // Format quizzes for database insertion
    const quizzesToInsert = generatedQuizzes.quizzes.map((quiz: any, index: number) => ({
      lesson_id,
      question: quiz.question,
      question_type: quiz.question_type,
      options: quiz.options ? JSON.stringify(quiz.options) : null,
      correct_answer: quiz.correct_answer,
      explanation: quiz.explanation,
      points: quiz.points || 10,
      order_index: index + 1,
      is_active: false // Start as inactive so admin can review
    }))

    // Insert into database
    const { data: insertedQuizzes, error: insertError } = await supabase
      .from('quizzes')
      .insert(quizzesToInsert)
      .select()

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      quizzes: insertedQuizzes,
      count: insertedQuizzes?.length || 0,
      message: `Successfully generated ${insertedQuizzes?.length || 0} quiz questions. Please review and activate them.`
    })

  } catch (error: any) {
    console.error('Generate quiz error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate quizzes' },
      { status: 500 }
    )
  }
}
