# 🚀 빠른 배포 가이드 (Supabase & Vercel CLI)

이 가이드는 Supabase CLI와 Vercel CLI를 사용하여 빠르게 환경을 설정하고 배포하는 방법을 안내합니다.

---

## 📋 준비사항

- ✅ Supabase 계정 및 프로젝트
- ✅ Vercel 계정
- ✅ Google Gemini API 키 (선택사항)

---

## 🎯 3단계로 배포하기

### Step 1: Supabase 환경 변수 자동 생성 ⚡

터미널에서 실행:

```bash
npm run setup:supabase
```

**안내에 따라 입력:**

1. Supabase Project Reference ID
   - 위치: Supabase → Project Settings → General → Reference ID
   - 예: `abcdefghijklmnop`

2. Anon (public) Key
   - 위치: Supabase → Project Settings → API
   - 복사: "anon public" 키

3. Service Role Key
   - 위치: Supabase → Project Settings → API
   - 복사: "service_role" 키 (절대 공개 금지!)

4. Gemini API Key (선택)
   - https://makersuite.google.com/app/apikey

5. 앱 URL (선택)
   - 기본값: `http://localhost:3000`

**결과:**
- ✅ `.env.local` 파일 자동 생성
- ✅ 모든 필수 환경 변수 설정 완료

---

### Step 2: Vercel 환경 변수 자동 설정 ⚡

먼저 Vercel에 로그인:

```bash
vercel login
```

그 다음 환경 변수 설정:

```bash
npm run setup:vercel
```

**안내에 따라 입력:**

1. Supabase Project URL
   - Step 1에서 확인한 URL 입력
   - 예: `https://abcdefghijklmnop.supabase.co`

2. Supabase Anon Key
   - Step 1에서 사용한 키 입력

3. Supabase Service Role Key
   - Step 1에서 사용한 키 입력

4. Gemini API Key
   - Step 1에서 사용한 키 입력

5. Vercel 배포 URL
   - Vercel 프로젝트의 도메인
   - 예: `https://ojt-platform.vercel.app`
   - 또는 커스텀 도메인

**결과:**
- ✅ Vercel Production 환경 변수 설정 완료
- ✅ Vercel Preview 환경 변수 설정 완료
- ✅ 즉시 재배포 가능

---

### Step 3: Supabase 리디렉션 URL 설정 🔗

1. **Supabase 대시보드 접속**
   ```
   https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/auth/url-configuration
   ```

2. **Site URL 설정**
   ```
   https://ojt-platform.vercel.app
   ```

3. **Redirect URLs 추가**
   ```
   https://ojt-platform.vercel.app
   https://ojt-platform.vercel.app/auth/callback
   https://ojt-platform.vercel.app/**
   ```

4. **저장 (Save)** 버튼 클릭

---

## ✅ 배포 확인

### 로컬에서 테스트

```bash
# 환경 변수 확인
npm run check-env

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### Vercel 배포

자동 배포 (Git push):
```bash
git add .
git commit -m "feat: 환경 변수 설정 완료"
git push origin main
```

또는 Vercel CLI로 수동 배포:
```bash
vercel deploy --prod
```

---

## 🔍 문제 해결

### "Vercel CLI not found"

```bash
npm install -g vercel
```

### "Unauthorized" 에러 (Vercel)

```bash
vercel logout
vercel login
```

### "Failed to fetch" (Supabase)

1. Supabase URL이 올바른지 확인
2. Redirect URLs 설정 확인
3. API 키가 올바른지 확인

### 환경 변수 누락

```bash
# 환경 변수 확인
npm run check-env

# Supabase 설정 다시 실행
npm run setup:supabase

# Vercel 설정 다시 실행
npm run setup:vercel
```

---

## 📝 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `npm run setup:supabase` | Supabase 환경 변수 자동 생성 (.env.local) |
| `npm run setup:vercel` | Vercel 환경 변수 자동 설정 |
| `npm run check-env` | 환경 변수 설정 확인 |
| `vercel login` | Vercel 로그인 |
| `vercel env ls` | Vercel 환경 변수 목록 확인 |
| `vercel deploy --prod` | 프로덕션 배포 |

---

## 🎯 체크리스트

### 로컬 개발 환경

- [ ] `npm run setup:supabase` 실행
- [ ] `.env.local` 파일 생성 확인
- [ ] `npm run check-env` 통과
- [ ] `npm run dev` 실행 확인
- [ ] http://localhost:3000 접속 테스트

### Vercel 배포

- [ ] `vercel login` 로그인
- [ ] `npm run setup:vercel` 실행
- [ ] Vercel 환경 변수 설정 확인
- [ ] Supabase Redirect URLs 추가
- [ ] Git push 또는 `vercel deploy --prod`
- [ ] 배포 URL 접속 테스트
- [ ] 로그인/회원가입 테스트

---

## 💡 추가 팁

### 환경 변수 확인 (Vercel)

```bash
# 설정된 환경 변수 목록 보기
vercel env ls

# 특정 환경 변수 확인
vercel env pull .env.vercel
```

### 환경 변수 수정 (Vercel)

```bash
# 환경 변수 제거
vercel env rm VARIABLE_NAME production

# 환경 변수 추가
vercel env add VARIABLE_NAME production
```

### 로컬 .env 파일 백업

```bash
# 백업 생성
cp .env.local .env.local.backup

# 복원
cp .env.local.backup .env.local
```

---

## 🔐 보안 주의사항

### ⚠️ 절대 공개하면 안 되는 것들

- `SUPABASE_SERVICE_ROLE_KEY` - 절대 Git에 커밋 금지!
- `GEMINI_API_KEY` - 절대 공개 금지!
- `.env.local` 파일 - Git ignore 필수!

### ✅ .gitignore 확인

```.gitignore
.env
.env.local
.env*.local
.vercel
```

---

## 📚 추가 문서

- **상세 배포 가이드**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- **배포 문제 해결**: [DEPLOYMENT_ISSUES.md](./DEPLOYMENT_ISSUES.md)
- **Supabase 설정**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

---

## 🆘 도움이 필요하신가요?

1. **환경 변수 문제**
   - [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)의 문제 해결 섹션 참고

2. **Supabase 인증 문제**
   - Redirect URLs 설정 확인
   - API 키 재확인

3. **Vercel 배포 실패**
   - Vercel 대시보드 → Deployments → Runtime Logs 확인
   - [DEPLOYMENT_ISSUES.md](./DEPLOYMENT_ISSUES.md) 참고

---

**작성일**: 2025-11-10
**버전**: 1.0
**업데이트**: CLI 자동화 스크립트 추가
