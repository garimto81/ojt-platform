# Supabase 인증 설정 가이드

## 🔐 1. Supabase 대시보드 설정

### 1-1. Authentication 활성화

1. [Supabase 대시보드](https://app.supabase.com) 접속
2. 프로젝트 선택: `cbvansmxutnogntbyswi`
3. 좌측 메뉴에서 **Authentication** 클릭

### 1-2. Email Provider 설정

**경로**: Authentication → Providers → Email

```yaml
설정 항목:
  ✅ Enable Email provider: ON
  ✅ Confirm email: OFF (개발 단계)
  ✅ Secure email change: ON
  ✅ Double confirm email change: OFF
```

**중요**: 개발 단계에서는 "Confirm email"을 OFF로 설정하여 이메일 인증 없이 바로 로그인 가능하게 합니다.

### 1-3. Site URL 설정

**경로**: Authentication → URL Configuration

```yaml
Site URL: http://localhost:3002
Additional Redirect URLs:
  - http://localhost:3000
  - http://localhost:3001
  - http://localhost:3002
  - http://localhost:3002/auth/callback
```

### 1-4. Email Templates 확인

**경로**: Authentication → Email Templates

기본 템플릿 확인:
- ✅ Confirm signup
- ✅ Invite user
- ✅ Magic Link
- ✅ Change Email Address
- ✅ Reset Password

## 🗄️ 2. Database 설정

### 2-1. Users 테이블 자동 생성 확인

Supabase는 `auth.users` 테이블을 자동으로 생성합니다.

**확인 방법**:
```sql
-- SQL Editor에서 실행
SELECT * FROM auth.users LIMIT 10;
```

### 2-2. Public Schema에 Users 테이블 생성 (옵션)

추가 사용자 정보를 저장하려면:

```sql
-- SQL Editor에서 실행
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'LEARNER',
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 데이터만 읽기 가능
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 정책 생성: 사용자는 자신의 데이터만 수정 가능
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Trigger: auth.users에 새 사용자 생성 시 public.users에도 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 🔧 3. 애플리케이션 설정

### 3-1. 환경 변수 확인

**파일**: `ggp-platform/.env.local`

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://cbvansmxutnogntbyswi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 애플리케이션 URL
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### 3-2. Middleware 설정 확인

**파일**: `ggp-platform/middleware.ts`

이미 올바르게 설정되어 있습니다:
```typescript
export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  await supabase.auth.getSession()
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## 🧪 4. 테스트

### 4-1. 회원가입 테스트

1. http://localhost:3002/register 접속
2. 이메일과 비밀번호 입력
3. "계정 생성하기" 클릭
4. 자동으로 로그인되고 대시보드로 이동

### 4-2. 로그인 테스트

1. http://localhost:3002/login 접속
2. 등록한 이메일과 비밀번호 입력
3. "로그인" 클릭
4. 대시보드로 이동

### 4-3. 에러 디버깅

**브라우저 콘솔에서 확인**:
```javascript
// F12 → Console
console.log(await supabase.auth.getSession())
console.log(await supabase.auth.getUser())
```

**일반적인 에러**:

| 에러 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| `Invalid login credentials` | 잘못된 이메일/비밀번호 | 회원가입 먼저 진행 |
| `Email not confirmed` | 이메일 인증 필요 | Authentication → Providers → Email → Confirm email OFF |
| `Invalid Refresh Token` | 세션 만료 | 다시 로그인 |
| `Cross-site cookie` 에러 | HTTPS 필요 또는 SameSite 설정 | 개발: localhost 사용, 프로덕션: HTTPS 필수 |

## 🚀 5. 빠른 시작 (Quick Fix)

현재 로그인이 안 되는 경우, 가장 빠른 해결 방법:

### 방법 1: Email Confirmation OFF

1. Supabase 대시보드 → Authentication → Providers → Email
2. **"Confirm email"을 OFF**로 변경
3. Save
4. 새로 회원가입 진행

### 방법 2: 기존 사용자 이메일 확인 처리

```sql
-- SQL Editor에서 실행
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';
```

### 방법 3: 테스트 계정 직접 생성

```sql
-- SQL Editor에서 실행
-- 비밀번호: test1234
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'test@ggproduction.com',
  crypt('test1234', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

## 📊 6. 현재 상태 확인

### 사용자 목록 확인
```sql
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

### 로그 확인
Supabase 대시보드 → Logs → Auth Logs

## 🔍 7. 추가 디버깅

### Supabase Client 연결 테스트

**파일**: `ggp-platform/src/lib/supabase/test.ts` (임시 생성)

```typescript
import { createClient } from '@/lib/supabase/client'

export async function testSupabaseConnection() {
  const supabase = createClient()

  console.log('Testing Supabase connection...')

  // 1. 세션 확인
  const { data: session, error: sessionError } = await supabase.auth.getSession()
  console.log('Session:', session, sessionError)

  // 2. 사용자 확인
  const { data: user, error: userError } = await supabase.auth.getUser()
  console.log('User:', user, userError)

  // 3. 회원가입 테스트
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'test@test.com',
    password: 'test1234',
  })
  console.log('SignUp:', signUpData, signUpError)

  // 4. 로그인 테스트
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'test@test.com',
    password: 'test1234',
  })
  console.log('SignIn:', signInData, signInError)
}
```

브라우저 콘솔에서 실행:
```javascript
import { testSupabaseConnection } from '@/lib/supabase/test'
await testSupabaseConnection()
```

## ✅ 체크리스트

- [ ] Supabase 프로젝트 URL 확인: `https://cbvansmxutnogntbyswi.supabase.co`
- [ ] ANON KEY 환경 변수 설정 확인
- [ ] Email Provider 활성화
- [ ] "Confirm email" OFF 설정
- [ ] Site URL에 localhost:3002 추가
- [ ] Redirect URLs 설정
- [ ] 테스트 계정으로 로그인 시도
- [ ] Auth Logs에서 에러 확인

## 📞 추가 도움

문제가 계속되면 다음 정보를 공유해주세요:
1. 브라우저 콘솔 에러 메시지
2. Supabase Auth Logs 스크린샷
3. 회원가입/로그인 시 정확한 에러 메시지
