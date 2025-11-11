'use client'

import { SessionProvider } from 'next-auth/react'

/**
 * NextAuth SessionProvider Wrapper
 *
 * Client Component로 NextAuth의 SessionProvider를 래핑합니다.
 * Root Layout에서 사용하여 앱 전체에서 useSession hook을 사용할 수 있게 합니다.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
