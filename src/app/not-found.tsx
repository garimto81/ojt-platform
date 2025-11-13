import Link from 'next/link'
import { AlertCircle, Home } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Root-level 404 Not Found Page
 *
 * Features:
 * - WSOP Red (#DA1F26) brand colors
 * - Responsive design (mobile-first)
 * - Dark mode support
 * - Fade-in animation
 * - Accessible (semantic HTML, ARIA labels)
 *
 * Usage:
 * Automatically rendered by Next.js when route not found
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in fade-in duration-500">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-wsop-red/10 dark:bg-wsop-red/20 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-wsop-red" aria-hidden="true" />
            </div>
          </div>

          {/* Content */}
          <h1 className="text-4xl font-black text-wsop-black dark:text-white mb-3">
            404
          </h1>
          <h2 className="text-xl font-bold text-wsop-black dark:text-white mb-2">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-wsop-medium-gray dark:text-gray-400 mb-8">
            요청하신 페이지가 존재하지 않거나 삭제되었습니다.
            <br />
            URL을 확인하시거나 대시보드로 돌아가주세요.
          </p>

          {/* CTA Button */}
          <Link
            href="/dashboard"
            className="btn-primary inline-flex items-center justify-center font-black gap-2 w-full sm:w-auto"
            aria-label="대시보드로 돌아가기"
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            대시보드로 돌아가기
          </Link>

          {/* Additional Help */}
          <p className="text-sm text-wsop-medium-gray dark:text-gray-500 mt-6">
            문제가 계속되면{' '}
            <a
              href="mailto:support@wsop.com"
              className="text-wsop-red hover:underline font-semibold"
            >
              고객지원
            </a>
            에 문의하세요.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
