# 🆘 Troubleshooting Guide

GG Production 플랫폼의 일반적인 문제와 해결 방법입니다.

---

## 📋 목차

1. [환경 변수 문제](#환경-변수-문제)
2. [빌드 및 배포 문제](#빌드-및-배포-문제)
3. [데이터베이스 연결 문제](#데이터베이스-연결-문제)
4. [인증 문제](#인증-문제)
5. [AI 기능 문제](#ai-기능-문제)
6. [성능 문제](#성능-문제)
7. [테스트 문제](#테스트-문제)

---

## 🔑 환경 변수 문제

### ❌ "Missing environment variables"

**증상**:
```
Error: Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL
```

**원인**: 환경 변수가 설정되지 않음

**해결**:
```bash
# 1. 환경 변수 확인
npm run check-env

# 2. .env.local 파일 생성
cp .env.example .env.local

# 3. 필수 변수 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
GEMINI_API_KEY=AIzaSy...

# 4. 서버 재시작
npm run dev
```

### ❌ "Invalid API key format"

**증상**:
```
Invalid Supabase Anon Key format
```

**원인**:
1. Anon Key 대신 Service Role Key 사용
2. Key에 공백 포함
3. 다른 프로젝트의 Key 사용

**해결**:
```bash
# Supabase Dashboard → Settings → API
# "anon public" key 복사 (NOT service_role!)

# .env.local 확인
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  # 공백 없이!
```

**검증**:
```typescript
// Key가 "eyJ"로 시작하는지 확인
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ'))
// true여야 함
```

---

## 🏗️ 빌드 및 배포 문제

### ❌ Vercel 빌드 실패

**증상**:
```
Failed to fetch font `Inter`
Error [NextFontError]: Failed to fetch font `Inter`
```

**원인**: Google Fonts 네트워크 문제

**해결 1** (Fallback 추가):
```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],  // 추가!
})
```

**해결 2** (Tailwind 기본 폰트):
```typescript
// Inter import 제거
// className에서 inter.className 제거
// Tailwind의 font-sans 사용
```

### ❌ TypeScript 컴파일 에러

**증상**:
```
Type error: Property 'xxx' does not exist on type 'yyy'
```

**해결**:
```bash
# 1. 타입 확인
npm run build

# 2. 캐시 삭제
rm -rf .next
rm -rf node_modules/.cache

# 3. 재설치
npm install

# 4. 재빌드
npm run build
```

### ❌ "Module not found"

**증상**:
```
Module not found: Can't resolve '@/components/...'
```

**해결**:
```bash
# 1. path alias 확인 (tsconfig.json)
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# 2. 파일 경로 확인
ls src/components/  # 파일이 존재하는지

# 3. 캐시 삭제 후 재시작
rm -rf .next
npm run dev
```

---

## 🗄️ 데이터베이스 연결 문제

### ❌ "could not connect to database"

**증상**:
```
Error: could not connect to database
Error: connect ECONNREFUSED
```

**원인**:
1. DATABASE_URL 형식 오류
2. Supabase 프로젝트 비활성
3. 네트워크 방화벽

**해결**:
```bash
# 1. DATABASE_URL 형식 확인
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres

# 2. Supabase Dashboard에서 프로젝트 활성 상태 확인
https://supabase.com/dashboard

# 3. 연결 테스트 (Supabase SQL Editor)
SELECT now();
```

### ❌ "Invalid login credentials"

**증상**:
```
AuthApiError: Invalid login credentials
```

**원인**:
1. 이메일/비밀번호 오류
2. 이메일 미인증
3. 사용자 비활성화

**해결**:
```sql
-- Supabase SQL Editor
-- 1. 사용자 확인
SELECT email, email_confirmed_at, banned_until
FROM auth.users
WHERE email = 'user@example.com';

-- 2. 이메일 인증 처리 (개발 단계)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';

-- 3. 사용자 활성화
UPDATE auth.users
SET banned_until = NULL
WHERE email = 'user@example.com';
```

---

## 🔐 인증 문제

### ❌ 무한 리다이렉트 루프

**증상**:
```
/login → /dashboard → /login → /dashboard → ...
```

**원인**:
1. Supabase Redirect URLs 미설정
2. Middleware 설정 오류
3. 쿠키 문제

**해결**:
```bash
# 1. Supabase Redirect URLs 설정
Supabase Dashboard → Authentication → URL Configuration
→ Add Redirect URLs:
  http://localhost:3000/auth/callback
  https://your-domain.vercel.app/auth/callback

# 2. Site URL 설정
Site URL: http://localhost:3000

# 3. 쿠키 삭제
브라우저 개발자 도구 (F12) → Application → Cookies → 모두 삭제

# 4. 브라우저 캐시 삭제
Ctrl + Shift + Delete
```

### ❌ "Unauthorized" (401)

**증상**:
```
Failed to fetch: 401 Unauthorized
```

**원인**:
1. 세션 만료
2. 토큰 무효
3. RLS 정책 차단

**해결**:
```typescript
// 1. 세션 확인
const { data, error } = await supabase.auth.getSession()
console.log('Session:', data.session)

// 2. 재로그인
await supabase.auth.signOut()
// → 로그인 페이지로 이동하여 재로그인

// 3. RLS 정책 확인 (Supabase SQL Editor)
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

### ❌ Admin 메뉴 안 보임

**증상**: Admin 섹션이 사이드바에 표시되지 않음

**원인**: 사용자 role이 'admin'이 아님

**해결**:
```sql
-- Supabase SQL Editor
-- 1. 현재 role 확인
SELECT email, role FROM profiles WHERE email = 'your-email@example.com';

-- 2. Admin 권한 부여
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- 3. 로그아웃 → 재로그인
```

---

## 🤖 AI 기능 문제

### ❌ "Gemini API key invalid"

**증상**:
```
Error: Gemini API key invalid
400 Bad Request: API key not valid
```

**원인**:
1. API Key 형식 오류
2. API Key 만료
3. Quota 초과

**해결**:
```bash
# 1. API Key 재확인 (Google AI Studio)
https://ai.google.dev

# 2. .env.local 업데이트
GEMINI_API_KEY=AIzaSy...  # AIza로 시작

# 3. Vercel 환경 변수 확인 (배포 시)
Vercel Dashboard → Settings → Environment Variables

# 4. 서버 재시작
npm run dev
```

### ❌ 퀴즈 생성 안 됨

**증상**:
```
Error: Lesson has no content
Quiz generation failed
```

**원인**:
1. 레슨 콘텐츠 없음
2. AI API 오류
3. 네트워크 타임아웃

**해결**:
```bash
# 1. 레슨 콘텐츠 확인
Admin → Lesson Content → 레슨 선택 → 콘텐츠 있는지 확인

# 2. AI API 로그 확인
Vercel → Deployments → Functions → api/admin/generate-quiz

# 3. 타임아웃 증가
# vercel.json
{
  "functions": {
    "api/admin/generate-quiz/route.ts": {
      "maxDuration": 60
    }
  }
}
```

---

## ⚡ 성능 문제

### ❌ 페이지 로딩 느림

**증상**: 페이지 로드 시간 > 3초

**원인**:
1. 이미지 미최적화
2. 과도한 JavaScript
3. 데이터베이스 쿼리 느림

**해결**:
```bash
# 1. Lighthouse 분석
Chrome DevTools → Lighthouse → Generate report

# 2. Bundle 분석
npm run build
npm run analyze  # @next/bundle-analyzer 설치 필요

# 3. 이미지 최적화
next/image 컴포넌트 사용
```

### ❌ 메모리 누수

**증상**: 브라우저 메모리 지속적 증가

**해결**:
```typescript
// useEffect cleanup 확인
useEffect(() => {
  const subscription = supabase
    .channel('changes')
    .on('postgres_changes', callback)
    .subscribe()

  return () => {
    subscription.unsubscribe()  // 필수!
  }
}, [])
```

---

## 🧪 테스트 문제

### ❌ Jest 테스트 실패

**증상**:
```
Cannot find module '@/components/...'
```

**해결**:
```javascript
// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

### ❌ Playwright 타임아웃

**증상**:
```
Test timeout of 30000ms exceeded
```

**해결**:
```typescript
// playwright.config.ts
{
  timeout: 60000,  // 60초로 증가
  expect: { timeout: 10000 }
}
```

### ❌ 포트 충돌

**증상**:
```
Error: Port 3001 is already in use
```

**해결**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9

# 또는 다른 포트 사용
npm run dev -- -p 3002
```

---

## 🔍 디버깅 팁

### Chrome DevTools

**Console 에러 확인**:
```
F12 → Console → 에러 메시지 확인
```

**Network 요청 확인**:
```
F12 → Network → 실패한 요청 확인 (빨간색)
```

**Local Storage 확인**:
```
F12 → Application → Local Storage
```

### Vercel 로그

**Function Logs**:
```
Vercel Dashboard → Deployments → 최신 배포 → Functions
→ 실시간 로그 확인
```

**Build Logs**:
```
Vercel Dashboard → Deployments → 최신 배포 → Build Logs
→ 빌드 에러 확인
```

### Supabase 로그

**Auth Logs**:
```
Supabase Dashboard → Logs → Auth Logs
→ 로그인/회원가입 에러 확인
```

**Database Logs**:
```
Supabase Dashboard → Logs → Database Logs
→ 쿼리 에러 확인
```

---

## 📞 추가 지원

### 공식 문서
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Gemini API**: [ai.google.dev/docs](https://ai.google.dev/docs)

### 커뮤니티
- **GitHub Issues**: [github.com/garimto81/ojt-platform/issues](https://github.com/garimto81/ojt-platform/issues)
- **Next.js Discord**: [nextjs.org/discord](https://nextjs.org/discord)
- **Supabase Discord**: [supabase.com/discord](https://supabase.com/discord)

---

## ✅ 체크리스트

문제 발생 시 순서대로 확인:

1. [ ] 에러 메시지 전체 복사
2. [ ] 브라우저 콘솔 에러 확인 (F12)
3. [ ] `npm run check-env` 실행
4. [ ] 로컬 빌드 테스트 (`npm run build`)
5. [ ] Supabase Dashboard 확인
6. [ ] Vercel Logs 확인 (배포 시)
7. [ ] 캐시 삭제 (`.next`, `node_modules/.cache`)
8. [ ] 서버 재시작
9. [ ] 브라우저 캐시 삭제
10. [ ] 위 가이드에서 유사한 문제 검색

---

## 🔗 관련 문서

- [QUICK_START.md](./QUICK_START.md) - 초기 설정
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 개발 가이드
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
- [TESTING.md](./TESTING.md) - 테스트 가이드

---

**버전**: 1.0.0 | **최종 업데이트**: 2025-01-17
