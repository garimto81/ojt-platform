# Vercel 배포 환경 설정 가이드

이 가이드는 로컬 환경(localhost:3000)에서 Vercel 프로덕션 환경으로 배포할 때 필요한 환경 변수 설정 방법을 안내합니다.

---

## 📋 목차

1. [환경 변수 개요](#환경-변수-개요)
2. [Vercel에서 환경 변수 설정하기](#vercel에서-환경-변수-설정하기)
3. [필수 환경 변수 목록](#필수-환경-변수-목록)
4. [단계별 설정 방법](#단계별-설정-방법)
5. [배포 후 확인 사항](#배포-후-확인-사항)

---

## 🔑 환경 변수 개요

### 환경 변수란?

환경 변수는 코드에 하드코딩하지 않고 외부에서 설정하는 값들입니다. 이를 통해:
- 로컬/개발/프로덕션 환경을 분리할 수 있습니다
- 민감한 정보(API 키, 비밀번호)를 안전하게 관리할 수 있습니다
- 코드 수정 없이 설정을 변경할 수 있습니다

### 이 프로젝트의 환경 변수 사용 현황

✅ **현재 코드는 이미 환경 변수를 잘 사용하고 있습니다!**

```typescript
// ✅ 올바른 사용 (이미 적용됨)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// ❌ 잘못된 사용 (없음)
const supabaseUrl = 'https://xxxxx.supabase.co'
```

**필요한 작업:** Vercel 대시보드에서 환경 변수만 설정하면 됩니다!

---

## 🚀 Vercel에서 환경 변수 설정하기

### 방법 1: Vercel 대시보드 사용 (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com 로그인
   - 프로젝트 선택 (`ojt-platform`)

2. **Settings 메뉴로 이동**
   - 프로젝트 페이지에서 상단의 "Settings" 클릭

3. **Environment Variables 섹션**
   - 왼쪽 메뉴에서 "Environment Variables" 클릭

4. **환경 변수 추가**
   - "Add" 버튼 클릭
   - Name(이름)과 Value(값) 입력
   - 환경 선택 (Production, Preview, Development)
   - "Save" 클릭

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치 (한 번만)
npm i -g vercel

# 로그인
vercel login

# 환경 변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... 나머지 변수들도 추가
```

---

## 📝 필수 환경 변수 목록

### 1. Supabase 설정 (필수)

#### `NEXT_PUBLIC_SUPABASE_URL`
- **설명:** Supabase 프로젝트 URL
- **어디서 찾나요?**
  1. https://supabase.com 로그인
  2. 프로젝트 선택
  3. Settings → API
  4. "Project URL" 복사
- **예시:** `https://xxxxxxxxxxxxx.supabase.co`
- **환경:** Production, Preview, Development

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **설명:** Supabase 익명 키 (공개 가능)
- **어디서 찾나요?**
  1. Supabase 프로젝트 → Settings → API
  2. "Project API keys" → "anon public" 복사
- **예시:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **환경:** Production, Preview, Development

#### `SUPABASE_SERVICE_ROLE_KEY`
- **설명:** Supabase 서비스 역할 키 (절대 공개 금지!)
- **어디서 찾나요?**
  1. Supabase 프로젝트 → Settings → API
  2. "Project API keys" → "service_role" 복사
- **예시:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **환경:** Production만 (보안 중요!)

---

### 2. Google Gemini API (필수)

#### `GEMINI_API_KEY`
- **설명:** AI 퀴즈 생성을 위한 Google Gemini API 키
- **어디서 찾나요?**
  1. https://makersuite.google.com/app/apikey 접속
  2. "Create API Key" 클릭
  3. 생성된 키 복사
- **예시:** `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX`
- **환경:** Production, Preview

---

### 3. 앱 URL 설정 (필수)

#### `NEXT_PUBLIC_APP_URL`
- **설명:** 애플리케이션의 공개 URL
- **로컬:** `http://localhost:3000`
- **프로덕션:** `https://your-app.vercel.app` 또는 커스텀 도메인
- **예시:**
  - Production: `https://ojt-platform.vercel.app`
  - Preview: `https://ojt-platform-git-main-yourname.vercel.app`
  - Development: `http://localhost:3000`
- **환경:** 환경별로 다르게 설정

---

### 4. 선택적 환경 변수

#### `DATABASE_URL` (선택)
- **설명:** Prisma를 사용하는 경우 PostgreSQL 연결 URL
- **예시:** `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres`
- **환경:** Production, Preview

#### `REDIS_URL` (선택)
- **설명:** Redis 캐싱 사용 시
- **예시:** `redis://default:[PASSWORD]@redis.upstash.io:6379`
- **환경:** Production

#### AWS S3 설정 (선택)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (예: `ap-northeast-2`)
- `AWS_S3_BUCKET` (예: `ggp-platform-uploads`)

---

## 🛠 단계별 설정 방법

### Step 1: Supabase URL 확인 및 업데이트

1. Supabase 대시보드에서 프로덕션 URL 복사
2. Vercel 환경 변수에 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   ```

### Step 2: Supabase 리디렉션 URL 설정

⚠️ **중요:** Vercel에서 배포한 후 Supabase에 리디렉션 URL을 추가해야 합니다!

1. Vercel에서 배포 완료 후 도메인 확인
   - 예: `https://ojt-platform.vercel.app`

2. Supabase 대시보드로 이동
   - Authentication → URL Configuration

3. Redirect URLs에 추가:
   ```
   https://ojt-platform.vercel.app
   https://ojt-platform.vercel.app/auth/callback
   https://ojt-platform.vercel.app/**
   ```

4. Site URL 업데이트:
   ```
   https://ojt-platform.vercel.app
   ```

### Step 3: 환경 변수 추가 (Vercel)

Vercel 대시보드에서 다음 변수들을 추가:

```bash
# Production 환경
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_APP_URL=https://ojt-platform.vercel.app
```

### Step 4: 재배포

환경 변수를 추가/수정한 후:
1. Vercel 대시보드에서 "Redeploy" 버튼 클릭
2. 또는 새로운 커밋을 푸시하면 자동 배포됨

---

## ✅ 배포 후 확인 사항

### 1. 환경 변수 확인

브라우저 개발자 도구에서 확인 (F12):
```javascript
// Console에서 실행
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
// ✅ URL이 출력되어야 함
// ❌ undefined이면 환경 변수가 설정되지 않은 것
```

### 2. API 연결 테스트

다음 URL들이 정상 작동하는지 확인:
- `https://your-app.vercel.app/api/stats/public` → 통계 데이터 반환
- `https://your-app.vercel.app/dashboard` → 로그인 페이지 또는 대시보드

### 3. Supabase 연결 확인

1. 회원가입/로그인 테스트
2. 데이터 조회 테스트 (대시보드 접속)
3. Supabase 대시보드에서 활동 로그 확인

### 4. 에러 로그 확인

Vercel 대시보드:
1. 프로젝트 선택
2. "Deployments" → 최신 배포 클릭
3. "Runtime Logs" 확인

---

## 🔧 문제 해결

### "Cannot read properties of undefined"

**원인:** 환경 변수가 설정되지 않았습니다.

**해결:**
1. Vercel 대시보드 → Settings → Environment Variables 확인
2. 변수 이름이 정확한지 확인 (대소문자 구분!)
3. 환경 선택이 올바른지 확인 (Production/Preview)
4. 재배포 필요

### "Failed to fetch" / Network Error

**원인:** Supabase URL이 잘못되었거나 CORS 설정 문제

**해결:**
1. `NEXT_PUBLIC_SUPABASE_URL`이 올바른지 확인
2. Supabase의 Redirect URLs에 Vercel 도메인 추가
3. Supabase의 Site URL 업데이트

### "Unauthorized" / 인증 오류

**원인:** Supabase 리디렉션 URL 미설정

**해결:**
1. Supabase → Authentication → URL Configuration
2. Redirect URLs에 Vercel 도메인 추가
3. Site URL을 Vercel 도메인으로 변경

---

## 📊 환경별 설정 요약

| 환경 변수 | Production | Preview | Development |
|---------|-----------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ 프로덕션 Supabase | ✅ 프로덕션 또는 테스트 | ✅ 로컬 Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ 프로덕션 키 | ✅ 프로덕션 또는 테스트 키 | ✅ 로컬 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ 프로덕션 키만 | ❌ | ❌ |
| `GEMINI_API_KEY` | ✅ 프로덕션 키 | ✅ 테스트 키 | ✅ 개발 키 |
| `NEXT_PUBLIC_APP_URL` | `https://xxx.vercel.app` | `https://xxx-git-*.vercel.app` | `http://localhost:3000` |

---

## 🎯 체크리스트

배포 전 확인사항:

- [ ] Supabase 프로젝트 URL 복사
- [ ] Supabase anon key 복사
- [ ] Supabase service role key 복사 (절대 공개 금지!)
- [ ] Gemini API 키 발급
- [ ] Vercel에 모든 환경 변수 추가
- [ ] Vercel 배포 도메인 확인
- [ ] Supabase Redirect URLs에 Vercel 도메인 추가
- [ ] Supabase Site URL 업데이트
- [ ] 재배포 실행
- [ ] 배포 로그 확인
- [ ] 프로덕션 URL 접속 테스트
- [ ] 로그인/회원가입 테스트
- [ ] API 엔드포인트 테스트

---

## 🔐 보안 주의사항

### ⚠️ 절대 공개하면 안 되는 값들

- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `AWS_SECRET_ACCESS_KEY`
- `DATABASE_URL` (비밀번호 포함)

### ✅ 공개해도 되는 값들

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon 키는 공개 가능)
- `NEXT_PUBLIC_APP_URL`

### 💡 팁

- `NEXT_PUBLIC_` 접두사가 붙은 변수는 브라우저에서 접근 가능
- `NEXT_PUBLIC_` 없는 변수는 서버에서만 접근 가능
- 민감한 정보는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 마세요!

---

## 📞 추가 도움말

- [Vercel 환경 변수 공식 문서](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js 환경 변수 가이드](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase 인증 설정](https://supabase.com/docs/guides/auth/redirect-urls)

---

**최종 업데이트:** 2025-11-10
**작성자:** Claude
**버전:** 1.0
