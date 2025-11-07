import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  Trophy,
  Clock,
  CheckCircle,
  Circle,
  Lock,
  Play,
  FileText,
  Video,
  HelpCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

export default async function LearningPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // 사용자 프로필 조회
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 전체 커리큘럼 조회 (Day별)
  const { data: days } = await supabase
    .from('curriculum_days')
    .select('*')
    .eq('is_active', true)
    .order('day_number')

  // 각 Day별 레슨 및 진행률 조회
  const daysWithLessons = await Promise.all(
    (days || []).map(async (day) => {
      const { data: lessons } = await supabase
        .from('lessons')
        .select(`
          *,
          user_progress!left(
            id,
            status,
            completed_at,
            time_spent_minutes
          )
        `)
        .eq('day_id', day.id)
        .eq('user_progress.user_id', user.id)
        .order('order_index')

      return {
        ...day,
        lessons: lessons || []
      }
    })
  )

  // 전체 통계 계산
  const totalLessons = daysWithLessons.reduce((sum, day) => sum + day.lessons.length, 0)
  const completedLessons = daysWithLessons.reduce(
    (sum, day) =>
      sum + day.lessons.filter((l: any) =>
        l.user_progress && l.user_progress[0]?.status === 'completed'
      ).length,
    0
  )
  const progressPercentage = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  // 현재 진행 중인 Day 찾기
  const completedDaysCount = daysWithLessons.filter(day =>
    day.lessons.every((l: any) =>
      l.user_progress && l.user_progress[0]?.status === 'completed'
    )
  ).length

  const currentDayNumber = Math.min(completedDaysCount + 1, 7)

  return (
    <div className="min-h-screen bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
      {/* Header */}
      <header className="bg-white dark:bg-wsop-dark-gray shadow-sm border-b border-wsop-light-gray">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-wsop-medium-gray hover:text-wsop-black dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                대시보드
              </Link>
              <div className="h-6 w-px bg-wsop-light-gray"></div>
              <div>
                <h1 className="text-2xl font-black text-wsop-black dark:text-white">7일 학습 프로그램</h1>
                <p className="text-sm text-wsop-medium-gray">포커 프로덕션 전문가 과정</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-black text-wsop-red">{profile?.points || 0}</div>
                <div className="text-xs text-wsop-medium-gray">포인트</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-wsop-black dark:text-white">
                전체 진행률: {completedLessons} / {totalLessons} 레슨
              </span>
              <span className="font-black text-wsop-red">{progressPercentage}%</span>
            </div>
            <div className="h-3 bg-wsop-light-gray dark:bg-wsop-black rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-wsop-red to-red-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="space-y-6">
          {daysWithLessons.map((day, dayIndex) => {
            const dayCompleted = day.lessons.every((l: any) =>
              l.user_progress && l.user_progress[0]?.status === 'completed'
            )
            const dayInProgress = day.lessons.some((l: any) =>
              l.user_progress && l.user_progress[0]?.status === 'in_progress'
            )
            const isLocked = day.day_number > currentDayNumber

            const dayCompletedCount = day.lessons.filter((l: any) =>
              l.user_progress && l.user_progress[0]?.status === 'completed'
            ).length

            return (
              <Card
                key={day.id}
                className={`${
                  isLocked
                    ? 'opacity-60'
                    : dayInProgress
                    ? 'border-2 border-wsop-red'
                    : dayCompleted
                    ? 'border-2 border-green-500'
                    : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Day Icon */}
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl ${
                          isLocked
                            ? 'bg-wsop-light-gray text-wsop-medium-gray'
                            : dayCompleted
                            ? 'bg-green-500 text-white'
                            : dayInProgress
                            ? 'bg-wsop-red text-white'
                            : 'bg-wsop-black text-white'
                        }`}
                      >
                        {isLocked ? (
                          <Lock className="h-8 w-8" />
                        ) : dayCompleted ? (
                          <CheckCircle className="h-8 w-8" />
                        ) : (
                          day.day_number
                        )}
                      </div>

                      {/* Day Info */}
                      <div>
                        <CardTitle className="text-xl font-black text-wsop-black dark:text-white">
                          {day.title}
                        </CardTitle>
                        <CardDescription className="text-wsop-medium-gray">
                          {day.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-wsop-medium-gray flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {day.duration_hours}시간
                          </span>
                          <span className="text-xs text-wsop-medium-gray flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {day.lessons.length}개 레슨
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              dayCompleted
                                ? 'text-green-500'
                                : dayInProgress
                                ? 'text-wsop-red'
                                : 'text-wsop-medium-gray'
                            }`}
                          >
                            {dayCompletedCount} / {day.lessons.length} 완료
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Day Status */}
                    {isLocked ? (
                      <div className="px-4 py-2 bg-wsop-light-gray rounded-full text-sm font-bold text-wsop-medium-gray">
                        잠김
                      </div>
                    ) : dayCompleted ? (
                      <div className="px-4 py-2 bg-green-500 rounded-full text-sm font-bold text-white">
                        완료
                      </div>
                    ) : dayInProgress ? (
                      <div className="px-4 py-2 bg-wsop-red rounded-full text-sm font-bold text-white">
                        진행 중
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-wsop-black rounded-full text-sm font-bold text-white">
                        시작 전
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Objectives */}
                  {day.objectives && day.objectives.length > 0 && (
                    <div className="mb-4 p-4 bg-wsop-light-gray dark:bg-wsop-black rounded-lg">
                      <h4 className="font-bold text-sm text-wsop-black dark:text-white mb-2">
                        학습 목표:
                      </h4>
                      <ul className="space-y-1">
                        {day.objectives.map((objective: string, idx: number) => (
                          <li key={idx} className="text-sm text-wsop-medium-gray flex items-start gap-2">
                            <span className="text-wsop-red mt-1">•</span>
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lessons List */}
                  <div className="space-y-2">
                    {day.lessons.map((lesson: any) => {
                      const progress = lesson.user_progress?.[0]
                      const status = progress?.status || 'not_started'
                      const lessonLocked = isLocked

                      return (
                        <Link
                          key={lesson.id}
                          href={lessonLocked ? '#' : `/dashboard/learning/${lesson.id}`}
                          className={`block p-4 rounded-lg border transition-colors ${
                            lessonLocked
                              ? 'border-wsop-light-gray bg-gray-50 dark:bg-gray-900 cursor-not-allowed'
                              : status === 'completed'
                              ? 'border-green-200 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                              : status === 'in_progress'
                              ? 'border-wsop-red bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                              : 'border-wsop-light-gray bg-white dark:bg-wsop-dark-gray hover:bg-wsop-light-gray dark:hover:bg-wsop-black'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Lesson Icon */}
                              {lessonLocked ? (
                                <Lock className="h-5 w-5 text-wsop-medium-gray" />
                              ) : status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : status === 'in_progress' ? (
                                <Play className="h-5 w-5 text-wsop-red" />
                              ) : (
                                <Circle className="h-5 w-5 text-wsop-medium-gray" />
                              )}

                              {/* Lesson Type Icon */}
                              <div className="text-wsop-medium-gray">
                                {lesson.lesson_type === 'video' && <Video className="h-4 w-4" />}
                                {lesson.lesson_type === 'theory' && <FileText className="h-4 w-4" />}
                                {lesson.lesson_type === 'quiz' && <HelpCircle className="h-4 w-4" />}
                                {lesson.lesson_type === 'practical' && <Play className="h-4 w-4" />}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1">
                                <div className="font-bold text-wsop-black dark:text-white">
                                  {lesson.title}
                                </div>
                                <div className="text-xs text-wsop-medium-gray flex items-center gap-2">
                                  <span>{lesson.duration_minutes}분</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Trophy className="h-3 w-3" />
                                    {lesson.points_reward}점
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Lesson Status */}
                            {!lessonLocked && (
                              <ArrowRight className="h-5 w-5 text-wsop-medium-gray" />
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
