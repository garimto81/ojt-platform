# 🔧 Google OAuth 로그인 수정 가이드

**문제**: Google OAuth로 로그인 시 프로필이 생성되지 않아 사용자 설정이 안되는 문제
**해결**: 데이터베이스 함수 개선 + auth/callback 라우트 강화

---

## 🎯 수정 내용

### 1. 데이터베이스 마이그레이션 (011_fix_google_oauth_profile.sql)

**변경 사항**:
- `create_profile_for_new_user()` 함수 개선
  - Google OAuth 메타데이터 처리 (`name`, `full_name`, `avatar_url`)
  - `role` 기본값 설정 (`trainee`)
  - `ON CONFLICT` 로직 추가 (중복 방지)

**주요 개선**:
```sql
-- 이전: full_name만 처리
COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))

-- 현재: 여러 필드 처리
COALESCE(
  NEW.raw_user_meta_data->>'full_name',  -- 이메일 가입
  NEW.raw_user_meta_data->>'name',        -- Google OAuth
  NEW.raw_user_meta_data->>'given_name',  -- Fallback
  split_part(NEW.email, '@', 1)           -- 최종 Fallback
)
```

### 2. Auth Callback 라우트 강화

**변경 파일**: `src/app/auth/callback/route.ts`

**추가 로직**:
1. 세션 교환 후 프로필 존재 여부 확인
2. 프로필이 없으면 강제로 생성
3. Google 메타데이터에서 이름, 아바타 추출

**Before**:
```typescript
const { error } = await supabase.auth.exchangeCodeForSession(code)
if (error) return NextResponse.redirect(`${origin}/login?error=${errorMessage}`)
```

**After**:
```typescript
const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)

// 프로필 확인 및 생성
if (authData?.user) {
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', authData.user.id).single()

  if (!profile) {
    // 프로필 강제 생성
    await supabase.from('profiles').insert({
      id: authData.user.id,
      email: authData.user.email!,
      full_name: authData.user.user_metadata?.name || ...,
      avatar_url: authData.user.user_metadata?.avatar_url,
      role: 'trainee',
    })
  }
}
```

---

## 📋 적용 순서

### Step 1: 마이그레이션 적용

**옵션 A: Supabase Dashboard (권장)**

1. https://supabase.com → 프로젝트 선택
2. **SQL Editor** 클릭
3. `supabase/migrations/011_fix_google_oauth_profile.sql` 내용 복사
4. **Run** 클릭

**옵션 B: Supabase CLI**

```bash
# 1. Supabase CLI 설치 확인
supabase --version

# 2. 프로젝트 연결 (한 번만)
supabase link --project-ref [YOUR-PROJECT-REF]

# 3. 마이그레이션 적용
supabase db push
```

**검증**:
```sql
-- SQL Editor에서 실행하여 함수 확인
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'create_profile_for_new_user';
```

---

### Step 2: 코드 배포

**로컬 테스트**:
```bash
# 1. 의존성 확인
npm install

# 2. 빌드 테스트
npm run build

# 3. 로컬 실행
npm run dev
```

**Vercel 배포**:
```bash
# 자동 배포 (main 브랜치 푸시)
git add .
git commit -m "fix: Google OAuth 프로필 생성 이슈 수정 (v0.5.1)"
git push origin main

# 또는 수동 배포
vercel --prod
```

---

## 🧪 테스트 방법

### 1. Google OAuth 신규 가입

**테스트 시나리오**:
1. https://ojt-platform.vercel.app/register 접속
2. "Google로 가입하기" 클릭
3. Google 계정 선택
4. 권한 승인
5. `/dashboard/simple`로 자동 리다이렉트 확인

**예상 결과**:
- ✅ 프로필 자동 생성됨
- ✅ `profiles` 테이블에 레코드 추가됨
  - `full_name`: Google 이름
  - `avatar_url`: Google 프로필 사진
  - `role`: `trainee`

**검증 쿼리**:
```sql
-- Supabase SQL Editor
SELECT id, email, full_name, avatar_url, role, created_at
FROM profiles
WHERE email = 'your-google-email@gmail.com';
```

---

### 2. Google OAuth 기존 사용자

**테스트 시나리오**:
1. 이전에 Google 로그인했지만 프로필이 없는 사용자
2. 다시 로그인
3. `auth/callback` 라우트가 프로필 생성

**검증**:
```sql
-- 프로필 없는 auth.users 찾기
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

**해결 방법**:
- 해당 사용자가 다시 로그인하면 자동으로 프로필 생성됨
- 또는 수동으로 프로필 생성:

```sql
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)), 'trainee'
FROM auth.users
WHERE id = '[USER_ID]';
```

---

### 3. 이메일 회원가입 (기존 기능 유지 확인)

**테스트 시나리오**:
1. https://ojt-platform.vercel.app/register 접속
2. 이메일/비밀번호 입력
3. 이름, 역할 선택
4. "계정 생성하기" 클릭
5. 이메일 확인 메시지 표시 확인

**예상 결과**:
- ✅ 기존 방식대로 작동
- ✅ `full_name`, `role` 올바르게 저장

---

## 🐛 문제 해결 (Troubleshooting)

### 문제 1: "Trigger already exists" 에러

**원인**: 트리거가 이미 존재

**해결**:
```sql
-- 기존 트리거 먼저 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_new_user() CASCADE;

-- 그 다음 마이그레이션 다시 실행
```

---

### 문제 2: Google 로그인 후 여전히 프로필 없음

**확인 사항**:

1. **마이그레이션 적용 확인**:
```sql
-- 함수가 업데이트되었는지 확인
SELECT prosrc FROM pg_proc WHERE proname = 'create_profile_for_new_user';
-- 'avatar_url'이 포함되어 있어야 함
```

2. **트리거 활성 상태 확인**:
```sql
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- tgenabled = 'O' (enabled)
```

3. **auth/callback 로그 확인**:
```bash
# Vercel 로그 확인
vercel logs --app ojt-platform
# 또는 브라우저 콘솔에서 'Creating profile for OAuth user' 메시지 확인
```

---

### 문제 3: Supabase CLI 연결 실패

**에러**: `Project ref is required`

**해결**:
```bash
# 1. 프로젝트 ref 찾기
# Supabase Dashboard → Settings → General → Reference ID

# 2. 연결
supabase link --project-ref [YOUR-REF-ID]

# 3. 로그인 (필요시)
supabase login
```

---

## 📊 기대 효과

### Before (수정 전)
- ❌ Google OAuth 로그인 성공 → 프로필 없음 → 대시보드 접근 불가
- ❌ 사용자가 수동으로 프로필 생성해야 함
- ❌ 이름, 아바타 정보 손실

### After (수정 후)
- ✅ Google OAuth 로그인 성공 → 프로필 자동 생성 → 대시보드 즉시 접근
- ✅ Google 이름, 아바타 자동 입력
- ✅ `role` 기본값 `trainee`로 설정
- ✅ 이메일 가입 방식도 정상 작동 (하위 호환성)

---

## 📝 변경된 파일

### 1. 데이터베이스
- `supabase/migrations/011_fix_google_oauth_profile.sql` (신규)

### 2. 코드
- `src/app/auth/callback/route.ts` (수정)

### 3. 문서
- `GOOGLE_OAUTH_FIX_GUIDE.md` (신규)

---

## ✅ 체크리스트

### 배포 전
- [ ] 마이그레이션 파일 확인
- [ ] auth/callback 코드 변경 확인
- [ ] 로컬 빌드 테스트 성공
- [ ] 마이그레이션 SQL 문법 검증

### 배포 중
- [ ] Supabase 마이그레이션 적용
- [ ] 함수 업데이트 확인
- [ ] 트리거 활성 상태 확인
- [ ] Vercel 배포 성공

### 배포 후
- [ ] Google OAuth 신규 가입 테스트
- [ ] 프로필 자동 생성 확인
- [ ] 이메일 가입 정상 작동 확인
- [ ] 기존 사용자 로그인 테스트

---

## 🚀 배포 일정

**권장 배포 시간**: 사용자가 적은 시간대 (예: 새벽 2-4시)

**예상 다운타임**: 0분 (무중단 배포)
- 마이그레이션: 즉시 적용 (기존 사용자 영향 없음)
- 코드 배포: Vercel 자동 배포 (~2분)

---

**작성 일시**: 2025-11-17
**작성자**: Claude Code (AI Assistant)
**버전**: v0.5.1
**관련 Issue**: Google OAuth 프로필 생성 이슈
