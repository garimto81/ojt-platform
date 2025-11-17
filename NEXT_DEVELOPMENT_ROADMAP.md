# 🚀 다음 개발 로드맵

**작성 일시**: 2025-11-17
**현재 버전**: v0.5.1
**프로젝트**: GG Production Knowledge Platform

---

## ✅ 최근 완료된 작업

### v0.5.0 - Progressive Minimal Dashboard
- ✅ 신규 직원용 미니멀 대시보드 구현
- ✅ Simple/Full 대시보드 모드 분리
- ✅ 환경 변수로 기본 모드 전환 가능
- ✅ 하나의 CTA 버튼으로 집중력 향상
- **GitHub Issue**: #13 (Closed)

### v0.5.1 - Google OAuth Fix
- ✅ Google OAuth 프로필 생성 이슈 수정
- ✅ Supabase 트리거 함수 개선
- ✅ auth/callback 라우트 강화
- ✅ avatar_url, role 자동 설정
- **마이그레이션**: 011_fix_google_oauth_profile.sql

### v0.4.0 - Supabase Integration
- ✅ Vercel 프로덕션 배포 완료
- ✅ Supabase 연동 완료
- ✅ 환경 변수 검증 시스템 구축

---

## 🎯 우선순위 1: 핵심 AI 기능 구현

### 1. 🤖 AI 콘텐츠 정리 시스템 (Phase 1)

**현재 상태**: ❌ 미구현 (API 엔드포인트만 존재)

**문제점**:
- 트레이너가 비정형 텍스트로 콘텐츠 입력
- 구조화되지 않아 일관성 부족
- 학습 목표, 핵심 개념 수동 작성 필요

**목표**:
- 트레이너가 "개떡같이" 입력 → AI가 "찰떡같이" 정리

**구현 범위**:
- [ ] API 엔드포인트 구현: `/api/admin/process-content`
- [ ] TipTap 에디터에 "AI 정리" 버튼 추가
- [ ] Gemini API 프롬프트 최적화
  - 학습 목표 자동 추출
  - 핵심 개념 하이라이트
  - 일관된 마크다운 포맷팅
- [ ] `lessons.raw_content` → `lessons.content` 변환
- [ ] 원본 보존 로직 (되돌리기 기능)

**예상 소요**: 2-3일

**예상 효과**:
- 콘텐츠 작성 시간 70% 단축
- 일관된 학습 경험 제공
- 트레이너 부담 감소

**관련 파일**:
- `src/app/api/admin/process-content/route.ts` (생성 예정)
- `src/app/dashboard/admin/lessons/new/page.tsx` (수정)
- `src/components/editor/rich-editor.tsx` (버튼 추가)

---

### 2. 🎲 AI 랜덤 퀴즈 시스템 개선 (Phase 2)

**현재 상태**: ⚠️ 부분 구현 (기본 생성만 가능)

**문제점**:
- 퀴즈 생성은 되지만 매번 같은 문제
- 랜덤 출제 기능 없음
- 난이도 조절 불가
- 틀린 문제 재출제 없음

**목표**:
- 무한한 문제 풀로 암기 방지
- 학습자 수준별 난이도 조절
- 복습 강화 (틀린 문제 우선 출제)

**구현 범위**:
- [ ] `quiz_pools` 테이블 구조 설계
  ```sql
  CREATE TABLE quiz_pools (
    id UUID PRIMARY KEY,
    lesson_id UUID REFERENCES lessons(id),
    question_type TEXT,
    difficulty NUMERIC(1,0), -- 1:쉬움, 2:보통, 3:어려움
    question TEXT,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] 퀴즈 생성 시 풀에 저장 (기존: 퀴즈 테이블 직접 저장)
- [ ] 랜덤 출제 API: `/api/quiz/[lessonId]/random`
  - 학습자 레벨 기반 난이도 선택
  - 틀린 문제 우선 출제
  - 최근 출제 문제 제외 (중복 방지)
- [ ] 학습자 레벨 계산 로직
  - 정답률 기반 레벨 산정
  - `user_stats` 테이블 생성 (레벨, 정답률, 약점 분야 등)
- [ ] UI 개선
  - "새로운 문제 받기" 버튼
  - 난이도 표시
  - 틀린 문제 복습 모드

**예상 소요**: 3-4일

**예상 효과**:
- 퀴즈 제작 시간 90% 단축
- 무한 문제 변형 (학습 효과 2배)
- 개인화된 학습 경험

**관련 파일**:
- `src/app/api/quiz/[lessonId]/route.ts` (수정)
- `src/app/api/quiz/random/route.ts` (신규)
- `src/app/dashboard/learning/[lessonId]/quiz/page.tsx` (수정)
- `supabase/migrations/012_quiz_pools.sql` (신규)

---

## 🎯 우선순위 2: 사용자 경험 개선

### 3. 📊 A/B 테스트 - Simple vs Full Dashboard

**현재 상태**: ⚠️ 구현 완료, 데이터 수집 전

**목표**:
- Simple 대시보드의 효과 정량 측정
- 데이터 기반 UI/UX 개선

**구현 범위**:
- [ ] Google Analytics 4 연동
  - 이벤트 트래킹: 첫 레슨 시작 시간, 완료율
  - 커스텀 dimension: 대시보드 모드 (simple/full)
- [ ] Vercel Analytics 활용
  - 페이지 로드 시간 측정
  - 사용자 플로우 분석
- [ ] 내부 테스터 모집 (5명)
  - A그룹: Simple 모드 (3명)
  - B그룹: Full 모드 (2명)
- [ ] 1주일 데이터 수집
- [ ] 결과 분석 및 개선

**예상 소요**: 1주일 (설정 1일 + 데이터 수집 5일 + 분석 1일)

**측정 지표**:
- 첫 레슨 시작 시간 (목표: 30초 → 5초)
- 일일 레슨 완료율 (목표: 40% → 70%)
- 평균 세션 시간
- 이탈률

---

### 4. 🔔 알림 시스템 구축

**현재 상태**: ❌ 미구현 (UI만 존재)

**목표**:
- 학습 독려 알림
- 새 콘텐츠 업데이트 알림
- 순위 변동 알림

**구현 범위**:
- [ ] 알림 테이블 설계
  ```sql
  CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    type TEXT, -- 'lesson_reminder' | 'new_content' | 'rank_change'
    title TEXT,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] Supabase Realtime 구독
  - 새 알림 실시간 표시
- [ ] 이메일 알림 (선택적)
  - Supabase Edge Functions 활용
  - Resend API 연동
- [ ] UI 구현
  - 헤더 알림 벨 아이콘
  - 알림 드롭다운
  - 읽음/안 읽음 표시

**예상 소요**: 2일

**예상 효과**:
- 재방문율 30% 증가
- 학습 지속률 향상
- 사용자 참여도 증가

---

### 5. 🎮 게이미피케이션 강화

**현재 상태**: ⚠️ 부분 구현 (포인트, 리더보드만 존재)

**목표**:
- 학습 동기 부여
- 지속적인 참여 유도

**구현 범위**:
- [ ] 뱃지/업적 시스템
  - "첫 레슨 완료"
  - "7일 연속 학습"
  - "퀴즈 만점 3회"
  - "리더보드 TOP 3"
- [ ] 학습 스트릭 (연속 일수)
  - 연속 학습일 계산
  - 스트릭 표시 (🔥 아이콘)
  - 스트릭 유지 보너스 포인트
- [ ] 레벨 시스템
  - 포인트 기반 레벨업
  - 레벨별 칭호 (예: Rookie, Pro, Master)
- [ ] 일일 목표 설정
  - "오늘 1개 레슨 완료하기"
  - 목표 달성 시 추가 포인트

**예상 소요**: 3일

**예상 효과**:
- 완강률 50% 증가
- 평균 학습 시간 2배
- 사용자 만족도 향상

---

## 🎯 우선순위 3: 관리자 기능 개선

### 6. 📈 트레이너 대시보드

**현재 상태**: ❌ 미구현

**목표**:
- 학생 진행률 한눈에 파악
- 문제 학생 조기 발견
- 콘텐츠 효과 측정

**구현 범위**:
- [ ] 트레이너 전용 대시보드 `/dashboard/trainer`
- [ ] 학생 진행률 테이블
  - 이름, 현재 레슨, 완료율, 마지막 학습 시간
  - 필터링: 진행률 낮은 순, 오래 미접속 순
- [ ] 레슨별 통계
  - 평균 완료 시간
  - 퀴즈 정답률
  - 어려운 문제 TOP 5
- [ ] 알림 기능
  - 3일 미접속 학생 알림
  - 퀴즈 정답률 30% 이하 학생 알림

**예상 소요**: 2일

---

### 7. 🔍 콘텐츠 검색 기능

**현재 상태**: ❌ 미구현

**목표**:
- 학습자가 특정 주제 빠르게 찾기
- 복습 시 효율성 증대

**구현 범위**:
- [ ] 전체 레슨 검색
  - 제목, 내용 전문 검색
  - Supabase Full-Text Search 활용
- [ ] 검색 UI
  - 헤더 검색창
  - 자동완성 (제목 기반)
  - 검색 결과 하이라이트
- [ ] 최근 검색어 저장

**예상 소요**: 1일

---

## 🎯 우선순위 4: 성능 & 보안

### 8. 🚀 성능 최적화

**현재 상태**: ⚠️ 개선 필요

**목표**:
- Lighthouse 점수 90+ 달성
- 페이지 로드 시간 2초 이내

**구현 범위**:
- [ ] 이미지 최적화
  - Next.js Image 컴포넌트 사용
  - WebP 포맷 전환
  - Lazy loading
- [ ] 번들 사이즈 최적화
  - 현재 `/dashboard/content/new`: 417 kB (너무 큼)
  - TipTap 에디터 Code Splitting
  - 사용하지 않는 라이브러리 제거
- [ ] 데이터베이스 쿼리 최적화
  - N+1 쿼리 제거
  - 인덱스 추가 (자주 조회되는 컬럼)
- [ ] Caching 전략
  - Static Generation 활용 (레슨 목록)
  - ISR (Incremental Static Regeneration) 도입

**예상 소요**: 2일

---

### 9. 🔐 보안 강화

**현재 상태**: ⚠️ 기본 보안만 적용

**목표**:
- OWASP Top 10 준수
- 프로덕션 보안 표준 달성

**구현 범위**:
- [ ] Rate Limiting
  - API 엔드포인트 호출 제한 (1분에 10회)
  - 퀴즈 제출 spam 방지
- [ ] CSRF 토큰
  - 상태 변경 API에 토큰 검증
- [ ] XSS 방지
  - 사용자 입력 sanitization
  - React dangerouslySetInnerHTML 제거
- [ ] SQL Injection 방지
  - Supabase RLS 재점검
  - Parameterized queries 확인
- [ ] 환경 변수 검증 강화
  - 프로덕션 환경 변수 암호화
  - Vercel 시크릿 관리

**예상 소요**: 2일

---

## 🎯 우선순위 5: 모바일 경험 개선

### 10. 📱 PWA (Progressive Web App) 전환

**현재 상태**: ❌ 미구현

**목표**:
- 앱처럼 설치 가능
- 오프라인 학습 지원

**구현 범위**:
- [ ] Service Worker 등록
- [ ] Manifest 파일 생성
  - 앱 아이콘, 이름, 테마 색상
- [ ] 오프라인 캐싱
  - 완료한 레슨 캐싱
  - 다음 레슨 pre-fetch
- [ ] 푸시 알림
  - 학습 리마인더
  - 새 콘텐츠 알림

**예상 소요**: 3일

---

## 📅 개발 일정 제안

### Week 1-2 (현재 ~ 12/1)
**목표**: AI 핵심 기능 완성

| 일자 | 작업 | 담당 | 상태 |
|------|------|------|------|
| 11/18-11/19 | AI 콘텐츠 정리 시스템 (API + UI) | - | Pending |
| 11/20-11/21 | 퀴즈 풀 테이블 설계 및 마이그레이션 | - | Pending |
| 11/22-11/24 | 랜덤 퀴즈 API + 난이도 조절 로직 | - | Pending |
| 11/25 | 통합 테스트 및 버그 수정 | - | Pending |

**Milestone**: v0.6.0 - AI-Powered Content System

---

### Week 3-4 (12/2 ~ 12/15)
**목표**: UX 개선 및 데이터 수집

| 일자 | 작업 | 담당 | 상태 |
|------|------|------|------|
| 12/2 | Google Analytics 4 연동 | - | Pending |
| 12/3-12/8 | A/B 테스트 데이터 수집 (5일) | - | Pending |
| 12/9 | 데이터 분석 및 개선점 도출 | - | Pending |
| 12/10-12/11 | 알림 시스템 구현 | - | Pending |
| 12/12-12/14 | 게이미피케이션 강화 | - | Pending |
| 12/15 | 통합 테스트 | - | Pending |

**Milestone**: v0.7.0 - Enhanced User Experience

---

### Week 5-6 (12/16 ~ 12/29)
**목표**: 관리자 기능 + 성능 최적화

| 일자 | 작업 | 담당 | 상태 |
|------|------|------|------|
| 12/16-12/17 | 트레이너 대시보드 | - | Pending |
| 12/18 | 콘텐츠 검색 기능 | - | Pending |
| 12/19-12/20 | 성능 최적화 (이미지, 번들 사이즈) | - | Pending |
| 12/21-12/22 | 보안 강화 (Rate Limiting, CSRF) | - | Pending |
| 12/23-12/29 | 버그 수정 및 안정화 | - | Pending |

**Milestone**: v0.8.0 - Production-Ready

---

### Week 7-8 (12/30 ~ 1/12)
**목표**: 모바일 경험 + 최종 안정화

| 일자 | 작업 | 담당 | 상태 |
|------|------|------|------|
| 12/30-1/1 | PWA 전환 | - | Pending |
| 1/2-1/5 | 모바일 UI/UX 개선 | - | Pending |
| 1/6-1/8 | 전체 E2E 테스트 (Playwright) | - | Pending |
| 1/9-1/12 | 최종 버그 수정 및 문서화 | - | Pending |

**Milestone**: v1.0.0 - Public Release

---

## 🎯 성공 지표 (KPI)

### 사용자 지표
- **일일 활성 사용자 (DAU)**: 50명 이상
- **7일 완강률**: 60% 이상
- **평균 세션 시간**: 20분 이상
- **재방문율**: 70% 이상

### 학습 효과 지표
- **퀴즈 평균 정답률**: 75% 이상
- **레슨 평균 완료 시간**: 25분 이하
- **복습 참여율**: 40% 이상

### 기술 지표
- **Lighthouse Performance**: 90+ 점
- **페이지 로드 시간**: 2초 이내
- **API 응답 시간**: 500ms 이내
- **에러율**: 1% 이하

---

## 💡 추가 아이디어 (Backlog)

### 장기 로드맵 (v1.1 이후)

1. **커뮤니티 기능**
   - 학습자 간 질문/답변 게시판
   - 스터디 그룹 생성
   - 동료 학습 (Peer Learning)

2. **비디오 강의 지원**
   - YouTube/Vimeo 임베드
   - 비디오 재생 추적
   - 구간별 퀴즈 삽입

3. **실전 시뮬레이션**
   - 포커 핸드 리플레이어
   - 의사결정 트레이닝
   - AI 상대와 연습

4. **다국어 지원**
   - 한국어, 영어, 일본어
   - i18n 라이브러리 도입

5. **인증서 발급**
   - 7일 과정 완료 시 PDF 인증서
   - 소셜 공유 기능

---

## 📝 참고 문서

### 기존 문서
- `CLAUDE.md` - 프로젝트 전체 가이드
- `MINIMAL_DASHBOARD_PROPOSAL.md` - 미니멀 대시보드 설계
- `GOOGLE_OAUTH_FIX_GUIDE.md` - Google OAuth 수정 가이드
- `DEPLOYMENT_SUCCESS.md` - 배포 완료 문서

### 생성 예정 문서
- `AI_CONTENT_SYSTEM_SPEC.md` - AI 콘텐츠 정리 시스템 명세
- `QUIZ_POOL_DESIGN.md` - 퀴즈 풀 설계 문서
- `ANALYTICS_GUIDE.md` - A/B 테스트 가이드

---

**작성자**: Claude Code (AI Assistant)
**최종 업데이트**: 2025-11-17
**버전**: v0.5.1 → v1.0.0 로드맵
