import { redirect } from 'next/navigation'

/**
 * Dashboard 진입점
 *
 * 기본적으로 Simple Dashboard로 리다이렉트
 * 환경 변수로 모드 전환 가능:
 * - NEXT_PUBLIC_DASHBOARD_MODE=simple (기본)
 * - NEXT_PUBLIC_DASHBOARD_MODE=full (고급 모드)
 */
export default function DashboardRedirect() {
  const dashboardMode = process.env.NEXT_PUBLIC_DASHBOARD_MODE || 'simple'

  if (dashboardMode === 'full') {
    redirect('/dashboard/full')
  }

  redirect('/dashboard/simple')
}
