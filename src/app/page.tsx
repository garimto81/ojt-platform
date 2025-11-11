'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { ArrowRight, BookOpen, Users, Trophy, Zap, Loader2 } from 'lucide-react'

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white dark:bg-wsop-dark-gray p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-wsop-light-gray dark:border-wsop-medium-gray">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-wsop-black dark:text-white mb-2">{title}</h3>
      <p className="text-wsop-medium-gray dark:text-gray-400 text-sm">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl md:text-5xl font-black text-white mb-2">{number}</div>
      <div className="text-base font-medium text-wsop-light-gray uppercase tracking-wider">{label}</div>
    </div>
  )
}

function ProgramDay({ day, title, topics }: {
  day: string
  title: string
  topics: string[]
}) {
  return (
    <div className="bg-white dark:bg-wsop-dark-gray p-6 rounded-lg border-l-4 border-wsop-red shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="bg-wsop-red text-white px-3 py-1 rounded font-bold text-sm">
            {day}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-wsop-black dark:text-white mb-3">{title}</h3>
          <ul className="space-y-2">
            {topics.map((topic, index) => (
              <li key={index} className="flex items-center text-wsop-medium-gray dark:text-gray-400">
                <span className="w-1.5 h-1.5 bg-wsop-red rounded-full mr-3"></span>
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    deploymentRate: 0,
    graduatedTrainees: 0,
    trainingDays: 7
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // URL 쿼리 파라미터에서 에러 메시지 읽기
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Check if user is already logged in - redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/stats/public')
        const data = await response.json()
        setStats({
          deploymentRate: data.deploymentRate || 0,
          graduatedTrainees: data.graduatedTrainees || 0,
          trainingDays: data.trainingDays || 7
        })
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }
    loadStats()
  }, [])

  const handleSSOLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      // NextAuth signIn with SSO System provider
      // This will redirect to SSO System's login page
      const result = await signIn('sso-system', {
        callbackUrl: '/dashboard',
        redirect: true,
      })

      if (result?.error) {
        setError('로그인 중 오류가 발생했습니다: ' + result.error)
        setLoading(false)
      }
      // If successful, user will be redirected to SSO System
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  // Show loading while checking authentication status
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
        <Loader2 className="h-8 w-8 animate-spin text-wsop-red" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black">
      {/* Hero Section with Login */}
      <section className="container pt-20 pb-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Brand Info */}
          <div className="text-center lg:text-left">
            <div className="mb-4">
              <span className="inline-block bg-wsop-black text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                GG PRODUCTION 사내 전용
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-wsop-black dark:text-white mb-6">
              포커 프로덕션 전문가<br />온보딩 플랫폼
            </h1>
            <p className="text-xl text-wsop-medium-gray dark:text-gray-400 mb-4">
              신규 입사자가 포커 프로덕션 현장 투입까지
            </p>
            <p className="text-3xl font-black text-wsop-black dark:text-white mb-8">
              21일 → {stats.trainingDays}일
            </p>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div>
                <div className="text-2xl font-black text-wsop-red">{stats.deploymentRate}%</div>
                <div className="text-xs text-wsop-medium-gray">투입률</div>
              </div>
              <div>
                <div className="text-2xl font-black text-wsop-red">{stats.graduatedTrainees}명</div>
                <div className="text-xs text-wsop-medium-gray">수료</div>
              </div>
              <div>
                <div className="text-2xl font-black text-wsop-red">{stats.trainingDays}일</div>
                <div className="text-xs text-wsop-medium-gray">교육기간</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white dark:bg-wsop-dark-gray shadow-2xl rounded-2xl p-8 border-t-4 border-wsop-red">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-wsop-black dark:text-white mb-2">로그인</h2>
                <p className="text-sm text-wsop-medium-gray">GG Production SSO 시스템</p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded text-sm mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleSSOLogin}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center text-base py-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      SSO 시스템으로 이동 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      SSO로 로그인
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-wsop-medium-gray dark:text-gray-400">
                  GG Production 통합 인증 시스템을 통해 안전하게 로그인됩니다.
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
                  <strong>SSO (Single Sign-On)</strong><br />
                  한 번의 로그인으로 모든 GG Production 앱에 접근할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center text-wsop-black dark:text-white mb-4">교육 시스템</h2>
        <p className="text-center text-wsop-medium-gray mb-12">GG PRODUCTION 현장 검증 커리큘럼</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BookOpen className="h-8 w-8 text-wsop-red" />}
            title="체계적 커리큘럼"
            description="포커 기초부터 라이브 방송 운영까지 단계별 학습"
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-wsop-red" />}
            title="실전 중심 교육"
            description="실제 토너먼트 영상과 시나리오 기반 실습"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-wsop-red" />}
            title="선배 멘토링"
            description="현직 프로덕션 팀원의 1:1 코칭 및 피드백"
          />
          <FeatureCard
            icon={<Trophy className="h-8 w-8 text-wsop-red" />}
            title="현장 투입 검증"
            description="최종 평가 통과 후 즉시 실무 배치"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16">
        <div className="bg-wsop-black dark:bg-wsop-dark-gray rounded-2xl p-12 border-t-4 border-wsop-red">
          <h3 className="text-2xl font-bold text-white text-center mb-8">2024년 교육 성과</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number={`21일 → ${stats.trainingDays}일`} label="온보딩 기간" />
            <StatCard number={`${stats.deploymentRate}%`} label="현장 투입률" />
            <StatCard number={`${stats.graduatedTrainees}명`} label="수료 인원" />
          </div>
        </div>
      </section>

      {/* Training Program Section */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-wsop-black dark:text-white mb-8 text-center">{stats.trainingDays}일 교육 프로그램</h2>
          <div className="space-y-4">
            <ProgramDay day="DAY 1-2" title="포커 기초" topics={["텍사스 홀덤 룰", "핸드 랭킹", "베팅 구조", "토너먼트 용어"]} />
            <ProgramDay day="DAY 3-4" title="프로덕션 스킬" topics={["카메라 스위칭", "그래픽 오버레이", "오디오 믹싱", "스트림 관리"]} />
            <ProgramDay day="DAY 5-6" title="실전 시뮬레이션" topics={["3시간 모의 방송", "긴급 상황 대응", "팀 협업 훈련", "품질 관리"]} />
            <ProgramDay day="DAY 7" title="최종 평가" topics={["이론 테스트", "실무 평가", "현장 투입 승인"]} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 text-center">
        <h2 className="text-3xl font-bold text-wsop-black dark:text-white mb-4">지금 바로 시작하세요</h2>
        <p className="text-xl text-wsop-medium-gray dark:text-gray-400 mb-8">
          GG PRODUCTION 사내 계정으로 로그인
        </p>
        <Link href="/login" className="btn-primary inline-flex items-center text-lg px-8 py-4">
          로그인하기 <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </section>
    </div>
  )
}
