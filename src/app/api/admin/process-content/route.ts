import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * AI 콘텐츠 정리 API
 * "개떡같이" 입력된 비정형 텍스트를 "찰떡같이" 구조화된 마크다운으로 변환
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: 인증 재활성화 시 주석 해제
    // const supabase = createClient()
    // const { data: { user }, error: authError } = await supabase.auth.getUser()
    // if (authError || !user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // GEMINI_API_KEY 검증
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const { raw_content, lesson_id } = await request.json()

    if (!raw_content) {
      return NextResponse.json(
        { error: 'raw_content가 필요합니다.' },
        { status: 400 }
      )
    }

    // Gemini AI 초기화 (1.5 Flash - 빠르고 효율적)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // 콘텐츠 정리 프롬프트
    const prompt = `
당신은 전문 교육 콘텐츠 편집자입니다. 트레이너가 작성한 비정형 텍스트를 체계적이고 명확한 학습 콘텐츠로 변환하세요.

**원본 텍스트:**
${raw_content}

**요구사항:**
1. **구조화**: 논리적인 흐름으로 재구성 (제목, 부제목, 본문)
2. **학습 목표 추출**: 이 콘텐츠를 통해 학습자가 얻을 수 있는 명확한 목표 (3-5개)
3. **핵심 개념 식별**: 가장 중요한 개념/용어 추출 (5-10개)
4. **난이도 분류**: easy (초급), medium (중급), hard (고급) 중 하나
5. **예상 학습 시간**: 이 콘텐츠를 이해하는데 필요한 시간 (분 단위)
6. **마크다운 포맷**: 읽기 쉬운 마크다운 형식

**JSON 출력 형식:**
{
  "content": "구조화된 마크다운 콘텐츠 (제목, 소제목, 본문 포함)",
  "learning_objectives": ["목표1", "목표2", "목표3"],
  "key_concepts": ["개념1", "개념2", "개념3", "개념4", "개념5"],
  "difficulty_level": "easy|medium|hard",
  "estimated_duration_minutes": 30,
  "summary": "전체 내용 요약 (2-3 문장)"
}

**마크다운 포맷 가이드:**
- # 제목 (H1: 큰 주제)
- ## 소제목 (H2: 섹션)
- ### 세부 항목 (H3: 하위 항목)
- **굵게**: 강조
- \`코드\`: 용어/기술 용어
- - 리스트: 항목 나열
- 1. 번호 리스트: 순서 있는 항목

**톤 & 스타일:**
- 명확하고 간결한 문장
- 전문적이면서도 이해하기 쉬운 설명
- 예시와 함께 설명
- 학습자 중심 관점

JSON만 출력하세요 (다른 텍스트 없이).
`

    console.log('🤖 AI 콘텐츠 정리 시작...')
    console.log('  원본 길이:', raw_content.length, '자')

    // AI 호출
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    console.log('  AI 응답 길이:', responseText.length, '자')

    // JSON 파싱 (마크다운 코드 블록 제거)
    let cleanedResponse = responseText.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }

    const parsed = JSON.parse(cleanedResponse)

    console.log('✅ AI 정리 완료')
    console.log('  학습 목표:', parsed.learning_objectives?.length || 0, '개')
    console.log('  핵심 개념:', parsed.key_concepts?.length || 0, '개')
    console.log('  난이도:', parsed.difficulty_level)
    console.log('  예상 시간:', parsed.estimated_duration_minutes, '분')

    // lesson_id가 있으면 DB 업데이트
    if (lesson_id) {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          raw_content: raw_content,
          content: parsed.content,
          learning_objectives: parsed.learning_objectives,
          key_concepts: parsed.key_concepts,
          difficulty_level: parsed.difficulty_level,
          duration_minutes: parsed.estimated_duration_minutes,
          ai_processed: true,
          ai_processed_at: new Date().toISOString(),
        })
        .eq('id', lesson_id)

      if (updateError) {
        console.error('❌ DB 업데이트 실패:', updateError)
        return NextResponse.json(
          { error: '데이터베이스 업데이트 실패', details: updateError.message },
          { status: 500 }
        )
      }

      console.log('💾 DB 업데이트 완료 (lesson_id:', lesson_id, ')')
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        content: parsed.content,
        learning_objectives: parsed.learning_objectives,
        key_concepts: parsed.key_concepts,
        difficulty_level: parsed.difficulty_level,
        estimated_duration_minutes: parsed.estimated_duration_minutes,
        summary: parsed.summary,
      },
      metadata: {
        original_length: raw_content.length,
        processed_length: parsed.content.length,
        processing_time: Date.now(),
      },
    })

  } catch (error: any) {
    console.error('❌ AI 콘텐츠 정리 실패:', error)

    return NextResponse.json(
      {
        error: 'AI 콘텐츠 정리 중 오류 발생',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

/**
 * GET: 레슨의 AI 처리 상태 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lesson_id = searchParams.get('lesson_id')

    if (!lesson_id) {
      return NextResponse.json(
        { error: 'lesson_id가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('id, title, ai_processed, ai_processed_at, difficulty_level, learning_objectives, key_concepts')
      .eq('id', lesson_id)
      .single()

    if (error || !lesson) {
      return NextResponse.json(
        { error: '레슨을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: lesson,
    })

  } catch (error: any) {
    console.error('❌ AI 상태 조회 실패:', error)
    return NextResponse.json(
      { error: 'AI 상태 조회 실패', details: error.message },
      { status: 500 }
    )
  }
}
