'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // URL 쿼리 파라미터에서 에러 메시지 읽기
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Google 로그인 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-wsop-light-gray to-white dark:from-wsop-dark-gray dark:to-wsop-black px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-wsop-medium-gray hover:text-wsop-black dark:text-gray-400 dark:hover:text-white mb-8 font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          홈으로
        </Link>

        <div className="bg-white dark:bg-wsop-dark-gray shadow-lg rounded-lg p-8 border border-wsop-light-gray dark:border-wsop-medium-gray">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-wsop-black dark:text-white mb-2">로그인</h2>
            <p className="text-sm text-wsop-medium-gray">WSOP 글로벌 스탠다드 교육 시스템</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black text-wsop-black dark:text-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-wsop-black dark:text-white mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-wsop-light-gray dark:border-wsop-medium-gray rounded focus:ring-2 focus:ring-wsop-red focus:border-transparent dark:bg-wsop-black text-wsop-black dark:text-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-error/10 dark:bg-error/20 text-error p-3 rounded text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-wsop-light-gray dark:border-wsop-medium-gray"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-wsop-dark-gray text-wsop-medium-gray">또는</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center px-6 py-3 border-2 border-wsop-light-gray dark:border-wsop-medium-gray rounded hover:bg-wsop-light-gray dark:hover:bg-wsop-black transition-colors font-semibold text-wsop-black dark:text-white"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>

          <div className="mt-6 text-center text-sm">
            <span className="text-wsop-medium-gray dark:text-gray-400">계정이 없으신가요? </span>
            <Link href="/register" className="text-wsop-red hover:text-red-700 font-semibold">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}