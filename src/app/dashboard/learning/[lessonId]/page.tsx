'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Trophy,
  CheckCircle,
  Loader2,
  BookOpen,
  FileQuestion
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [quizCount, setQuizCount] = useState(0)

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  const loadLesson = async () => {
    try {
      setLoading(true)

      // 사용자 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      // 프로필 조회
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData)

      // 레슨 조회
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select(`
          *,
          curriculum_days(day_number, title)
        `)
        .eq('id', lessonId)
        .single()

      if (lessonError) {
        console.error('Lesson error:', lessonError)
        return
      }

      setLesson(lessonData)

      // 진행률 조회
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single()

      setProgress(progressData)

      // 자동으로 'in_progress' 상태로 변경
      if (!progressData || progressData.status === 'not_started') {
        await updateProgress('in_progress')
      }

      // 퀴즈 개수 확인
      const { data: quizData, count } = await supabase
        .from('quizzes')
        .select('id', { count: 'exact' })
        .eq('lesson_id', lessonId)
        .eq('is_active', true)

      setQuizCount(count || 0)
    } catch (error) {
      console.error('Load lesson error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          status,
          time_spent_minutes: 1 // 최소 시간
        })
      })

      const data = await response.json()

      if (data.progress) {
        setProgress(data.progress)
      }

      if (data.points) {
        setProfile((prev: any) => ({ ...prev, points: data.points }))
      }
    } catch (error) {
      console.error('Update progress error:', error)
    }
  }

  const handleComplete = async () => {
    try {
      setCompleting(true)
      await updateProgress('completed')

      // 완료 알림
      alert(`🎉 레슨 완료! ${lesson.points_reward}점을 획득했습니다!`)

      // 학습 페이지로 이동
      router.push('/dashboard/learning')
    } catch (error) {
      console.error('Complete lesson error:', error)
      alert('레슨 완료 처리 중 오류가 발생했습니다.')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
        <Loader2 className="h-8 w-8 animate-spin text-wsop-red" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
        <div className="text-center">
          <p className="text-wsop-medium-gray mb-4">레슨을 찾을 수 없습니다.</p>
          <Link href="/dashboard/learning" className="btn-primary">
            학습 페이지로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const isCompleted = progress?.status === 'completed'

  return (
    <div className="min-h-screen bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
      {/* Header */}
      <header className="bg-white dark:bg-wsop-dark-gray shadow-sm border-b border-wsop-light-gray sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/learning"
                className="flex items-center gap-2 text-wsop-medium-gray hover:text-wsop-black dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                학습 페이지
              </Link>
              <div className="h-6 w-px bg-wsop-light-gray"></div>
              <div>
                <div className="text-xs text-wsop-medium-gray">
                  {lesson.curriculum_days?.title}
                </div>
                <h1 className="text-lg font-black text-wsop-black dark:text-white">
                  {lesson.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xl font-black text-wsop-red">{profile?.points || 0}</div>
                <div className="text-xs text-wsop-medium-gray">포인트</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8 max-w-4xl">
        {/* Lesson Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  isCompleted ? 'bg-green-500' : 'bg-wsop-red'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-wsop-black dark:text-white">
                    {lesson.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-wsop-medium-gray">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {lesson.duration_minutes}분
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      {lesson.points_reward}점
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isCompleted
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {isCompleted ? '완료' : '진행 중'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Lesson Content */}
        <Card>
          <CardContent className="p-8">
            {lesson.content ? (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-3xl font-black text-wsop-black dark:text-white mb-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-2xl font-black text-wsop-black dark:text-white mt-8 mb-4" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-xl font-bold text-wsop-black dark:text-white mt-6 mb-3" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-wsop-black dark:text-gray-300 mb-4 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside space-y-2 mb-4 text-wsop-black dark:text-gray-300" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside space-y-2 mb-4 text-wsop-black dark:text-gray-300" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="ml-4" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-black text-wsop-red" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-wsop-light-gray dark:bg-wsop-black px-2 py-1 rounded text-sm font-mono" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote className="border-l-4 border-wsop-red pl-4 italic text-wsop-medium-gray my-4" {...props} />
                    ),
                  }}
                >
                  {lesson.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-wsop-medium-gray mx-auto mb-4" />
                <p className="text-wsop-medium-gray">이 레슨에는 아직 콘텐츠가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Button */}
        {quizCount > 0 && (
          <div className="mt-6">
            <Link
              href={`/dashboard/learning/${lessonId}/quiz`}
              className="block w-full p-6 bg-gradient-to-r from-wsop-red to-red-700 hover:from-red-700 hover:to-wsop-red text-white rounded-lg shadow-lg transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <FileQuestion className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-1">퀴즈 풀기</h3>
                    <p className="text-white/90 text-sm">총 {quizCount}문제 | 학습 내용을 확인하세요</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6" />
              </div>
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/dashboard/learning"
            className="flex-1 px-6 py-3 border-2 border-wsop-light-gray rounded hover:bg-wsop-light-gray dark:hover:bg-wsop-black transition-colors font-semibold text-wsop-black dark:text-white text-center"
          >
            학습 페이지로 돌아가기
          </Link>

          {!isCompleted && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex-1 btn-primary font-black flex items-center justify-center gap-2"
            >
              {completing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  완료 처리 중...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  레슨 완료하기
                  <span className="text-sm">
                    (+{lesson.points_reward}점)
                  </span>
                </>
              )}
            </button>
          )}

          {isCompleted && (
            <Link
              href="/dashboard/learning"
              className="flex-1 btn-primary font-black flex items-center justify-center gap-2"
            >
              다음 레슨으로
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>

        {/* Completion Note */}
        {isCompleted && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span className="font-bold">
                이 레슨을 완료했습니다! {lesson.points_reward}점을 획득했습니다.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
