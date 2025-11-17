# Google OAuth 로그인 설정 가이드

## 🔐 1. Google Cloud Console 설정

### 1-1. 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 드롭다운 → "새 프로젝트" 클릭
3. 프로젝트 이름: `GG Production Platform` (또는 원하는 이름)
4. "만들기" 클릭

### 1-2. OAuth 동의 화면 구성

1. 좌측 메뉴 → **APIs & Services** → **OAuth consent screen**
2. User Type 선택:
   - ✅ **Internal** (G Suite 조직용) - GG Production 직원만
   - 또는 **External** (누구나) - 테스트 단계
3. "만들기" 클릭

#### OAuth 동의 화면 정보 입력:

```yaml
앱 정보:
  앱 이름: GG Production 지식 플랫폼
  사용자 지원 이메일: your-email@ggproduction.com
  앱 로고: (선택사항)

개발자 연락처 정보:
  이메일 주소: your-email@ggproduction.com

범위 (Scopes):
  - .../auth/userinfo.email
  - .../auth/userinfo.profile
  - openid

테스트 사용자: (External인 경우)
  - 테스트할 구글 계정 이메일 추가
```

### 1-3. OAuth 클라이언트 ID 만들기

1. **APIs & Services** → **Credentials**
2. "**+ CREATE CREDENTIALS**" → "**OAuth client ID**"
3. 애플리케이션 유형: **웹 애플리케이션**
4. 이름: `GG Production Web Client`

#### 승인된 JavaScript 원본:

```
http://localhost:3002
http://localhost:3001
http://localhost:3000
```

#### 승인된 리디렉션 URI:

```
https://cbvansmxutnogntbyswi.supabase.co/auth/v1/callback
http://localhost:3002/auth/callback
```

5. "만들기" 클릭
6. **클라이언트 ID**와 **클라이언트 보안 비밀** 복사 (나중에 사용)

---

## 🔧 2. Supabase 설정

### 2-1. Google Provider 활성화

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택: `cbvansmxutnogntbyswi`
3. **Authentication** → **Providers**
4. **Google** 찾아서 클릭

### 2-2. Google OAuth 설정

```yaml
Enable Sign in with Google: ON

Client ID:
  [Google Cloud Console에서 복사한 클라이언트 ID]
  예: 123456789-abcdefg.apps.googleusercontent.com

Client Secret:
  [Google Cloud Console에서 복사한 클라이언트 보안 비밀]
  예: GOCSPX-xxxxxxxxxxxxxxxxxxxxx

Authorized Client IDs: (선택사항)
  - Google Cloud Console의 클라이언트 ID
```

5. **Save** 클릭

### 2-3. Redirect URL 확인

Supabase가 자동으로 생성한 Callback URL:
```
https://cbvansmxutnogntbyswi.supabase.co/auth/v1/callback
```

이 URL이 Google Cloud Console의 "승인된 리디렉션 URI"에 포함되어 있는지 확인!

---

## 💻 3. 애플리케이션 코드 수정

### 3-1. 로그인 페이지에 Google 버튼 추가

이미 자동으로 추가되었습니다!

**파일**: `src/app/login/page.tsx`

Google 로그인 버튼이 이메일/비밀번호 폼 하단에 표시됩니다:
```tsx
<button onClick={handleGoogleLogin}>
  <GoogleIcon /> Google로 로그인
</button>
```

### 3-2. 회원가입 페이지에 Google 버튼 추가

**파일**: `src/app/register/page.tsx`

Google 가입 버튼이 자동으로 추가됩니다.

---

## 🧪 4. 테스트

### 4-1. Google 로그인 테스트

1. http://localhost:3002/login 접속
2. "Google로 로그인" 버튼 클릭
3. Google 계정 선택
4. "GG Production 지식 플랫폼"에 권한 부여
5. 자동으로 대시보드로 이동

### 4-2. 에러 디버깅

**일반적인 에러:**

| 에러 메시지 | 원인 | 해결 방법 |
|------------|------|----------|
| `redirect_uri_mismatch` | 리디렉션 URI 불일치 | Google Console에서 정확한 Supabase callback URL 추가 |
| `access_denied` | 사용자가 거부 | 다시 시도하거나 계정 확인 |
| `invalid_client` | 클라이언트 ID/Secret 오류 | Supabase에서 정확한 값 재입력 |
| `This app is blocked` | Internal 모드 + 외부 사용자 | OAuth 동의 화면을 External로 변경 또는 조직 내부 계정 사용 |

### 4-3. Supabase Auth Logs 확인

1. Supabase Dashboard → **Logs** → **Auth Logs**
2. 최근 Google 로그인 시도 확인
3. 에러 메시지 확인

---

## 📊 5. 사용자 데이터 확인

### 5-1. Google로 가입한 사용자 확인

```sql
-- SQL Editor에서 실행
SELECT
  id,
  email,
  raw_user_meta_data->>'full_name' as name,
  raw_user_meta_data->>'avatar_url' as avatar,
  raw_app_meta_data->>'provider' as provider,
  created_at
FROM auth.users
WHERE raw_app_meta_data->>'provider' = 'google'
ORDER BY created_at DESC;
```

### 5-2. 사용자 메타데이터

Google 로그인 시 자동으로 저장되는 정보:
```json
{
  "iss": "https://accounts.google.com",
  "sub": "구글 사용자 고유 ID",
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "홍길동",
  "picture": "https://lh3.googleusercontent.com/...",
  "given_name": "길동",
  "family_name": "홍",
  "locale": "ko"
}
```

---

## 🔒 6. 보안 설정 (프로덕션)

### 6-1. Internal vs External

**Internal (권장 - GG Production 직원만):**
- G Suite/Google Workspace 조직 계정만 로그인 가능
- 외부 구글 계정 차단
- 자동 승인 (관리자 검토 불필요)

**External (테스트용):**
- 모든 Google 계정 로그인 가능
- 최대 100명 테스트 사용자
- 프로덕션 배포 전 Google 검토 필요

### 6-2. 도메인 제한 (G Suite 사용 시)

특정 도메인만 허용:
```typescript
// Supabase에서는 직접 지원 안 함
// 애플리케이션 레벨에서 처리:

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    queryParams: {
      hd: 'ggproduction.com' // @ggproduction.com만 허용
    }
  }
})
```

---

## ✅ 설정 체크리스트

### Google Cloud Console
- [ ] 프로젝트 생성
- [ ] OAuth 동의 화면 구성 (Internal/External 선택)
- [ ] OAuth 클라이언트 ID 생성
- [ ] 클라이언트 ID 복사
- [ ] 클라이언트 보안 비밀 복사
- [ ] 승인된 JavaScript 원본 추가: `http://localhost:3002`
- [ ] 승인된 리디렉션 URI 추가: `https://cbvansmxutnogntbyswi.supabase.co/auth/v1/callback`

### Supabase Dashboard
- [ ] Authentication → Providers → Google 활성화
- [ ] Google 클라이언트 ID 입력
- [ ] Google 클라이언트 보안 비밀 입력
- [ ] Save 클릭

### 애플리케이션
- [ ] 로그인 페이지에 Google 버튼 확인
- [ ] 회원가입 페이지에 Google 버튼 확인
- [ ] 테스트 로그인 성공 확인

---

## 🚀 빠른 시작 요약

1. **Google Cloud Console**
   - 프로젝트 생성 → OAuth 동의 화면 → OAuth 클라이언트 ID
   - 리디렉션 URI: `https://cbvansmxutnogntbyswi.supabase.co/auth/v1/callback`

2. **Supabase Dashboard**
   - Authentication → Providers → Google → ON
   - 클라이언트 ID & Secret 입력 → Save

3. **테스트**
   - http://localhost:3002/login
   - "Google로 로그인" 클릭

---

## 📞 문제 해결

### redirect_uri_mismatch 에러

**에러 메시지:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request: https://cbvansmxutnogntbyswi.supabase.co/auth/v1/callback
does not match the ones authorized for the OAuth client.
```

**해결:**
1. Google Cloud Console → Credentials → OAuth 2.0 Client IDs
2. 해당 클라이언트 ID 클릭
3. "승인된 리디렉션 URI"에 정확히 추가:
   ```
   https://cbvansmxutnogntbyswi.supabase.co/auth/v1/callback
   ```
4. Save

### This app is blocked

**에러:** "This app is blocked. This app tried to access sensitive info in your Google Account."

**원인:** OAuth 동의 화면이 "Internal"인데 조직 외부 계정으로 로그인 시도

**해결:**
1. OAuth 동의 화면을 "External"로 변경
2. 또는 G Suite 조직 계정으로 로그인

---

## 📚 추가 참고자료

- [Supabase Google OAuth 공식 문서](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
