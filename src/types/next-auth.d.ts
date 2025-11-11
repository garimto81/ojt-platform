import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

/**
 * NextAuth.js 타입 확장
 * SSO에서 받은 사용자 정보를 TypeScript에서 사용 가능하도록 확장
 */

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: string
    } & DefaultSession['user']
    accessToken?: string
  }

  interface User extends DefaultUser {
    id: string
    email: string
    name: string
    image?: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    email: string
    name: string
    picture?: string
    role: string
    accessToken?: string
    refreshToken?: string
  }
}
