import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, BookOpen } from 'lucide-react'

/**
 * 🎯 Progressive Minimal Dashboard
 *
 * 목적: 신규 직원이 고민 없이 즉시 학습을 시작할 수 있도록
 * 핵심 원칙:
 * - One Thing at a Time: 하나의 큰 버튼만
 * - Zero Thinking: 선택지 최소화
 * - Instant Clarity: 3초 안에 파악
 */
export default async function SimpleDashboard() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // 전체 진행률 계산
  const progress = await getProgress(supabase, user.id)

  // 다음 레슨 찾기
  const nextLesson = await getNextLesson(supabase, user.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 로고 & 타이틀 */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg">
              G
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            GG Production 교육 과정
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            7일 포커 프로덕션 전문가 과정
          </p>
        </div>

        {/* 진행률 섹션 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                전체 진행률
              </span>
              <span className="text-2xl font-black text-red-600">
                {progress.percentage}%
              </span>
            </div>

            {/* 진행률 바 */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
              {progress.completed} / {progress.total} 레슨 완료
            </p>
          </div>

          {/* 메인 액션 버튼 */}
          {nextLesson ? (
            <>
              <Link
                href={`/dashboard/learning/${nextLesson.id}`}
                className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-5 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-3 group"
              >
                {progress.completed === 0 ? '첫 레슨 시작하기' : '다음 레슨 계속하기'}
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* 다음 레슨 정보 */}
              <div className="mt-6 text-center space-y-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Day {nextLesson.dayNumber}: {nextLesson.dayTitle}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {nextLesson.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  레슨 {nextLesson.lessonIndex} / {nextLesson.totalLessonsInDay} • 예상 {nextLesson.duration}분
                </p>
              </div>
            </>
          ) : (
            // 모든 레슨 완료
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎉 모든 레슨 완료!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                7일 과정을 모두 마쳤습니다. 축하합니다!
              </p>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
              >
                내 프로필 보기
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>

        {/* 전체 커리큘럼 보기 링크 */}
        <div className="text-center space-y-3">
          <Link
            href="/dashboard/learning"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            전체 커리큘럼 보기
          </Link>

          {/* 고급 모드 전환 (숨김) */}
          <div>
            <Link
              href="/dashboard/full"
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              고급 대시보드 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 전체 진행률 계산
 */
async function getProgress(supabase: any, userId: string) {
  // 전체 레슨 수
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })

  // 완료한 레슨 수
  const { count: completedLessons } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')

  const total = totalLessons || 0
  const completed = completedLessons || 0
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    percentage
  }
}

/**
 * 다음 레슨 찾기
 *
 * 로직:
 * 1. 모든 레슨을 Day 순서, 레슨 순서대로 정렬
 * 2. 사용자 진행률과 조인
 * 3. 완료되지 않은 첫 번째 레슨 반환
 */
async function getNextLesson(supabase: any, userId: string) {
  // 모든 레슨 조회 (Day 순서대로)
  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      duration_minutes,
      order_index,
      day_id,
      curriculum_days (
        day_number,
        title
      ),
      user_progress!left (
        status
      )
    `)
    .eq('user_progress.user_id', userId)
    .order('curriculum_days(day_number)', { ascending: true })
    .order('order_index', { ascending: true })

  if (!lessons || lessons.length === 0) {
    return null
  }

  // 완료되지 않은 첫 번째 레슨 찾기
  const nextLesson = lessons.find((lesson: any) => {
    const progress = lesson.user_progress?.[0]
    return !progress || progress.status !== 'completed'
  })

  if (!nextLesson) {
    return null // 모든 레슨 완료
  }

  // Day의 전체 레슨 수 계산
  const lessonsInSameDay = lessons.filter((l: any) =>
    l.day_id === nextLesson.day_id
  )

  return {
    id: nextLesson.id,
    title: nextLesson.title,
    duration: nextLesson.duration_minutes,
    dayNumber: nextLesson.curriculum_days.day_number,
    dayTitle: nextLesson.curriculum_days.title,
    lessonIndex: nextLesson.order_index + 1,
    totalLessonsInDay: lessonsInSameDay.length
  }
}
