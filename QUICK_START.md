# 🚀 Quick Start Guide - GG Production Platform

**15분 안에 플랫폼을 실행하세요!**

---

## 📋 준비물

- ✅ Supabase 계정
- ✅ Google Gemini API 키 (무료)
- ✅ Node.js 18+ 설치됨

---

## Step 1: Supabase 데이터베이스 설정 (5분)

### 1.1 데이터베이스 마이그레이션 적용

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. 아래 마이그레이션 파일들을 순서대로 실행:

#### Migration 1: 테이블 생성
```bash
# 파일: supabase/migrations/001_initial_schema.sql
```
→ Supabase SQL Editor에서 파일 내용 복사 → 붙여넣기 → **RUN** 클릭

#### Migration 2: 샘플 데이터
```bash
# 파일: supabase/migrations/002_seed_data.sql
```
→ Supabase SQL Editor에서 파일 내용 복사 → 붙여넣기 → **RUN** 클릭

#### Migration 3: 샘플 레슨 콘텐츠
```bash
# 파일: supabase/migrations/003_sample_lesson_content.sql
```
→ Supabase SQL Editor에서 파일 내용 복사 → 붙여넣기 → **RUN** 클릭

### 1.2 API 키 복사

1. 왼쪽 메뉴 **Settings** → **API**
2. 다음 3개 값 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGci...`
   - **service_role**: `eyJhbGci...` (비밀!)

---

## Step 2: Gemini API 키 발급 (2분)

1. [Google AI Studio](https://ai.google.dev/) 접속
2. **Get API key** 클릭
3. **Create API key** 선택
4. API 키 복사 (무료, 60 req/min)

---

## Step 3: 환경 변수 설정 (1분)

```bash
cd ggp-platform
cp .env.example .env.local
```

`.env.local` 파일 편집:

```env
# Supabase (Step 1.2에서 복사한 값)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Database
DATABASE_URL=postgresql://postgres:비밀번호@db.xxxxx.supabase.co:6543/postgres

# Gemini (Step 2에서 복사한 값)
GEMINI_API_KEY=AIzaSy...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 4: 앱 실행 (2분)

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 열기: **http://localhost:3000** 🎉

---

## Step 5: Admin 사용자 생성 (3분)

### 5.1 회원가입

1. http://localhost:3000 접속
2. **Sign Up** 클릭
3. 이메일/비밀번호 입력
4. 회원가입 완료

### 5.2 Admin 권한 부여

Supabase Dashboard → **SQL Editor**:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

**RUN** 클릭 → 로그아웃 → 다시 로그인

---

## Step 6: 테스트 (2분)

### ✅ 학습자 기능 테스트

1. **Dashboard** - 통계 확인
2. **Learning** - Day 1 클릭
3. **Poker Basics** 레슨 열기
4. 콘텐츠 읽기
5. **퀴즈 풀기** 버튼 클릭
6. 퀴즈 완료 → 포인트 획득 확인

### ✅ Admin 기능 테스트

1. 왼쪽 메뉴 **ADMIN** 섹션 확인
2. **Lesson Content** 클릭
3. 아무 레슨 선택 → **편집** 클릭
4. 콘텐츠 수정 → **저장**
5. **AI Quiz Generator** 클릭
6. Day 1 레슨 선택
7. 문제 5개, 객관식+O/X 선택
8. **AI 퀴즈 생성하기** 클릭
9. 약 10초 후 퀴즈 생성 완료
10. 퀴즈 검토 → 눈 아이콘 클릭 (활성화)

---

## 🎉 완료!

플랫폼이 정상 작동합니다!

### 다음 단계:

#### 콘텐츠 추가
- Admin → Lesson Content에서 나머지 레슨 콘텐츠 작성
- 각 레슨마다 AI로 퀴즈 생성

#### 배포
- [DEPLOYMENT.md](./DEPLOYMENT.md) 참조
- Vercel에 배포 (~10분)

---

## 🆘 문제 해결

### 데이터베이스 연결 오류
```
❌ Error: could not connect to database
```
**해결**: `.env.local`의 `DATABASE_URL`과 Supabase 비밀번호 확인

### Gemini API 오류
```
❌ Error: Gemini API key invalid
```
**해결**:
1. [Google AI Studio](https://ai.google.dev/)에서 API 키 재확인
2. `.env.local`의 `GEMINI_API_KEY` 확인
3. 개발 서버 재시작 (`npm run dev`)

### 퀴즈 생성 안됨
```
❌ Error: Lesson has no content
```
**해결**: Admin → Lesson Content에서 레슨에 콘텐츠 먼저 추가

### Admin 메뉴 안보임
```
❌ Admin 섹션이 사이드바에 없음
```
**해결**:
1. Supabase에서 role을 'admin'으로 변경했는지 확인
2. 로그아웃 후 재로그인
3. 브라우저 캐시 삭제

---

## 📚 추가 문서

- [README.md](./README.md) - 전체 프로젝트 개요
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 프로덕션 배포 가이드
- [Database Schema](./supabase/migrations/) - 데이터베이스 구조

---

**Happy Learning! 🎓**
