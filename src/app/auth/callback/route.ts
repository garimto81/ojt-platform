import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // 리디렉션 URL 생성
  const redirectUrl = new URL('/dashboard', origin)

  if (code) {
    const cookieStore = cookies()

    // Route Handler에서는 Response를 통해 쿠키를 전달해야 함
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Route Handler에서는 cookies().set()이 response에 반영되지 않음
            // 나중에 response 객체에 직접 설정
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name,
      })

      // 에러 메시지를 사용자에게 전달
      const errorMessage = encodeURIComponent(
        error.message || '인증에 실패했습니다'
      )
      return NextResponse.redirect(`${origin}/login?error=${errorMessage}`)
    }

    // Google OAuth 사용자의 경우 프로필이 없으면 생성
    if (authData?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      // 프로필이 없으면 생성
      if (profileError || !profile) {
        console.log('Creating profile for OAuth user:', authData.user.id)

        const fullName = authData.user.user_metadata?.full_name ||
                         authData.user.user_metadata?.name ||
                         authData.user.user_metadata?.given_name ||
                         authData.user.email?.split('@')[0]

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            full_name: fullName,
            avatar_url: authData.user.user_metadata?.avatar_url,
            role: 'trainee',
          })

        if (insertError) {
          console.error('Error creating profile:', insertError)
          // 프로필 생성 실패해도 로그인은 성공으로 처리 (나중에 수동 생성 가능)
        } else {
          console.log('Profile created successfully for OAuth user')
        }
      }
    }

    // 성공 시: 모든 쿠키를 response에 복사
    const response = NextResponse.redirect(redirectUrl)

    // cookieStore의 모든 쿠키를 response에 복사
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    })

    return response
  }

  // code가 없으면 dashboard로
  return NextResponse.redirect(redirectUrl)
}
