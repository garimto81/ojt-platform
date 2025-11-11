import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'

/**
 * NextAuth.js 설정
 * SSO System과 OAuth 2.0으로 연동
 */
export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'sso-system',
      name: 'GG Production SSO',
      type: 'oauth',

      // OAuth 2.0 Authorization Endpoint
      authorization: {
        url: `${process.env.SSO_URL}/api/v1/authorize`,
        params: {
          scope: 'openid email profile',
          response_type: 'code',
          client_id: process.env.SSO_APP_ID,
        },
      },

      // Token Exchange Endpoint
      token: {
        url: `${process.env.SSO_URL}/api/v1/token/exchange`,
      },

      // User Info Endpoint
      userinfo: {
        url: `${process.env.SSO_URL}/api/v1/userinfo`,
        async request(context) {
          const response = await fetch(context.tokens.userinfo?.url as string, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          })

          if (!response.ok) {
            throw new Error('Failed to fetch user info from SSO')
          }

          return await response.json()
        },
      },

      clientId: process.env.SSO_APP_ID!,
      clientSecret: process.env.SSO_APP_SECRET!,

      // SSO에서 받은 사용자 정보를 NextAuth 형식으로 매핑
      profile(profile) {
        return {
          id: profile.sub || profile.id,
          email: profile.email,
          name: profile.name || profile.display_name,
          image: profile.picture || profile.avatar_url,
          role: profile.role || 'trainee',
        }
      },
    },
  ],

  // 세션 전략: JWT 사용
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // JWT 설정
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // 페이지 경로 설정
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },

  // 콜백 함수들
  callbacks: {
    // JWT 토큰 생성/업데이트
    async jwt({ token, user, account }: any) {
      // 최초 로그인 시
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.role = user.role
      }

      // SSO access token 저장
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }

      return token
    },

    // 세션 객체 생성
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
      }

      return session
    },

    // 리디렉션 처리
    async redirect({ url, baseUrl }) {
      // 상대 경로면 baseUrl과 합치기
      if (url.startsWith('/')) return `${baseUrl}${url}`

      // 같은 도메인이면 허용
      if (new URL(url).origin === baseUrl) return url

      // 기본은 대시보드로
      return `${baseUrl}/dashboard`
    },
  },

  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === 'development',

  // Secret (필수)
  secret: process.env.NEXTAUTH_SECRET,
}
