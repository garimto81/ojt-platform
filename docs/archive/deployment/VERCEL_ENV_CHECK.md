# ⚠️ Vercel 환경 변수 확인 필수!

## 문제 상황
- "Invalid API key" 에러 지속 발생
- 디버깅 로그가 브라우저 콘솔에 보이지 않음 (정상 - 서버 로그임)

## ✅ 해결 방법: Vercel 환경 변수 직접 확인

### Step 1: Vercel Dashboard 접속
```
https://vercel.com/dashboard
→ ojt-platform 프로젝트 클릭
→ Settings
→ Environment Variables
```

### Step 2: 현재 설정된 값 확인

다음 변수들이 **정확히** 설정되어 있어야 합니다:

#### ✅ NEXT_PUBLIC_SUPABASE_URL
```
이름: NEXT_PUBLIC_SUPABASE_URL
값: https://cbvansmxutnogntbyswi.supabase.co
환경: Production, Preview, Development 모두 체크
```

#### ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
```
이름: NEXT_PUBLIC_SUPABASE_ANON_KEY
값: eyJhbGci... (매우 긴 JWT 토큰, 200-300자)
환경: Production, Preview, Development 모두 체크

⚠️ 주의: 반드시 "anon public" key여야 함!
❌ service_role key 사용 금지!
```

### Step 3: Supabase에서 올바른 Key 가져오기

```
1. https://supabase.com/dashboard 접속
2. cbvansmxutnogntbyswi 프로젝트 선택
3. Settings → API
4. 다음 복사:

   Project URL:
   https://cbvansmxutnogntbyswi.supabase.co

   anon public key (⚠️ 이것!):
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...

   ❌ service_role key는 사용하면 안됨!
```

### Step 4: Vercel에 올바른 값 설정

#### A. 잘못된 값 삭제
```
Vercel → Settings → Environment Variables
→ NEXT_PUBLIC_SUPABASE_ANON_KEY 찾기
→ ... (점 3개) → Remove
→ 확인
```

#### B. 새 값 추가
```
→ Add New
→ Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
→ Value: [Supabase에서 복사한 anon public key 붙여넣기]
→ Environments: Production ✅ Preview ✅ Development ✅
→ Save
```

#### C. URL도 확인
```
→ NEXT_PUBLIC_SUPABASE_URL 찾기
→ Edit
→ Value: https://cbvansmxutnogntbyswi.supabase.co
→ Environments: 모두 체크
→ Save
```

### Step 5: 재배포 (필수!)

환경 변수 변경 후 반드시 재배포:

```
Vercel → Deployments
→ 최신 배포의 ... (점 3개)
→ Redeploy
→ 확인
```

---

## 🔍 Vercel 서버 로그 확인 방법

디버깅 로그는 브라우저가 아닌 **Vercel 서버 로그**에 나타납니다:

```
1. Vercel Dashboard → 프로젝트 선택
2. 최신 배포 클릭
3. "Functions" 탭 클릭
4. 로그 실시간 확인

또는:

1. 배포 후 앱 접속
2. Deployments → 최신 배포 → "View Function Logs"
3. 로그에서 다음 찾기:

   🔍 Middleware - Supabase Config Check:
     NEXT_PUBLIC_SUPABASE_URL: ✅ https://...
     NEXT_PUBLIC_SUPABASE_ANON_KEY: ✅ eyJhbGci...

   또는:

   ❌ Invalid Supabase Anon Key format
```

---

## 📋 체크리스트

- [ ] Supabase Dashboard에서 anon public key 확인 및 복사
- [ ] Vercel 환경 변수 확인
- [ ] NEXT_PUBLIC_SUPABASE_URL이 정확한지 확인
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY가 anon key인지 확인 (service_role 아님!)
- [ ] Key가 "eyJ"로 시작하는지 확인
- [ ] 환경이 Production, Preview, Development 모두 체크되었는지 확인
- [ ] Vercel에서 재배포 실행
- [ ] 배포 완료 후 테스트

---

## 🎯 가장 흔한 실수

### ❌ 1. service_role key 사용
```
# 틀림
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...service_role...

# 맞음
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon...
```

### ❌ 2. 다른 프로젝트의 key
```
# cbvansmxutnogntbyswi 프로젝트의 key여야 함
# 다른 Supabase 프로젝트 key 사용 시 Invalid API key
```

### ❌ 3. Key에 공백 포함
```
# 틀림
NEXT_PUBLIC_SUPABASE_ANON_KEY= eyJhbGci...

# 맞음
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### ❌ 4. 재배포 안 함
```
환경 변수 변경 후 반드시 재배포 필요!
```

---

## 💡 빠른 확인

Vercel CLI가 설치되어 있다면:

```bash
vercel env ls
```

출력 예시:
```
Production Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- GEMINI_API_KEY
```

특정 값 확인:
```bash
vercel env pull .env.production
cat .env.production
```
