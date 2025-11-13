import Link from 'next/link'
import { Users, Construction, Home, MessageSquare, UserPlus, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

/**
 * Community Coming Soon Page
 *
 * Features:
 * - Coming soon design with feature preview
 * - WSOP brand colors
 * - Responsive grid layout
 * - Dark mode support
 * - Fade-in animations
 * - Accessible (ARIA labels, semantic HTML)
 *
 * Usage:
 * /dashboard/community route
 */
export default function CommunityPage() {
  return (
    <div className="container py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-wsop-black dark:text-white mb-2 flex items-center gap-3">
          <Users className="h-8 w-8 text-wsop-red" aria-hidden="true" />
          Community
        </h1>
        <p className="text-wsop-medium-gray dark:text-gray-400">
          교육생들과 소통하고 협업하세요
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="mb-8 border-2 border-wsop-red/20 animate-in slide-in-from-bottom-4 duration-700">
        <CardContent className="p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-wsop-red/10 to-wsop-red/5 dark:from-wsop-red/20 dark:to-wsop-red/10 flex items-center justify-center">
              <Construction className="h-12 w-12 text-wsop-red" aria-hidden="true" />
            </div>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-black text-wsop-black dark:text-white mb-3">
            커뮤니티 기능은 곧 출시됩니다
          </h2>
          <p className="text-wsop-medium-gray dark:text-gray-400 max-w-md mx-auto mb-8">
            교육생들이 서로 소통하고 협업할 수 있는 공간을 준비 중입니다.
            <br />
            조금만 기다려주세요!
          </p>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="btn-primary inline-flex items-center justify-center font-black gap-2"
            aria-label="대시보드로 돌아가기"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            대시보드로 돌아가기
          </Link>
        </CardContent>
      </Card>

      {/* Feature Preview Grid */}
      <div className="mb-6">
        <h3 className="text-xl font-black text-wsop-black dark:text-white mb-4">
          곧 출시될 기능
        </h3>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature 1: Discussion */}
        <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-100 hover:border-wsop-red/30 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-wsop-red/10 dark:bg-wsop-red/20 flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-wsop-red" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg font-black text-wsop-black dark:text-white">
              자유 토론
            </CardTitle>
            <CardDescription className="text-wsop-medium-gray dark:text-gray-400">
              학습 내용을 공유하고 질문하는 공간
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Feature 2: Study Groups */}
        <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-200 hover:border-wsop-red/30 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-wsop-red/10 dark:bg-wsop-red/20 flex items-center justify-center mb-3">
              <UserPlus className="h-6 w-6 text-wsop-red" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg font-black text-wsop-black dark:text-white">
              스터디 그룹
            </CardTitle>
            <CardDescription className="text-wsop-medium-gray dark:text-gray-400">
              함께 학습할 동료를 찾고 팀 구성
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Feature 3: Events */}
        <Card className="animate-in slide-in-from-bottom-4 duration-700 delay-300 hover:border-wsop-red/30 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-wsop-red/10 dark:bg-wsop-red/20 flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6 text-wsop-red" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg font-black text-wsop-black dark:text-white">
              이벤트 & 모임
            </CardTitle>
            <CardDescription className="text-wsop-medium-gray dark:text-gray-400">
              교육 관련 이벤트 및 네트워킹
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
