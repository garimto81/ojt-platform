import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

/**
 * NextAuth.js Middleware
 *
 * SSO System과 연동하여 인증을 체크합니다.
 * - /dashboard, /admin 경로는 인증 필요
 * - 인증되지 않은 사용자는 메인 페이지(/)로 리디렉션
 * - 인증된 사용자가 메인 페이지 접근 시 /dashboard로 리디렉션
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    console.log('🔍 NextAuth Middleware Check:')
    console.log('  Path:', pathname)
    console.log('  Authenticated:', !!token)
    if (token) {
      console.log('  User:', token.email)
      console.log('  Role:', token.role)
    }

    // 인증된 사용자가 메인 페이지(/) 접근 시 dashboard로 리디렉션
    if (token && pathname === '/') {
      console.log('  ↪ Redirecting to /dashboard (user already authenticated)')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // 정상 진행
    return NextResponse.next()
  },
  {
    // 커스텀 로그인 페이지 설정
    pages: {
      signIn: '/',  // 메인 페이지를 로그인 페이지로 사용
    },

    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // /dashboard, /admin은 인증 필요
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          return !!token
        }

        // /api/auth/* 는 NextAuth가 처리
        if (pathname.startsWith('/api/auth')) {
          return true
        }

        // 기타 경로는 모두 허용 (메인 페이지, 공개 페이지 등)
        return true
      },
    },
  }
)

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
