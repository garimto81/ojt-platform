import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Trophy, Users, Clock, Target, ArrowRight } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
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

  // 전체 커리큘럼 조회
  const { data: days } = await supabase
    .from('curriculum_days')
    .select('id, day_number, title')
    .eq('is_active', true)
    .order('day_number')

  // 사용자 진행률 조회
  const { data: progress } = await supabase
    .from('user_progress')
    .select(`
      *,
      lessons(day_id, day_number:curriculum_days(day_number))
    `)
    .eq('user_id', user.id)

  // 통계 계산
  const completedLessons = progress?.filter(p => p.status === 'completed') || []
  const totalLessons = 20 // 초기 데이터 기준

  const completedDays = new Set(
    completedLessons
      .map(p => p.lessons?.day_number)
      .filter(Boolean)
  ).size

  const progressPercentage = totalLessons > 0
    ? Math.round((completedLessons.length / totalLessons) * 100)
    : 0

  // 리더보드 순위 조회
  const { count: higherRanks } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'trainee')
    .gt('points', profile?.points || 0)

  const rank = (higherRanks || 0) + 1

  // 현재 진행 중인 Day 찾기
  const currentDayNumber = completedDays + 1
  const currentDay = days?.find(d => d.day_number === currentDayNumber)

  // 현재 Day의 레슨 조회
  let currentLessons: any[] = []
  if (currentDay) {
    const { data } = await supabase
      .from('lessons')
      .select(`
        *,
        user_progress!left(status)
      `)
      .eq('day_id', currentDay.id)
      .eq('user_progress.user_id', user.id)
      .order('order_index')
      .limit(4)

    currentLessons = data || []
  }

  // 상위 5명 리더보드
  const { data: topUsers } = await supabase
    .from('profiles')
    .select('full_name, points, avatar_url')
    .eq('role', 'trainee')
    .order('points', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
      {/* Header */}
      <header className="bg-white dark:bg-wsop-dark-gray shadow-sm border-b border-wsop-light-gray">
        <div className="container py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-wsop-black dark:text-white">
                환영합니다, {profile?.full_name || user.email?.split('@')[0]}님!
              </h1>
              <p className="text-wsop-medium-gray dark:text-gray-400">학습 여정을 계속하세요</p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard/learning" className="btn-primary font-black">
                학습 시작하기
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="container py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<Clock className="h-5 w-5 text-wsop-red" />}
            title="완료한 일수"
            value={`${completedDays} / 7`}
            trend={completedDays > 0 ? `Day ${currentDayNumber} 진행 중` : '시작하기'}
          />
          <StatsCard
            icon={<Target className="h-5 w-5 text-wsop-red" />}
            title="진행률"
            value={`${progressPercentage}%`}
            trend={`${completedLessons.length} / ${totalLessons} 레슨`}
          />
          <StatsCard
            icon={<Trophy className="h-5 w-5 text-wsop-red" />}
            title="획득 포인트"
            value={profile?.points?.toLocaleString() || '0'}
            trend={completedLessons.length > 0 ? '계속 진행하세요!' : '레슨을 완료하세요'}
          />
          <StatsCard
            icon={<Users className="h-5 w-5 text-wsop-red" />}
            title="순위"
            value={`#${rank}`}
            trend="전체 교육생 중"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Module */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-black text-wsop-black dark:text-white">
                  {currentDay ? `${currentDay.title}` : '학습을 시작하세요'}
                </CardTitle>
                <CardDescription className="text-wsop-medium-gray">
                  {currentDay ? `Day ${currentDay.day_number} 레슨` : '첫 번째 Day부터 시작합니다'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentLessons.length > 0 ? (
                    <>
                      <div className="bg-wsop-light-gray dark:bg-wsop-black rounded-lg p-4">
                        <h3 className="font-black mb-3 text-wsop-black dark:text-white">레슨 목록</h3>
                        <ul className="space-y-2">
                          {currentLessons.map((lesson: any, index: number) => {
                            const userProgress = lesson.user_progress?.[0]
                            const status = userProgress?.status || 'not_started'

                            return (
                              <li key={lesson.id} className="flex items-center gap-2">
                                {status === 'completed' ? (
                                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                                    ✓
                                  </div>
                                ) : status === 'in_progress' ? (
                                  <div className="w-6 h-6 rounded-full bg-wsop-red text-white flex items-center justify-center text-xs font-bold">
                                    •
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full border-2 border-wsop-medium-gray"></div>
                                )}
                                <span className={status === 'in_progress' ? 'font-black text-wsop-black dark:text-white' :
                                  status === 'completed' ? 'text-wsop-medium-gray' :
                                  'text-wsop-medium-gray'}>
                                  {lesson.title}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <Link href="/dashboard/learning" className="btn-primary w-full font-black flex items-center justify-center">
                        학습 계속하기 <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-wsop-medium-gray mx-auto mb-4" />
                      <p className="text-wsop-medium-gray mb-4">아직 시작하지 않았습니다</p>
                      <Link href="/dashboard/learning" className="btn-primary font-black">
                        첫 레슨 시작하기
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-black text-wsop-black dark:text-white">리더보드 TOP 5</CardTitle>
                <CardDescription className="text-wsop-medium-gray">포인트 순위</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topUsers?.map((topUser, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded ${
                        index < 3 ? 'bg-wsop-light-gray dark:bg-wsop-black' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        index === 0 ? 'bg-wsop-red text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-yellow-600 text-white' :
                        'bg-wsop-medium-gray text-white'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-wsop-black dark:text-white text-sm">
                          {topUser.full_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-wsop-medium-gray">
                          {topUser.points.toLocaleString()} 포인트
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-black text-wsop-black dark:text-white">바로가기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/dashboard/learning"
                  className="block p-3 rounded border border-wsop-light-gray hover:bg-wsop-light-gray dark:hover:bg-wsop-black transition-colors"
                >
                  <div className="font-bold text-wsop-black dark:text-white">학습 페이지</div>
                  <div className="text-xs text-wsop-medium-gray">커리큘럼 전체 보기</div>
                </Link>
                <Link
                  href="/dashboard/content"
                  className="block p-3 rounded border border-wsop-light-gray hover:bg-wsop-light-gray dark:hover:bg-wsop-black transition-colors"
                >
                  <div className="font-bold text-wsop-black dark:text-white">콘텐츠 관리</div>
                  <div className="text-xs text-wsop-medium-gray">학습 자료 확인</div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({
  icon,
  title,
  value,
  trend,
}: {
  icon: React.ReactNode
  title: string
  value: string
  trend: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-wsop-medium-gray">{title}</span>
          {icon}
        </div>
        <div className="text-3xl font-black text-wsop-black dark:text-white mb-1">{value}</div>
        <p className="text-xs text-wsop-medium-gray">{trend}</p>
      </CardContent>
    </Card>
  )
}
