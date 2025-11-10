import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 서버 사이드 디버깅 로그
  console.log('🔍 Middleware - Supabase Config Check:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `✅ ${supabaseUrl}` : '❌ Missing')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? `✅ ${supabaseKey.substring(0, 30)}...` : '❌ Missing')

  // Supabase 환경 변수는 로그인에 필수이므로 검증
  // 하지만 앱을 크래시시키지 않고 에러 페이지로 리디렉션
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    return NextResponse.json(
      { error: 'Server configuration error. Please contact administrator.' },
      { status: 500 }
    )
  }

  // Key 형식 검증
  if (!supabaseKey.startsWith('eyJ')) {
    console.error('❌ Invalid Supabase Anon Key format. Should start with "eyJ"')
    console.error('   Current key starts with:', supabaseKey.substring(0, 20))
    return NextResponse.json(
      { error: 'Server configuration error. Invalid API key format.' },
      { status: 500 }
    )
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Supabase API 호출 시도
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      console.error('❌ Supabase auth.getUser() error:', error)
      console.error('   Error message:', error.message)
      console.error('   Error status:', error.status)
    }

    user = data?.user || null
  } catch (error: any) {
    console.error('❌ Supabase API call exception:', error)
    console.error('   Exception message:', error.message)
  }

  // Protected routes - require authentication
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Redirect authenticated users away from login/register
  if ((request.nextUrl.pathname === '/login' ||
       request.nextUrl.pathname === '/register') && user) {
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
