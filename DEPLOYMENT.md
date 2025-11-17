# 🚀 Deployment Guide

Vercel로 GG Production 플랫폼을 10분 안에 프로덕션 배포하는 가이드입니다.

---

## ⚡ 빠른 배포 (자동화, 5분)

### Step 1: Vercel 계정 연결

```bash
# Vercel CLI 설치 (한 번만)
npm install -g vercel

# 로그인
vercel login
```

### Step 2: 환경 변수 자동 설정

```bash
npm run setup:vercel
```

**프롬프트에 따라 입력**:
1. Supabase Project URL
2. Supabase Anon Key
3. Supabase Service Role Key
4. Gemini API Key
5. Vercel 배포 URL

**결과**: Vercel Production/Preview 환경 변수가 자동 설정됩니다.

### Step 3: Supabase Redirect URL 설정

1. Vercel에서 배포된 URL 확인 (예: `https://ojt-platform.vercel.app`)
2. [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → URL Configuration
3. **Redirect URLs** 추가:
   ```
   https://ojt-platform.vercel.app
   https://ojt-platform.vercel.app/auth/callback
   https://ojt-platform.vercel.app/**
   ```
4. **Site URL** 업데이트:
   ```
   https://ojt-platform.vercel.app
   ```
5. **Save** 클릭

### Step 4: 배포

```bash
# Git push로 자동 배포
git push origin main

# 또는 Vercel CLI로 수동 배포
vercel deploy --prod
```

완료! 🎉

---

## 🔧 수동 배포 (Vercel Dashboard)

자동화 스크립트 없이 직접 설정하는 방법입니다.

### Step 1: Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com) 접속
2. **Add New Project** 클릭
3. GitHub 저장소 Import
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 2: 환경 변수 설정

**Settings → Environment Variables**에서 추가:

#### 필수 환경 변수

**Supabase** (3개):
```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**AI** (1개):
```env
GEMINI_API_KEY=AIzaSy...
```

**App** (2개):
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**선택 (데이터베이스 직접 접근 시)**:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres
```

#### 환경 선택

각 변수마다 환경을 선택:
- ✅ **Production**: 프로덕션 배포
- ✅ **Preview**: PR 미리보기
- ⬜ **Development**: 로컬 개발 (선택)

### Step 3: 배포

**Deploy** 버튼 클릭 → 2-3분 대기

---

## 📋 배포 전 체크리스트

### 코드 준비
- [ ] 빌드 테스트 통과 (`npm run build`)
- [ ] TypeScript 컴파일 성공
- [ ] 린트 체크 통과 (`npm run lint`)
- [ ] 환경 변수 검증 (`npm run check-env`)

### 데이터베이스
- [ ] Supabase 마이그레이션 적용 완료
- [ ] 테이블 생성 확인 (001 ~ 010)
- [ ] Seed 데이터 삽입 확인
- [ ] RLS 정책 활성화 확인

### 환경 변수
- [ ] Supabase URL 복사
- [ ] Supabase Anon Key 복사
- [ ] Supabase Service Role Key 복사 (⚠️ 보안 중요)
- [ ] Gemini API Key 발급
- [ ] Vercel에 모든 변수 설정 완료

### 보안
- [ ] `.env.local` 파일이 `.gitignore`에 포함
- [ ] Service Role Key는 프로덕션 환경에만 설정
- [ ] API 키가 코드에 하드코딩되지 않음

---

## ✅ 배포 후 확인 사항

### Step 1: 기본 기능 테스트

**접속 테스트**:
```
https://your-app.vercel.app
```

**테스트 항목**:
- [ ] 메인 페이지 로딩
- [ ] 회원가입 기능
- [ ] 로그인 기능
- [ ] 대시보드 접속
- [ ] 레슨 조회
- [ ] 퀴즈 풀기
- [ ] 포인트 적립
- [ ] 리더보드 확인

### Step 2: Admin 기능 테스트

**Admin 사용자 생성**:
```sql
-- Supabase SQL Editor
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

**테스트 항목**:
- [ ] Admin 메뉴 표시
- [ ] 레슨 편집
- [ ] AI 퀴즈 생성 (10초 내 완료)
- [ ] 퀴즈 활성화

### Step 3: 에러 로그 확인

**Vercel Function Logs**:
```
Vercel Dashboard → Deployments → 최신 배포 → Functions
```

**확인 사항**:
- [ ] 빌드 에러 없음
- [ ] Runtime 에러 없음
- [ ] API 호출 성공
- [ ] Supabase 연결 성공

**브라우저 콘솔 (F12)**:
- [ ] JavaScript 에러 없음
- [ ] 네트워크 요청 성공 (200 상태)

### Step 4: 성능 확인

**Vercel Analytics**:
```
Vercel Dashboard → Analytics
```

**목표 성능**:
- [ ] First Contentful Paint < 1.5초
- [ ] Largest Contentful Paint < 2.5초
- [ ] Time to Interactive < 3.5초

---

## 🔒 보안 설정

### 환경 변수 보안

**절대 공개 금지**:
- `SUPABASE_SERVICE_ROLE_KEY` (RLS 우회 가능)
- `GEMINI_API_KEY` (비용 발생)
- `DATABASE_URL` (직접 DB 접근)

**공개 가능**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (RLS 적용됨)
- `NEXT_PUBLIC_APP_URL`

### Supabase RLS 정책

**확인**:
```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

**최소 15개 정책 필요** (모든 테이블)

### API Route 보안

**인증 체크 예시**:
```typescript
// src/app/api/admin/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Admin 작업...
}
```

---

## 🌍 커스텀 도메인 (선택)

### Step 1: 도메인 추가

**Vercel Dashboard**:
```
Settings → Domains → Add Domain
```

### Step 2: DNS 설정

DNS 제공업체에서 다음 레코드 추가:

**A Record**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: 환경 변수 업데이트

```env
NEXT_PUBLIC_APP_URL=https://your-custom-domain.com
```

### Step 4: Supabase Redirect URL 업데이트

Supabase에 커스텀 도메인 추가:
```
https://your-custom-domain.com
https://your-custom-domain.com/auth/callback
```

---

## 📊 모니터링

### Vercel Analytics

**자동 활성화** - 추가 설정 불필요

**확인 항목**:
- 페이지 뷰
- 평균 응답 시간
- 에러율

### Supabase 로그

**Supabase Dashboard → Logs**:
- Auth 로그 (로그인/회원가입)
- Database 로그 (쿼리 성능)
- API 로그 (RPC 호출)

### AI API 사용량

**Google AI Studio**:
```
https://ai.google.dev
→ 사용량 확인
→ 무료 할당량: 60 req/min
```

---

## 💰 비용 예상

### 무료 티어 (소규모 프로젝트)

**Vercel**:
- 호비 프로젝트 무료
- 대역폭: 100GB/월
- 빌드 시간: 100시간/월

**Supabase**:
- 데이터베이스: 500MB
- 대역폭: 2GB
- Auth: 무제한

**Google Gemini**:
- Flash 1.5: 무료 (60 req/min)
- Pro 1.5: $0.00015/1K characters

**예상 월 비용 (100명 사용자)**:
- Vercel: $0
- Supabase: $0-25
- Gemini: $5-20
- **총합: ~$5-45/월**

---

## 🔄 업데이트 배포

### 코드 변경 후 자동 배포

```bash
git add .
git commit -m "feat: New feature"
git push origin main
```

→ Vercel이 자동으로 재배포 (1-3분)

### 수동 재배포

```bash
vercel deploy --prod
```

### 환경 변수 변경 후

**Vercel Dashboard**:
```
Settings → Environment Variables → Edit → Save
→ Deployments → 최신 배포 → Redeploy
```

⚠️ 환경 변수 변경 시 반드시 재배포 필요!

---

## 🐛 문제 해결

### 빌드 실패

**로컬에서 테스트**:
```bash
rm -rf .next
npm run build
```

**에러 확인**:
- TypeScript 컴파일 에러
- ESLint 에러
- 환경 변수 누락

### 데이터베이스 연결 오류

**확인 사항**:
- [ ] Supabase 프로젝트 활성 상태
- [ ] `DATABASE_URL` 형식 정확
- [ ] Supabase 대시보드에서 연결 테스트

**Supabase SQL Editor에서 테스트**:
```sql
SELECT * FROM profiles LIMIT 1;
```

### 인증 오류 ("Unauthorized")

**원인**:
1. Supabase Redirect URLs 미설정
2. Site URL 불일치
3. API Key 오류

**해결**:
```
Supabase → Authentication → URL Configuration
→ Vercel 도메인 추가
→ Save
```

### AI 퀴즈 생성 실패

**확인 사항**:
- [ ] `GEMINI_API_KEY` 설정됨
- [ ] API 키 유효 (Google AI Studio 확인)
- [ ] 레슨에 콘텐츠 존재
- [ ] Function 로그에서 에러 확인

**Vercel Function Logs**:
```
Vercel → Deployments → Functions → 실시간 로그
```

---

## 📚 추가 문서

- [QUICK_START.md](./QUICK_START.md) - 로컬 개발 환경 설정
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 개발 워크플로우
- [TESTING.md](./TESTING.md) - 테스트 가이드
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 상세 문제 해결

---

## 🆘 지원

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Google AI Studio**: [ai.google.dev/support](https://ai.google.dev/support)
- **GitHub Issues**: [github.com/garimto81/ojt-platform/issues](https://github.com/garimto81/ojt-platform/issues)

---

**배포 준비 완료! 프로덕션으로 이동하세요! 🚀**

**버전**: 1.0.0 | **최종 업데이트**: 2025-01-17
