# 이메일 인증 설정 가이드

## 📧 개요

GGP Knowledge Platform은 회원가입 시 이메일 인증을 요구합니다. 사용자는 이메일로 받은 인증 링크를 클릭한 후에만 로그인할 수 있습니다.

---

## 🔧 Supabase 이메일 설정

### 1. Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. 좌측 메뉴에서 **Authentication** → **Email Templates** 클릭

### 2. 이메일 템플릿 설정

#### Confirm Signup (회원가입 확인)

**Subject (제목):**
```
[GG Production] 이메일 인증을 완료해주세요
```

**Body (본문):**
```html
<h2>안녕하세요, {{ .Email }}님!</h2>

<p>GG Production Knowledge Platform에 가입해주셔서 감사합니다.</p>

<p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요:</p>

<a href="{{ .ConfirmationURL }}"
   style="display: inline-block; padding: 12px 24px; background-color: #C8102E; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0;">
  이메일 인증하기
</a>

<p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
<p style="color: #666; font-size: 12px; word-break: break-all;">{{ .ConfirmationURL }}</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

<p style="color: #999; font-size: 12px;">
이 이메일은 {{ .SiteURL }}에서 계정 생성 요청으로 발송되었습니다.<br>
본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.
</p>
```

### 3. 이메일 발송 설정 확인

**Authentication** → **Settings** → **Email Auth**에서:

- ✅ **Enable Email Confirmations**: ON (이메일 확인 활성화)
- ✅ **Secure Email Change**: ON (보안 이메일 변경)
- ⏱ **Email Confirmation Expiry**: 86400 (24시간)

---

## 🚀 개발 환경 테스트

### 로컬 개발 시 주의사항

개발 환경에서는 Supabase의 **Inbucket**을 사용하여 이메일을 확인할 수 있습니다:

1. Supabase Dashboard → **Authentication** → **Email Templates**
2. 우측 상단 **View Sent Messages** 클릭
3. 전송된 이메일 목록 확인 및 인증 링크 클릭

### .env.local 확인

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📱 사용자 플로우

### 1. 회원가입
```
사용자 입력 → 이메일/비밀번호/이름/역할
           → [계정 생성하기] 버튼 클릭
           → 이메일 전송 완료 화면 표시
```

### 2. 이메일 인증
```
이메일 수신 → [이메일 인증하기] 버튼 클릭
           → /auth/callback으로 리다이렉트
           → 자동으로 대시보드 이동
```

### 3. 로그인 (인증 전)
```
로그인 시도 → 이메일 미인증 감지
           → "이메일 인증이 필요합니다" 에러 표시
           → 로그인 차단
```

### 4. 로그인 (인증 후)
```
로그인 시도 → 이메일 인증 확인
           → 대시보드로 이동
           → 학습 시작
```

---

## 🔄 이메일 재발송

사용자가 이메일을 받지 못한 경우:

1. 회원가입 완료 화면에서 **"인증 메일 다시 보내기"** 클릭
2. 동일한 이메일/비밀번호로 다시 회원가입 시도
3. Supabase가 자동으로 새로운 인증 이메일 전송

---

## ⚠️ 문제 해결

### 이메일이 오지 않을 때

**1. 스팸 폴더 확인**
- Gmail: 프로모션 탭 확인
- Naver: 스팸메일함 확인

**2. Supabase 이메일 로그 확인**
```
Supabase Dashboard
→ Authentication
→ Logs
→ Recent Events 필터링
```

**3. 이메일 발송 제한 확인**
- Supabase Free tier: 시간당 3개
- 초과 시 SMTP 설정 필요

### 인증 링크가 만료된 경우

- 기본 만료 시간: 24시간
- 재발송 필요: 회원가입 페이지에서 다시 시도

### 로그인이 안 될 때

**에러 메시지: "이메일 인증이 필요합니다"**
- 이메일함에서 인증 링크 클릭
- 링크 만료 시 재발송

**에러 메시지: "Invalid login credentials"**
- 이메일/비밀번호 확인
- 비밀번호 최소 8자 이상

---

## 🎯 프로덕션 배포 시

### 1. Custom SMTP 설정 (권장)

Supabase의 기본 이메일 발송은 제한이 있으므로, 프로덕션에서는 Custom SMTP 사용을 권장합니다:

**지원되는 서비스:**
- SendGrid
- AWS SES
- Mailgun
- Postmark

**설정 방법:**
1. Supabase Dashboard → **Project Settings** → **Auth**
2. **SMTP Settings** 섹션에서 설정
3. SMTP 서버 정보 입력:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   User: apikey
   Password: YOUR_SENDGRID_API_KEY
   Sender: noreply@your-domain.com
   Sender Name: GG Production
   ```

### 2. 도메인 인증 (SPF/DKIM)

이메일이 스팸으로 분류되지 않도록 도메인 인증 설정:

1. DNS 레코드에 SPF 추가
2. DKIM 서명 활성화
3. DMARC 정책 설정

### 3. 이메일 모니터링

- 발송 성공률 모니터링
- 반송 이메일 처리
- 사용자 피드백 수집

---

## 📊 통계 확인

### Supabase Dashboard에서 확인 가능한 지표:

- **Total Users**: 전체 가입자 수
- **Confirmed Users**: 이메일 인증 완료 사용자
- **Pending Confirmations**: 인증 대기 중인 사용자

```sql
-- 인증 완료율 확인 (Supabase SQL Editor)
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
  ROUND(
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*),
    2
  ) as confirmation_rate
FROM auth.users;
```

---

## 🔐 보안 고려사항

### 1. 이메일 확인 URL 보안

- ✅ HTTPS 사용 필수
- ✅ 토큰 한 번만 사용 가능
- ✅ 24시간 후 자동 만료

### 2. Rate Limiting

- 동일 IP에서 회원가입 시도 제한
- 이메일 재발송 요청 제한 (5분에 1회)

### 3. 피싱 방지

- 공식 도메인에서만 발송
- 이메일 템플릿에 회사 로고 추가
- 발신자 주소 명확히 표시

---

## 📝 요약

### ✅ 구현된 기능

1. ✅ 회원가입 시 이메일 인증 메일 자동 발송
2. ✅ 이메일 확인 대기 화면 (안내 메시지 + 재발송 버튼)
3. ✅ 로그인 시 미인증 사용자 차단
4. ✅ 이메일 재발송 기능
5. ✅ 인증 완료 후 자동 로그인 (auth/callback)

### 🎨 사용자 경험

- 명확한 안내 메시지
- 3단계 인증 절차 표시
- 이메일 주소 강조 표시
- 스팸 폴더 확인 안내
- 원클릭 재발송 기능

### 🔒 보안

- 이메일 미인증 시 로그인 차단
- 인증 링크 24시간 만료
- HTTPS 리다이렉트 URL

---

## 📞 지원

문제가 지속되면:
- Supabase Dashboard의 Logs 확인
- 개발팀에 문의 (이메일 스크린샷 첨부)
- [Supabase 공식 문서](https://supabase.com/docs/guides/auth/auth-email) 참조
