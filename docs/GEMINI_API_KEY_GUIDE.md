# Google Gemini API 키 발급 가이드

Google Gemini API 키를 발급받아 OJT Platform에서 AI 퀴즈 생성 기능을 사용할 수 있습니다.

## 📋 목차
1. [전제 조건](#전제-조건)
2. [API 키 발급 방법](#api-키-발급-방법)
3. [API 키 설정](#api-키-설정)
4. [무료 사용량 및 제한](#무료-사용량-및-제한)
5. [문제 해결](#문제-해결)

---

## 전제 조건

✅ **필요한 것:**
- Google 계정 (Gmail 계정)
- 인터넷 브라우저

⚠️ **주의:**
- GEMINI_API_KEY는 **Admin 퀴즈 생성 기능에만 필요**합니다
- **로그인 및 일반 사용에는 불필요**합니다
- 없어도 앱은 정상 작동합니다 (퀴즈 생성 제외)

---

## API 키 발급 방법

### 1단계: Google AI Studio 접속

브라우저에서 다음 URL로 접속:
```
https://aistudio.google.com/app/apikey
```

또는:
```
https://makersuite.google.com/app/apikey
```

![Google AI Studio](https://ai.google.dev/static/tutorials/images/ai-studio-home.png)

---

### 2단계: Google 계정 로그인

- Google 계정으로 로그인
- 처음 접속 시 약관 동의 필요

---

### 3단계: API 키 생성

#### A. "Get API key" 또는 "Create API key" 클릭

화면에 표시되는 버튼:
- **"Get API key"** (영문)
- **"API 키 만들기"** (한글)

#### B. 프로젝트 선택

두 가지 옵션:

**옵션 1: 기존 Google Cloud 프로젝트에서 생성**
```
→ "Create API key in existing project" 선택
→ 드롭다운에서 프로젝트 선택
→ "Create" 클릭
```

**옵션 2: 새 Google Cloud 프로젝트 생성**
```
→ "Create API key in new project" 선택
→ 프로젝트 이름 자동 생성됨 (예: "generativelanguage-...")
→ "Create" 클릭
```

💡 **권장:** 처음 사용하시면 "Create API key in new project" 선택

---

### 4단계: API 키 복사

생성 완료되면 다음과 같은 화면:

```
✅ Your API key
AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq

🔒 Keep your API key secure
```

#### ✅ API 키 형식 확인:
- 시작: `AIzaSy`로 시작
- 길이: 39자
- 예시: `AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq`

#### 복사 방법:
1. **"Copy" 버튼** 클릭
2. 또는 키를 **드래그하여 선택** → Ctrl+C (Windows) / Cmd+C (Mac)

⚠️ **보안 주의사항:**
- API 키를 안전한 곳에 저장
- GitHub 등 공개 저장소에 올리지 말 것
- 환경 변수로만 사용

---

### 5단계: API 활성화 확인 (자동)

Google AI Studio에서 생성한 키는 자동으로 다음 API가 활성화됩니다:
- ✅ Generative Language API

추가 설정 불필요!

---

## API 키 설정

### 로컬 개발 환경

#### `.env.local` 파일에 추가:

```bash
# Google Gemini API
GEMINI_API_KEY=AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq
```

#### 설정 확인:
```bash
npm run check-env
```

---

### Vercel 배포 환경

#### 1. Vercel Dashboard 접속
```
https://vercel.com/dashboard
```

#### 2. 프로젝트 선택
```
→ ojt-platform 클릭
→ Settings
→ Environment Variables
```

#### 3. 환경 변수 추가
```
Name: GEMINI_API_KEY
Value: AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQq (복사한 키)
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 4. Save 후 Redeploy
```
Deployments → 최신 배포 → ... → Redeploy
```

---

## 무료 사용량 및 제한

### ✅ 무료 티어 (Free Tier)

Google Gemini API는 **무료로 사용 가능**합니다:

| 항목 | 무료 한도 |
|------|----------|
| **요청 제한** | 분당 60회 |
| **일일 사용량** | 무제한 (Rate limit만 존재) |
| **모델** | Gemini 1.5 Flash, Gemini 1.5 Pro |
| **비용** | **완전 무료** |

### 💰 유료 티어 (Pay-as-you-go)

필요 시 업그레이드 가능:

| 모델 | 가격 (입력) | 가격 (출력) |
|------|-------------|-------------|
| Gemini 1.5 Flash | $0.075 / 100만 토큰 | $0.30 / 100만 토큰 |
| Gemini 1.5 Pro | $1.25 / 100만 토큰 | $5.00 / 100만 토큰 |

💡 **OJT Platform 사용량:**
- 퀴즈 1세트 생성 = 약 1,000~2,000 토큰
- 무료 티어로 충분히 사용 가능

---

## 문제 해결

### ❌ "API key not valid" 에러

**원인:**
- API 키가 잘못 복사됨
- 공백이 포함됨

**해결:**
```bash
1. 다시 복사
2. 앞뒤 공백 제거
3. 39자 확인
4. AIzaSy로 시작하는지 확인
```

---

### ❌ "API not enabled" 에러

**원인:**
- Generative Language API가 비활성화됨

**해결:**
```bash
1. Google Cloud Console 접속
   https://console.cloud.google.com/

2. 프로젝트 선택

3. APIs & Services → Library

4. "Generative Language API" 검색

5. Enable 클릭
```

---

### ❌ "Quota exceeded" 에러

**원인:**
- 분당 60회 제한 초과

**해결:**
```bash
1. 1분 대기 후 재시도
2. 또는 Rate Limit 증가 신청
   (Google Cloud Console → Quotas)
```

---

### ❌ 키가 노출된 경우

**즉시 조치:**
```bash
1. Google AI Studio 접속
   https://aistudio.google.com/app/apikey

2. 노출된 키 옆의 "Delete" 클릭

3. 새 키 생성

4. 환경 변수 업데이트

5. Vercel Redeploy
```

---

## 환경 변수 검증

### 로컬에서 확인:
```bash
npm run check-env
```

### Vercel에서 확인:
```
https://ojt-platform.vercel.app/debug/env-check
```

---

## 참고 자료

### 공식 문서:
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Pricing](https://ai.google.dev/pricing)

### 도움말:
- [API Key 관리](https://ai.google.dev/tutorials/setup)
- [Quota 관리](https://ai.google.dev/docs/quota)

---

## 요약

### ✅ 발급 절차
1. https://aistudio.google.com/app/apikey 접속
2. "Create API key" 클릭
3. 프로젝트 선택 (또는 새로 생성)
4. API 키 복사 (AIzaSy...)
5. 환경 변수에 설정

### ✅ 사용 범위
- Admin/Trainer 퀴즈 생성 기능
- 무료 티어로 충분
- 로그인에는 불필요

### ✅ 보안
- 절대 GitHub에 커밋하지 말 것
- 환경 변수로만 사용
- 노출 시 즉시 삭제 후 재발급

---

**문제가 있으면 `/debug/env-check` 페이지에서 확인하세요!**
