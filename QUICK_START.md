# 🚀 Quick Start Guide

**20분 안에 GG Production 플랫폼을 실행하세요!**

이 가이드는 개발 환경을 빠르게 설정하고 플랫폼을 실행하는 최소한의 단계만 안내합니다.

---

## 📋 사전 준비 (2분)

### 필수 요구사항
- ✅ **Node.js 18+** 설치
- ✅ **Supabase 계정** ([가입하기](https://supabase.com))
- ✅ **Google Gemini API 키** (선택, [발급하기](https://ai.google.dev/))

### 프로젝트 클론
```bash
git clone https://github.com/garimto81/ojt-platform.git
cd ojt-platform
npm install
```

---

## ⚡ 방법 1: 자동 설정 (권장, 5분)

CLI 자동화 스크립트로 환경 변수를 빠르게 설정합니다.

### Step 1: Supabase 환경 변수 자동 생성

```bash
npm run setup:supabase
```

**프롬프트에 따라 입력:**

1. **Supabase Project Reference ID**
   - Supabase Dashboard → Project Settings → General → Reference ID
   - 예: `abcdefghijklmnop`

2. **Anon (public) Key**
   - Supabase Dashboard → Project Settings → API
   - "anon public" 키 복사

3. **Service Role Key**
   - Supabase Dashboard → Project Settings → API
   - "service_role" 키 복사 (⚠️ 절대 공개 금지)

4. **Gemini API Key** (선택)
   - AI 퀴즈 생성 기능 사용 시 필요
   - [Google AI Studio](https://ai.google.dev/)에서 발급

5. **App URL** (선택)
   - 기본값: `http://localhost:3000`

**결과**: `.env.local` 파일이 자동 생성됩니다.

### Step 2: 데이터베이스 마이그레이션 적용

Supabase Dashboard → **SQL Editor**에서 순서대로 실행:

1. `supabase/migrations/001_initial_schema.sql` 복사 → 붙여넣기 → **RUN**
2. `supabase/migrations/002_seed_data.sql` 복사 → 붙여넣기 → **RUN**
3. `supabase/migrations/003_sample_lesson_content.sql` 복사 → 붙여넣기 → **RUN**
4. `supabase/migrations/004_ai_features.sql` ~ `010_ai_confidence_score.sql` 순서대로 실행

### Step 3: 인증 설정

**Supabase Dashboard → Authentication → URL Configuration:**

- **Site URL**: `http://localhost:3000`
- **Redirect URLs** 추가:
  ```
  http://localhost:3000
  http://localhost:3000/auth/callback
  http://localhost:3000/**
  ```

**Email Provider 설정 (개발 단계):**
- Authentication → Providers → Email
- **Confirm email**: OFF (개발 단계에서는 인증 생략)

### Step 4: 실행

```bash
npm run dev
```

브라우저에서 **http://localhost:3000** 접속! 🎉

---

## 🔧 방법 2: 수동 설정 (10분)

자동화 스크립트 없이 직접 설정하는 방법입니다.

### Step 1: 환경 변수 파일 생성

```bash
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Database
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:6543/postgres

# AI (선택)
GEMINI_API_KEY=AIzaSy...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Supabase 정보 찾기:**
- Dashboard → Settings → API
- Project URL, anon key, service_role key 복사

### Step 2: 데이터베이스 설정

방법 1과 동일 (마이그레이션 SQL 실행)

### Step 3: 인증 설정

방법 1과 동일 (Site URL, Redirect URLs 설정)

### Step 4: 실행

```bash
npm run dev
```

---

## 👤 Admin 사용자 생성 (3분)

### Step 1: 회원가입

1. http://localhost:3000 접속
2. **Sign Up** 클릭
3. 이메일/비밀번호 입력
4. 계정 생성

### Step 2: Admin 권한 부여

Supabase Dashboard → **SQL Editor**:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

**RUN** 클릭 → 로그아웃 → 다시 로그인

이제 좌측 사이드바에 **ADMIN** 섹션이 표시됩니다!

---

## ✅ 기능 테스트 (5분)

### 학습자 기능 테스트

1. **Dashboard** - 포인트, 진행률 확인
2. **Learning** - Day 1 클릭
3. **Poker Basics** 레슨 열기
4. 콘텐츠 읽기
5. **퀴즈 풀기** 버튼 클릭
6. 정답 선택 → 포인트 획득 확인

### Admin 기능 테스트

1. 좌측 메뉴 **ADMIN** → **Lesson Content**
2. 레슨 선택 → **편집** 클릭
3. 내용 수정 → **저장**
4. **ADMIN** → **AI Quiz Generator**
5. 레슨 선택 → **AI 퀴즈 생성하기**
6. 약 10초 후 퀴즈 생성 완료 확인

---

## 🔐 선택사항: Google OAuth 설정

Google 로그인 기능을 추가하려면:

### 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 → OAuth 동의 화면 구성
3. **OAuth 클라이언트 ID** 생성 (웹 애플리케이션)
4. **승인된 리디렉션 URI** 추가:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
5. 클라이언트 ID & Secret 복사

### 2. Supabase Google Provider 활성화

1. Supabase Dashboard → Authentication → Providers
2. **Google** 클릭 → **Enable Sign in with Google**: ON
3. Google 클라이언트 ID & Secret 입력 → **Save**

이제 로그인 페이지에 "Google로 로그인" 버튼이 표시됩니다!

---

## 🆘 문제 해결

### 데이터베이스 연결 오류
```
Error: could not connect to database
```
**해결**: `.env.local`의 `DATABASE_URL` 확인, Supabase 비밀번호 재확인

### Gemini API 오류
```
Error: Gemini API key invalid
```
**해결**:
1. [Google AI Studio](https://ai.google.dev/)에서 API 키 재확인
2. `.env.local`의 `GEMINI_API_KEY` 확인
3. 서버 재시작 (`npm run dev`)

### 환경 변수 누락
```
Error: Missing environment variables
```
**해결**:
```bash
npm run check-env  # 환경 변수 검증
```

### Admin 메뉴 안 보임
**해결**:
1. Supabase SQL Editor에서 role 확인:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
   ```
2. role이 'admin'이 아니면 UPDATE
3. 로그아웃 → 재로그인
4. 브라우저 캐시 삭제

### 퀴즈 생성 안 됨
```
Error: Lesson has no content
```
**해결**: Admin → Lesson Content에서 레슨에 콘텐츠 먼저 추가

---

## 🚀 다음 단계

### 개발 워크플로우 이해하기
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 개발 가이드, 마이그레이션, PR 생성

### 배포하기
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel 배포 (10분)

### 테스트하기
- [TESTING.md](./TESTING.md) - Jest, Playwright E2E 테스트

### 문제 해결
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 일반적인 문제 해결

---

## 📚 데이터베이스 구조 (참고)

### 핵심 테이블

```
profiles              # 사용자 계정
├── curriculum_days   # 7일 커리큘럼
│   └── lessons       # 레슨 콘텐츠
│       ├── user_progress      # 진행률
│       └── quizzes           # 퀴즈
│           └── quiz_attempts # 시도 기록
```

### 자동화 기능

- ✅ 회원가입 시 자동 프로필 생성 (트리거)
- ✅ 퀴즈 정답 시 자동 포인트 적립 (트리거)
- ✅ AI 퀴즈 자동 생성 (Gemini API)
- ✅ Row Level Security (RLS) 정책 적용

---

## 📖 추가 문서

- [README.md](./README.md) - 프로젝트 개요
- [CHANGELOG.md](./CHANGELOG.md) - 버전 이력
- [CLAUDE.md](./CLAUDE.md) - Claude Code 개발 가이드
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 기여 가이드

---

**설정 완료! Happy Learning! 🎓**

**버전**: 1.0.0 | **최종 업데이트**: 2025-01-17
