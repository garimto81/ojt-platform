'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * 임시 메인 페이지 - 인증 없이 바로 대시보드로 리다이렉트
 * TODO: 나중에 로그인 시스템 추가
 */
export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 대시보드로 자동 리다이렉트
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-wsop-red" />
        <p className="text-gray-600">대시보드로 이동 중...</p>
      </div>
    </div>
  )
}
