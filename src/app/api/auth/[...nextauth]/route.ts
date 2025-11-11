import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/options'

/**
 * NextAuth.js API Route Handler
 *
 * 모든 인증 관련 요청을 처리합니다:
 * - GET  /api/auth/signin - 로그인 페이지
 * - POST /api/auth/signin - 로그인 처리
 * - GET  /api/auth/callback/:provider - OAuth 콜백
 * - GET  /api/auth/signout - 로그아웃
 * - GET  /api/auth/session - 세션 조회
 * - GET  /api/auth/providers - Provider 목록
 * - GET  /api/auth/csrf - CSRF 토큰
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
