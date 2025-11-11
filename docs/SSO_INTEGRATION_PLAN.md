# OJT Platform ↔ SSO System 통합 계획

## 📋 현재 상황 분석

### SSO System (garimto81/sso-system)
- **역할:** 중앙 인증 서버 (OAuth 2.0)
- **기술:** Node.js/Express + Supabase Auth
- **버전:** v0.1.0 (핵심 기능 완료)
- **엔드포인트:**
  - `POST /auth/login` - 로그인
  - `POST /auth/signup` - 회원가입
  - `GET /api/v1/authorize` - Authorization Code 발급
  - `POST /api/v1/token/exchange` - JWT Token 교환
  - `GET /api/v1/apps` - 등록된 앱 목록

### OJT Platform (현재 레포)
- **역할:** 클라이언트 애플리케이션
- **기술:** Next.js 14 (App Router) + Supabase Auth (직접 사용)
- **인증:** Supabase Auth 직접 통합 (20개 파일)
- **DB:** Supabase PostgreSQL (단일 회사용)

---

## 🎯 통합 아키텍처

### Before (현재)
```
OJT Platform ←→ Supabase Auth (직접 연결)
```

### After (SSO 통합)
```
OJT Platform ←→ SSO System ←→ Supabase Auth
     ↑              ↑
     └──────────────┘
    OAuth 2.0 Flow
```

**장점:**
- ✅ 중앙화된 인증 관리
- ✅ 다른 앱(VTC_Logger, contents-factory)과 동일한 인증
- ✅ 한 번 로그인하면 모든 앱 접근 가능 (SSO)

---

## 🚀 통합 전략 (3가지 옵션)

### 옵션 A: SDK 기반 통합 (권장) ⭐
**상태:** SDK는 v0.2.0부터 개발 예정 (아직 없음)

**장점:**
- ✅ 가장 간단한 통합
- ✅ SDK가 자동으로 인증 관리
- ✅ 코드 변경 최소화

**단점:**
- ❌ SDK가 아직 개발되지 않음
- ⏰ SDK 완성 대기 필요

**예상 코드:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import { SSOProvider } from '@your-org/sso-sdk'

export const { GET, POST } = SSOProvider({
  ssoUrl: process.env.SSO_URL,
  appId: process.env.SSO_APP_ID,
  appSecret: process.env.SSO_APP_SECRET
})
```

---

### 옵션 B: NextAuth.js + OAuth 2.0 (현실적) ⭐⭐⭐
**상태:** 즉시 구현 가능

**장점:**
- ✅ SDK 없이도 통합 가능
- ✅ NextAuth.js는 OAuth 2.0 표준 지원
- ✅ 검증된 라이브러리
- ✅ 5-7일이면 완료

**구현 방법:**
```typescript
// lib/auth/options.ts
import NextAuth from 'next-auth'

export const authOptions = {
  providers: [
    {
      id: 'sso-system',
      name: 'GG Production SSO',
      type: 'oauth',
      authorization: {
        url: `${process.env.SSO_URL}/api/v1/authorize`,
        params: {
          scope: 'openid email profile',
          response_type: 'code'
        }
      },
      token: {
        url: `${process.env.SSO_URL}/api/v1/token/exchange`,
      },
      userinfo: {
        url: `${process.env.SSO_URL}/api/v1/userinfo`,  // SSO에 추가 필요
      },
      clientId: process.env.SSO_APP_ID,
      clientSecret: process.env.SSO_APP_SECRET,
    }
  ],

  // Supabase DB를 NextAuth adapter로 사용
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),

  callbacks: {
    async session({ session, user }) {
      // SSO에서 받은 사용자 정보를 세션에 추가
      session.user.id = user.id
      session.user.role = user.role
      return session
    }
  }
}
```

**필요한 변경:**
1. OJT Platform: Supabase Auth → NextAuth.js
2. SSO System: `/api/v1/userinfo` 엔드포인트 추가 (표준)

---

### 옵션 C: 직접 OAuth 2.0 구현 (고급)
**상태:** 가능하지만 복잡

**장점:**
- ✅ 완전한 제어
- ✅ 외부 라이브러리 의존 없음

**단점:**
- ❌ 구현 복잡도 높음
- ❌ 보안 이슈 처리 필요
- ❌ 유지보수 부담

---

## 📝 권장 접근: 옵션 B (NextAuth.js)

### Phase 1: SSO System 준비 (1-2일)

#### 1.1 SSO에 OJT Platform 앱 등록
```sql
-- Supabase에서 실행
INSERT INTO apps (name, redirect_uri, client_id, client_secret)
VALUES (
  'OJT Platform',
  'https://ojt-platform.vercel.app/api/auth/callback/sso-system',
  'ojt-platform-client-id',
  'ojt-platform-client-secret'
);
```

#### 1.2 SSO에 UserInfo 엔드포인트 추가
```javascript
// SSO System의 server/src/routes/api.js
router.get('/api/v1/userinfo', authenticateJWT, async (req, res) => {
  const { data: user } = await supabase
    .from('users')
    .select('id, email, display_name, avatar_url, role')
    .eq('id', req.user.id)
    .single()

  res.json({
    sub: user.id,
    email: user.email,
    name: user.display_name,
    picture: user.avatar_url,
    role: user.role
  })
})
```

---

### Phase 2: OJT Platform 변경 (3-4일)

#### 2.1 NextAuth.js 설치
```bash
npm install next-auth @next-auth/supabase-adapter
```

#### 2.2 환경 변수 추가
```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-random-secret

SSO_URL=https://sso.ggproduction.com
SSO_APP_ID=ojt-platform-client-id
SSO_APP_SECRET=ojt-platform-client-secret
```

#### 2.3 NextAuth 설정
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/options'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

#### 2.4 기존 Supabase Auth 호출 변경 (20개 파일)
```typescript
// Before
import { createClient } from '@/lib/supabase/client'
const { data: { user } } = await supabase.auth.getUser()

// After
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
const session = await getServerSession(authOptions)
const user = session?.user
```

#### 2.5 Middleware 변경
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
```

---

### Phase 3: 데이터베이스 동기화 (1일)

#### 옵션 A: 같은 Supabase 인스턴스 사용
```
SSO System ←→ Supabase (auth.users)
                  ↑
OJT Platform ←────┘ (같은 DB 참조)
```

**장점:**
- ✅ 사용자 데이터 자동 동기화
- ✅ 추가 작업 불필요

**단점:**
- ❌ DB 의존성 증가

#### 옵션 B: 별도 Supabase 인스턴스 + Webhook 동기화
```
SSO System ←→ Supabase A (auth.users)
                  ↓ (webhook)
OJT Platform ←→ Supabase B (profiles)
```

**장점:**
- ✅ DB 분리 (독립성)
- ✅ 장애 격리

**단점:**
- ❌ 동기화 로직 필요
- ❌ 데이터 일관성 관리

💡 **권장:** 단일 회사용이므로 **옵션 A (같은 Supabase)**

---

### Phase 4: 마이그레이션 (1-2일)

#### 4.1 사용자 데이터 마이그레이션
```sql
-- 기존 Supabase Auth users를 SSO System의 users 테이블과 매핑
-- 이메일 기준으로 자동 연결
```

#### 4.2 기존 세션 처리
- **옵션 1:** 모든 사용자 재로그인 요청
- **옵션 2:** 점진적 마이그레이션 (Supabase Auth와 NextAuth 병행)

#### 4.3 테스트
- [ ] SSO 로그인 플로우
- [ ] 기존 사용자 로그인
- [ ] 권한 체크 (admin, trainer, trainee)
- [ ] 세션 유지
- [ ] 로그아웃

---

## 🗓️ 예상 일정 (옵션 B 기준)

| Phase | 작업 | 담당 | 기간 |
|-------|------|------|------|
| 1 | SSO System 준비 (앱 등록, userinfo 추가) | SSO 팀 | 1-2일 |
| 2 | NextAuth.js 통합 | OJT 팀 | 3-4일 |
| 3 | DB 전략 결정 & 연결 | 공동 | 1일 |
| 4 | 마이그레이션 & 테스트 | 공동 | 1-2일 |

**총 예상 기간: 6-9일**

---

## ⚠️ 주의사항

### 1. DB 전략 결정 (중요!)
- [ ] 같은 Supabase 인스턴스 사용?
- [ ] 별도 인스턴스 + Webhook?
- [ ] SSO System의 Supabase 접속 정보 필요

### 2. SSO System 수정 필요
- [ ] `/api/v1/userinfo` 엔드포인트 추가 (OAuth 2.0 표준)
- [ ] CORS 설정 (OJT Platform 도메인 허용)
- [ ] Rate limiting 확인

### 3. 보안
- [ ] HTTPS 필수 (Production)
- [ ] `client_secret` 안전 보관
- [ ] CSRF 보호
- [ ] JWT 서명 검증

### 4. 기존 사용자
- [ ] 재로그인 공지
- [ ] 데이터 손실 방지
- [ ] 롤백 계획

---

## 🔍 즉시 확인 필요 사항

### SSO System 관련
1. **SSO System의 Supabase 인스턴스는?**
   - URL: `_______________`
   - OJT Platform과 같은 인스턴스인가요?

2. **SSO System이 배포되어 있나요?**
   - 배포 URL: `_______________`
   - 로컬에서만 실행 중?

3. **다른 앱들도 이미 SSO와 연동되어 있나요?**
   - VTC_Logger: 연동 완료?
   - contents-factory: 연동 완료?

### OJT Platform 관련
4. **기존 사용자 수는?**
   - _____ 명

5. **재로그인 요청이 가능한가요?**
   - 가능 / 불가능

6. **배포 환경은?**
   - Vercel / 기타

---

## 🚀 Next Steps

**답변해주시면 즉시 시작:**

1. **어떤 옵션을 선택하시겠습니까?**
   - [ ] 옵션 A: SDK 개발 대기 (SDK 개발 필요)
   - [ ] **옵션 B: NextAuth.js (권장, 즉시 시작 가능)** ⭐
   - [ ] 옵션 C: 직접 구현

2. **DB 전략은?**
   - [ ] 같은 Supabase 사용
   - [ ] 별도 Supabase + Webhook

3. **즉시 확인 필요 사항** 답변

답변해주시면 바로 구현 시작하겠습니다! 🚀
