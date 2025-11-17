import { User, Menu } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

/**
 * Simple Dashboard Layout
 *
 * 특징:
 * - 사이드바 없음
 * - 상단 바만 최소한으로
 * - 깔끔하고 집중된 경험
 */
export default async function SimpleDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      {/* 최소한의 상단 바 */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* 햄버거 메뉴 (전체 기능 접근) */}
          <div className="relative group">
            <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="메뉴"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* 드롭다운 메뉴 */}
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="py-2">
                <Link
                  href="/dashboard/learning"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  📚 전체 커리큘럼
                </Link>
                <Link
                  href="/dashboard/leaderboard"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  🏆 리더보드
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ⚙️ 프로필 & 설정
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                <Link
                  href="/dashboard/full"
                  className="block px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  고급 대시보드 →
                </Link>
              </div>
            </div>
          </div>

          {/* 프로필 */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {user?.email?.split('@')[0]}
            </span>
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 (헤더 높이만큼 패딩) */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
