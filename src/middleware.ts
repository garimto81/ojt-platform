import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware - 인증 및 권한 확인
 *
 * 보호된 라우트:
 * - /dashboard/* - 모든 인증된 사용자
 * - /dashboard/admin/* - admin, trainer만
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase 클라이언트 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update request cookies
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Update response cookies (reuse existing response)
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Update request cookies
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Update response cookies (reuse existing response)
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 사용자 인증 확인
  const { data: { user }, error } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public 라우트 (인증 불필요)
  const publicRoutes = ['/', '/login', '/register', '/auth/callback']
  const isPublicRoute = publicRoutes.includes(path)

  // API 라우트는 자체적으로 인증 체크
  if (path.startsWith('/api/')) {
    return response
  }

  // 보호된 라우트 (/dashboard/*)
  if (path.startsWith('/dashboard')) {
    // 인증되지 않은 사용자 → /login으로 리다이렉트
    if (error || !user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Admin 전용 라우트 체크
    if (path.startsWith('/dashboard/admin')) {
      // 사용자 역할 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // admin 또는 trainer가 아니면 접근 거부
      if (!profile || !['admin', 'trainer'].includes(profile.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // 인증된 사용자가 로그인 페이지 접근 → /dashboard로 리다이렉트
  if (user && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
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
