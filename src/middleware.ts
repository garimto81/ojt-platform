import { NextResponse, type NextRequest } from 'next/server'

/**
 * 임시로 인증 비활성화
 * TODO: 나중에 로그인 시스템 재활성화 필요
 */
export async function middleware(request: NextRequest) {
  console.log('🔓 Middleware - Authentication DISABLED (development mode)')

  // 모든 요청 허용 (인증 체크 없음)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
