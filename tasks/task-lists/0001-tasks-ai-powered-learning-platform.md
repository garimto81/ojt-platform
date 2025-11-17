# Task List: AI 기반 온보딩 학습 플랫폼

**PRD**: PRD-0001
**생성일**: 2025-01-14
**상태**: Phase 0.5 - Task List Generated

---

## 📋 전체 개요

**목표**: GG Production 포커 온보딩 플랫폼에 AI 기능 구현
- AI 콘텐츠 정리 시스템 (개떡같이 → 찰떡같이)
- AI 퀴즈 자동 생성 시스템
- 랜덤 퀴즈 출제 시스템

**주요 변경 사항**:
- ✅ Gemini API 통합 (콘텐츠 정리 + 퀴즈 생성)
- ✅ 인증 시스템 재활성화
- ✅ 데이터베이스 스키마 확장
- ✅ E2E 테스트 완성

---

## Task 0.0: 프로젝트 초기 설정 ✅

- [x] ~~Feature branch 생성~~ (이미 main에서 작업 중)
- [ ] 환경 변수 확인: `npm run check-env`
- [ ] 의존성 설치 확인: `npm install`
- [ ] GEMINI_API_KEY 확인 (`.env.local`)
- [ ] 개발 서버 실행 확인: `npm run dev`

---

## Task 1: 인증 시스템 재활성화

### 📝 개요
현재 `src/middleware.ts`에서 인증이 비활성화되어 있음. 프로덕션 배포 전 Supabase 인증 재활성화 필요.

### 1.1 Middleware 인증 재활성화
- [ ] `src/middleware.ts` 수정
  - [ ] Supabase auth 체크 로직 복원
  - [ ] 보호된 라우트 설정 (`/dashboard/*`)
  - [ ] 역할 기반 접근 제어 (admin/trainer)
  - [ ] 인증 실패 시 `/login` 리다이렉트

### 1.2 테스트 작성 (1:1 매칭)
- [ ] `tests/unit/middleware.test.ts` 작성
  - [ ] 인증된 사용자 접근 허용 테스트
  - [ ] 비인증 사용자 리다이렉트 테스트
  - [ ] 역할 기반 접근 제어 테스트

### 1.3 E2E 테스트 업데이트
- [ ] `tests/e2e/authentication.spec.ts` 작성
  - [ ] 로그인 플로우 테스트
  - [ ] 로그아웃 플로우 테스트
  - [ ] 보호된 라우트 접근 테스트

**예상 시간**: 2-3시간

---

## Task 2: 데이터베이스 스키마 확장

### 📝 개요
PRD에 명시된 새 필드 추가 (AI 처리 관련)

### 2.1 Supabase 마이그레이션 작성
- [ ] `supabase/migrations/005_ai_features_extended.sql` 작성
  - [ ] `lessons` 테이블 확장:
    ```sql
    ALTER TABLE lessons ADD COLUMN raw_content TEXT;
    ALTER TABLE lessons ADD COLUMN learning_objectives TEXT[];
    ALTER TABLE lessons ADD COLUMN key_concepts TEXT[];
    ALTER TABLE lessons ADD COLUMN difficulty_level TEXT;
    ALTER TABLE lessons ADD COLUMN ai_processed BOOLEAN DEFAULT FALSE;
    ALTER TABLE lessons ADD COLUMN ai_processed_at TIMESTAMP;
    ```
  - [ ] `quizzes` 테이블 확장:
    ```sql
    ALTER TABLE quizzes ADD COLUMN difficulty TEXT;
    ALTER TABLE quizzes ADD COLUMN concept_tags TEXT[];
    ALTER TABLE quizzes ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
    ALTER TABLE quizzes ADD COLUMN generation_seed TEXT;
    ```
  - [ ] `quiz_pools` 테이블 생성:
    ```sql
    CREATE TABLE quiz_pools (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      lesson_id UUID REFERENCES lessons(id),
      total_questions INTEGER,
      difficulty_distribution JSONB,
      last_generated_at TIMESTAMP,
      generation_count INTEGER DEFAULT 0
    );
    ```

### 2.2 TypeScript 타입 업데이트
- [ ] `src/lib/types/database.types.ts` 업데이트
  - [ ] Lessons 타입에 새 필드 추가
  - [ ] Quizzes 타입에 새 필드 추가
  - [ ] QuizPools 타입 생성

### 2.3 마이그레이션 테스트
- [ ] 로컬에서 마이그레이션 실행
- [ ] 데이터 무결성 확인
- [ ] 기존 데이터 호환성 테스트

**예상 시간**: 1-2시간

---

## Task 3: AI 콘텐츠 정리 시스템 구현

### 📝 개요
"개떡같이" 입력한 콘텐츠를 Gemini API로 "찰떡같이" 정리

### 3.1 API Route 구현
- [ ] `src/app/api/admin/process-content/route.ts` 완성
  - [ ] POST 요청 처리
  - [ ] 인증 확인 (admin/trainer만)
  - [ ] Gemini API 호출 구현
  - [ ] 프롬프트 엔지니어링:
    ```
    - 학습 목표 자동 추출
    - 핵심 개념 하이라이트
    - 일관된 마크다운 포맷 변환
    - 난이도 자동 분류
    - 예상 학습 시간 계산
    ```
  - [ ] 에러 핸들링 (API 실패, 타임아웃)
  - [ ] 원본 콘텐츠 보존 (`raw_content`)

### 3.2 API 테스트 (1:1 매칭)
- [ ] `tests/api/process-content.test.ts` 작성
  - [ ] 정상 콘텐츠 정리 테스트
  - [ ] 비정형 텍스트 처리 테스트
  - [ ] 인증 실패 테스트
  - [ ] API 키 없을 때 에러 핸들링 테스트

### 3.3 UI 완성
- [ ] `src/app/dashboard/admin/content-processor/page.tsx` 개선
  - [ ] TipTap 에디터 통합
  - [ ] "AI로 정리하기" 버튼
  - [ ] 로딩 상태 UI (3-5초)
  - [ ] 정리 전/후 비교 뷰
  - [ ] 수정 가능 에디터
  - [ ] 저장 버튼

### 3.4 UI 테스트 (1:1 매칭)
- [ ] `tests/e2e/content-processor.spec.ts` 업데이트
  - [ ] 전체 플로우 테스트 (입력 → AI 정리 → 저장)
  - [ ] 에러 시나리오 테스트
  - [ ] 로딩 상태 확인

**예상 시간**: 4-5시간

---

## Task 4: AI 퀴즈 생성 시스템 개선

### 📝 개요
기존 `generate-quiz` API 개선 + 퀴즈 풀 관리

### 4.1 API Route 개선
- [ ] `src/app/api/admin/generate-quiz/route.ts` 개선
  - [ ] 난이도 옵션 추가 (easy/medium/hard/mixed)
  - [ ] 문제 유형 옵션 추가
  - [ ] 생성된 문제를 `quiz_pools`에 저장
  - [ ] `generation_seed` 추가 (재현성)
  - [ ] 프롬프트 개선:
    ```
    - 다양한 오답 선택지 생성
    - 상세한 해설 포함
    - 개념 태그 자동 생성
    - 난이도별 문제 비율 조절
    ```

### 4.2 API 테스트 (1:1 매칭)
- [ ] `tests/api/generate-quiz.test.ts` 작성
  - [ ] 다양한 난이도 생성 테스트
  - [ ] 문제 유형별 생성 테스트
  - [ ] 퀴즈 풀 저장 확인 테스트

### 4.3 UI 개선
- [ ] `src/app/dashboard/admin/quizzes/page.tsx` 개선
  - [ ] 난이도 선택 드롭다운
  - [ ] 문제 유형 선택 체크박스
  - [ ] 문제 개수 선택 (5/10/15/20)
  - [ ] 생성된 문제 미리보기
  - [ ] 문제별 승인/거부/재생성 UI

**예상 시간**: 3-4시간

---

## Task 5: 랜덤 퀴즈 출제 시스템 구현

### 📝 개요
매 시도마다 다른 문제 조합 출제

### 5.1 랜덤 출제 로직 구현
- [ ] `src/app/api/quiz/[lessonId]/route.ts` 개선
  - [ ] 퀴즈 풀에서 랜덤 선택 로직
  - [ ] 학습자 수준별 난이도 조절
  - [ ] 틀린 문제 우선 재출제
  - [ ] 문제 중복 방지 (최근 N회 제외)

### 5.2 API 테스트 (1:1 매칭)
- [ ] `tests/api/quiz-random.test.ts` 작성
  - [ ] 랜덤 선택 검증
  - [ ] 중복 방지 테스트
  - [ ] 난이도 조절 테스트

### 5.3 학습자 UI
- [ ] `src/app/dashboard/learning/[lessonId]/quiz/page.tsx` 개선
  - [ ] 퀴즈 시작 화면
  - [ ] 문제 풀이 UI
  - [ ] 즉시 피드백 (정답/오답)
  - [ ] 해설 표시
  - [ ] 점수 및 리더보드 업데이트

**예상 시간**: 3-4시간

---

## Task 6: E2E 테스트 완성 및 통과

### 📝 개요
기존 E2E 테스트 실행 및 새 테스트 추가

### 6.1 기존 테스트 실행
- [ ] `npm run test:e2e` 실행
- [ ] `tests/e2e/basic-navigation.spec.ts` 통과 확인
- [ ] `tests/e2e/ai-features.spec.ts` 통과 확인

### 6.2 새 E2E 테스트 작성
- [ ] `tests/e2e/quiz-flow.spec.ts` 작성
  - [ ] 퀴즈 풀이 전체 플로우
  - [ ] 랜덤 출제 확인
  - [ ] 점수 업데이트 확인

### 6.3 성능 테스트
- [ ] 페이지 로드 시간 < 1초
- [ ] AI 처리 시간 < 15초
- [ ] 네비게이션 평균 < 800ms

**예상 시간**: 2-3시간

---

## Task 7: 문서화 및 배포 준비

### 7.1 README 수정
- [ ] `README.md` 업데이트
  - [ ] OpenAI GPT-4o → Google Gemini 1.5 Flash 수정
  - [ ] AI 기능 설명 추가
  - [ ] 환경 변수 가이드 업데이트

### 7.2 환경 변수 문서화
- [ ] `.env.example` 업데이트
  - [ ] GEMINI_API_KEY 설명 추가
  - [ ] 필수/선택 구분 명시

### 7.3 배포 체크리스트
- [ ] `npm run check-env` 통과
- [ ] `npm run build` 성공
- [ ] `npm run test:e2e` 모두 통과
- [ ] Supabase 마이그레이션 프로덕션 적용
- [ ] Vercel 환경 변수 설정
- [ ] Supabase Redirect URLs 설정

**예상 시간**: 1-2시간

---

## 📊 전체 진행 상황

### Phase 0: Requirements ✅
- [x] PRD 작성 완료

### Phase 0.5: Task List ✅
- [x] Task List 생성 완료

### Phase 1: Implementation
- [ ] Task 0.0: 초기 설정
- [ ] Task 1: 인증 재활성화
- [ ] Task 2: DB 스키마 확장
- [ ] Task 3: AI 콘텐츠 정리
- [ ] Task 4: AI 퀴즈 생성
- [ ] Task 5: 랜덤 퀴즈 출제
- [ ] Task 6: E2E 테스트
- [ ] Task 7: 문서화

### Phase 2: Testing
- [ ] 단위 테스트 통과
- [ ] E2E 테스트 통과

### Phase 3: Version
- [ ] 버전 태그 생성 (v1.0.0)

### Phase 4: Git + PR
- [ ] PR 생성
- [ ] 코드 리뷰
- [ ] Merge

### Phase 5: E2E
- [ ] 프로덕션 E2E 테스트

### Phase 6: Deploy
- [ ] Vercel 배포
- [ ] 배포 확인

---

## 🎯 완료 기준 (Definition of Done)

각 Task는 다음 조건을 만족해야 완료로 표시:
- ✅ 코드 작성 완료
- ✅ 1:1 테스트 파일 작성 완료
- ✅ 모든 테스트 통과
- ✅ ESLint 오류 없음
- ✅ 타입 에러 없음
- ✅ 코드 리뷰 완료 (선택)

---

## 📝 참고 사항

### 우선순위
1. **High**: Task 1, 2, 3, 4 (핵심 기능)
2. **Medium**: Task 5, 6 (개선 사항)
3. **Low**: Task 7 (문서화)

### 예상 총 소요 시간
- **최소**: 16시간
- **최대**: 23시간
- **평균**: 19시간

### 병렬 작업 가능
- Task 1과 Task 2는 독립적 (동시 진행 가능)
- Task 3와 Task 4는 독립적 (동시 진행 가능)

---

**생성일**: 2025-01-14
**다음 단계**: Task 0.0부터 시작하세요!
