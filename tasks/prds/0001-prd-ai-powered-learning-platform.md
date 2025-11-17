# PRD-0001: AI 기반 온보딩 학습 플랫폼

**프로젝트명**: GG Production Knowledge Platform
**작성일**: 2025-01-13
**수정일**: 2025-01-17
**버전**: 3.0.0
**상태**: 개선사항 반영 (현실적 목표, AI 품질 보장, 비용 관리)

---

## 📋 문제 정의

### 현재 상황
GG Production의 포커 프로덕션 신규 입사자 온보딩 과정에서:
- 기존 온보딩 기간: **21일**
- 현장 투입률: 70% (30%는 재교육 필요)
- 트레이너 1명당 교육 인원: 최대 3명
- 콘텐츠 관리 문제: **체계화되지 않은 교육 자료**
- 평가 문제 부족: 수동으로 문제 제작 (트레이너 부담 ↑)

### 핵심 과제 (Core Challenges)

#### 🎯 **과제 1: AI 콘텐츠 정리 시스템**
**문제**: 트레이너들이 교육 자료를 작성할 때 체계적이지 않거나 정리되지 않은 형태로 입력
- 형식이 일관되지 않음 (문서마다 다른 구조)
- 핵심 내용과 부수적 내용이 섞여있음
- 중복된 설명이나 불필요한 내용 포함
- 학습 목표가 불명확

**해결**: **개떡같이 입력해도 찰떡같이 정리**
- AI가 입력된 콘텐츠를 분석하여 자동 구조화
- 학습 목표 자동 추출
- 핵심 개념 하이라이트
- 일관된 포맷으로 변환
- 난이도 자동 분류

**기대 효과**:
- 트레이너 콘텐츠 작성 시간 70% 단축
- 학습 콘텐츠 품질 일관성 확보
- 신규 트레이너도 쉽게 콘텐츠 작성 가능

#### 🎯 **과제 2: AI 랜덤 퀴즈 생성 시스템**
**문제**: 퀴즈 문제 제작에 많은 시간과 노력 필요
- 트레이너가 수동으로 문제 작성 (레슨당 1-2시간)
- 문제 풀이 다양성 부족 (고정된 문제)
- 난이도 조절 어려움
- 문제 은행 부족

**해결**: **정리된 콘텐츠 기반 지능형 퀴즈 자동 생성**
- AI가 정리된 레슨 콘텐츠를 분석
- 핵심 개념 기반 문제 자동 생성
- 다양한 문제 유형 지원 (객관식, O/X, 단답형)
- 난이도별 문제 생성 (쉬움/보통/어려움)
- 매번 다른 문제 조합 (랜덤 출제)
- 상세한 해설 자동 생성

**기대 효과**:
- 퀴즈 제작 시간 90% 단축
- 무한한 문제 변형 가능
- 학습자별 맞춤형 난이도 제공
- 반복 학습 시 지루함 해소

---

## 🎯 프로젝트 목표

### 단계별 목표 (Phase-based Goals)

#### Phase 1: Pilot (1-2개월, 트레이너 3명, 학습자 10명)
- **온보딩 기간**: 21일 → **18일** (14% 단축) - 보수적 목표
- **콘텐츠 작성 시간**: 30분 → **15분** (50% 단축)
- **퀴즈 제작 시간**: 60분 → **30분** (50% 단축)
- **베이스라인 데이터 수집**: 트레이너 만족도, AI 품질, 비용
- **성공 기준**: 크리티컬 버그 0건, 만족도 3.5/5.0 이상

#### Phase 2: Validation (2-3개월, 전체 트레이너)
- **온보딩 기간**: 18일 → **14일** (33% 누적 단축)
- **현장 투입률**: 70% → **80%** (14% 향상)
- **트레이너 생산성**: 3명 → **5명** 동시 교육
- **A/B 테스트**: AI 정리 vs 수동 작성 학습 효과 비교
- **성공 기준**: 통계적 유의미한 개선 (p < 0.05)

#### Phase 3: Optimization (3-6개월, 전사 확대)
- **온보딩 기간**: 14일 → **10일** (52% 최종 단축)
- **현장 투입률**: 80% → **90%** (29% 최종 향상)
- **트레이너 생산성**: 5명 → **8명** 동시 교육
- **콘텐츠 작성**: **60-70% 단축** (검증된 목표)
- **퀴즈 제작**: **80-90% 단축** (검증된 목표)
- **성공 기준**: ROI > 200%, NPS > 50

### 정성적 목표
- 📚 체계적이고 일관된 학습 경험 제공
- 🤖 AI로 트레이너 업무 부담 최소화 (품질 검증 유지)
- 🎮 게임화 + 간격 반복(SRS)으로 장기 기억 강화
- 📊 실시간 진행률 추적 및 분석
- 💰 투명한 AI 비용 관리 (월 예산 $500 이하)

---

## 🏗️ 시스템 아키텍처

### AI 기능 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                    트레이너 입력 레이어                      │
│  "개떡같이" 입력된 콘텐츠 (비정형, 중복, 불명확)             │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│              🤖 AI 콘텐츠 정리 엔진 (Gemini)                 │
│                                                               │
│  1. 구조 분석 & 재구성                                        │
│     - 제목, 부제목 자동 추출                                  │
│     - 학습 목표 식별                                          │
│     - 핵심 개념 하이라이트                                    │
│                                                               │
│  2. 품질 향상                                                 │
│     - 중복 내용 제거                                          │
│     - 일관된 톤 앤 매너 적용                                  │
│     - 포맷 표준화 (마크다운)                                  │
│                                                               │
│  3. 메타데이터 생성                                           │
│     - 난이도 자동 분류                                        │
│     - 예상 학습 시간 계산                                     │
│     - 태그 자동 생성                                          │
│                                                               │
│  4. 🆕 품질 보장 시스템 (NEW)                                 │
│     - 신뢰도 점수 계산 (0-100%)                               │
│     - 변경사항 diff 생성                                      │
│     - 도메인 용어 검증 (포커 용어 사전)                       │
│     - PII 자동 감지 및 차단                                   │
│     - 처리 실패 시 폴백 전략                                  │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                "찰떡같이" 정리된 레슨 콘텐츠                  │
│          (구조화, 일관성, 명확한 학습 목표)                   │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│            🤖 AI 퀴즈 생성 엔진 (Gemini)                      │
│                                                               │
│  1. 콘텐츠 분석                                               │
│     - 핵심 개념 추출 (NLP)                                    │
│     - 중요도 점수 계산                                        │
│     - 관계 분석 (개념 간 연결)                                │
│                                                               │
│  2. 문제 생성 전략                                            │
│     - 유형 선택 (객관식/O/X/단답형)                           │
│     - 난이도 설정 (쉬움/보통/어려움)                          │
│     - 오답 생성 (그럴듯한 선택지)                             │
│                                                               │
│  3. 품질 검증                                                 │
│     - 모호성 검사                                             │
│     - 정답 확률 분석                                          │
│     - 해설 자동 생성                                          │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│         📝 🆕 지능형 퀴즈 출제 시스템 (SRS 알고리즘)          │
│                                                               │
│  1. 문제 선택 전략 (하이브리드 방식)                          │
│     - 40%: 복습 문제 (이전 오답, 간격 반복)                   │
│     - 30%: 중간 난이도 신규 문제 (핵심 학습)                  │
│     - 20%: 쉬운 문제 (자신감 부여)                            │
│     - 10%: 어려운 문제 (도전 과제)                            │
│                                                               │
│  2. 간격 반복 (Spaced Repetition System)                      │
│     - SuperMemo SM-2 알고리즘 적용                            │
│     - 틀린 문제: 1일 후 재출제                                │
│     - 맞춘 문제: 3일 → 7일 → 14일 → 30일                      │
│     - Ease Factor 개인화 (학습자별 최적화)                    │
│                                                               │
│  3. 적응형 난이도 조절                                        │
│     - 정답률 80% 이상: 난이도 상승                            │
│     - 정답률 50% 이하: 난이도 하락                            │
│     - 3회 연속 오답: 기초 개념 재학습 권장                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 기술 스택

### Frontend
- **Next.js 14** (App Router, Server Components)
- **TypeScript 5.3** (타입 안정성)
- **Tailwind CSS** (WSOP 브랜드 테마)
- **TipTap Editor** (Rich Text Editor - 콘텐츠 입력)
- **React Markdown** (콘텐츠 렌더링)

### Backend
- **Supabase** (PostgreSQL, Auth, Real-time)
- **Row Level Security** (데이터 보안)
- **API Routes** (Next.js Server Actions)

### AI 통합
- **Google Gemini API** (Gemini 1.5 Pro)
  - 콘텐츠 정리 엔진
  - 퀴즈 생성 엔진
- **Structured JSON Output** (파싱 안정성)
- **프롬프트 엔지니어링** (최적화된 프롬프트)

---

## 👤 사용자 스토리

### 트레이너 (Trainer)

#### Story 1: AI 콘텐츠 정리
```
AS A 트레이너
I WANT TO 대충 작성한 교육 자료를 AI가 자동으로 정리해주길
SO THAT 콘텐츠 작성 시간을 절약하고 품질을 일관되게 유지할 수 있다

ACCEPTANCE CRITERIA:
✅ 비정형 텍스트를 입력하면 구조화된 마크다운으로 변환
✅ 학습 목표가 자동으로 추출되어 상단에 표시
✅ 핵심 개념이 하이라이트되어 강조 표시
✅ 예상 학습 시간이 자동 계산
✅ 일관된 톤 앤 매너로 문장 재구성
```

#### Story 2: AI 퀴즈 자동 생성
```
AS A 트레이너
I WANT TO 레슨 콘텐츠 기반으로 퀴즈가 자동 생성되길
SO THAT 문제 제작 시간을 절약하고 다양한 문제를 제공할 수 있다

ACCEPTANCE CRITERIA:
✅ "퀴즈 생성" 버튼 클릭으로 5-20개 문제 자동 생성
✅ 난이도별 문제 비율 조절 가능
✅ 다양한 유형 (객관식, O/X, 단답형) 생성
✅ 각 문제에 상세한 해설 포함
✅ 생성된 문제 미리보기 및 수정 가능
✅ 부적절한 문제 제거 및 재생성 가능
```

### 학습자 (Trainee)

#### Story 3: 체계적인 학습
```
AS A 학습자
I WANT TO 명확하고 체계적인 콘텐츠로 학습하길
SO THAT 혼란 없이 효율적으로 배울 수 있다

ACCEPTANCE CRITERIA:
✅ 모든 레슨이 일관된 구조 (학습 목표 → 핵심 내용 → 요약)
✅ 핵심 개념이 시각적으로 강조
✅ 예상 학습 시간 표시
✅ 이해하기 쉬운 설명
```

#### Story 4: 다양한 퀴즈 경험
```
AS A 학습자
I WANT TO 매번 다른 문제로 퀴즈를 풀길
SO THAT 암기가 아닌 진짜 이해를 테스트할 수 있다

ACCEPTANCE CRITERIA:
✅ 동일 레슨 재시도 시 다른 문제 출제
✅ 내 수준에 맞는 난이도 문제 제공
✅ 틀린 문제는 해설과 함께 복습 기회 제공
✅ 정답/오답 즉시 피드백
```

---

## 📊 데이터베이스 스키마

### 핵심 테이블

#### `lessons` (레슨)
```sql
- id: UUID
- title: TEXT (AI 생성 제목)
- content: TEXT (AI 정리된 마크다운)
- raw_content: TEXT (원본 입력 내용)
- learning_objectives: TEXT[] (AI 추출 학습 목표)
- key_concepts: TEXT[] (AI 추출 핵심 개념)
- difficulty_level: TEXT (AI 분류: easy/medium/hard)
- estimated_duration: INTEGER (AI 계산 학습 시간)
- ai_processed: BOOLEAN (AI 정리 완료 여부)
- ai_processed_at: TIMESTAMP (AI 처리 시각)
- ai_confidence_score: DECIMAL(5,2) -- 🆕 AI 신뢰도 점수 (0-100)
```

#### `lesson_versions` (레슨 버전 관리) -- 🆕 새 테이블
```sql
- id: UUID PRIMARY KEY
- lesson_id: UUID REFERENCES lessons(id)
- version: INTEGER
- content: TEXT
- raw_content: TEXT
- ai_processed: BOOLEAN
- change_summary: TEXT -- "AI로 구조 개선", "트레이너 수동 수정"
- created_by: UUID REFERENCES profiles(id)
- created_at: TIMESTAMP
- UNIQUE(lesson_id, version)
```

#### `quizzes` (퀴즈)
```sql
- id: UUID
- lesson_id: UUID
- question: TEXT (AI 생성 문제)
- question_type: TEXT (multiple_choice/true_false/short_answer)
- options: JSONB (선택지 배열)
- correct_answer: TEXT
- explanation: TEXT (AI 생성 해설)
- difficulty: TEXT (easy/medium/hard)
- concept_tags: TEXT[] (연관 개념)
- points: INTEGER
- ai_generated: BOOLEAN (AI 생성 여부)
- generation_seed: TEXT (재현성 보장)
```

#### `user_question_history` (SRS 이력 추적) -- 🆕 새 테이블
```sql
- id: UUID PRIMARY KEY
- user_id: UUID REFERENCES profiles(id)
- question_id: UUID REFERENCES quizzes(id)
- attempts: INTEGER DEFAULT 0
- consecutive_correct: INTEGER DEFAULT 0
- last_attempt_at: TIMESTAMP
- next_review_at: TIMESTAMP -- SRS: 다음 복습 시점
- ease_factor: DECIMAL(3,2) DEFAULT 2.5 -- SM-2 알고리즘
- interval_days: INTEGER DEFAULT 1
- UNIQUE(user_id, question_id)
```

#### `ai_processing_logs` (AI 처리 로깅) -- 🆕 새 테이블
```sql
- id: UUID PRIMARY KEY
- entity_type: TEXT -- 'lesson' | 'quiz'
- entity_id: UUID
- operation: TEXT -- 'content_cleanup' | 'quiz_generation'
- input_text: TEXT
- output_text: TEXT
- model_used: TEXT -- 'gemini-1.5-flash'
- confidence_score: DECIMAL(5,2)
- processing_time_ms: INTEGER
- tokens_used: INTEGER
- cost_usd: DECIMAL(10,4) -- 🆕 비용 추적!
- status: TEXT -- 'success' | 'failed' | 'partial'
- error_message: TEXT
- created_at: TIMESTAMP DEFAULT NOW()
```

#### `content_creation_metrics` (측정 지표) -- 🆕 새 테이블
```sql
- id: UUID PRIMARY KEY
- trainer_id: UUID REFERENCES profiles(id)
- lesson_id: UUID REFERENCES lessons(id)
- started_at: TIMESTAMP
- saved_at: TIMESTAMP
- duration_minutes: INTEGER -- 자동 계산
- ai_used: BOOLEAN
- edit_count: INTEGER -- AI 결과 수정 횟수
- final_word_count: INTEGER
- satisfaction_score: INTEGER -- 1-5 트레이너 평가
```

#### `poker_glossary` (포커 용어 사전) -- 🆕 새 테이블
```sql
- term: TEXT PRIMARY KEY -- 'Flop', 'Turn', 'River'
- definition: TEXT
- aliases: TEXT[] -- ['플랍', '턴', '리버']
- context_examples: TEXT[]
- category: TEXT -- 'betting', 'hands', 'positions'
```

---

## 🎨 UI/UX 플로우

### 트레이너: AI 콘텐츠 정리 플로우

```
1. 레슨 작성 페이지 (/dashboard/admin/lessons/new)
   ↓
2. 텍스트 입력 (대충 작성해도 OK)
   - "포커 게임은 52장의 카드를 사용합니다.
      플레이어들은 각자 2장의 카드를 받고...
      뭐 그런 거 있잖아요. 아무튼 중요한 건..."
   ↓
3. "AI로 정리하기" 버튼 클릭
   ↓
4. 로딩 (3-5초) with 진행 상황 피드백
   [████████░░] 80% - "구조 재구성 중..."
   ↓
5. 🆕 신뢰도 점수 표시 + 정리된 결과 미리보기

   ┌─────────────────────────────────────────────┐
   │ AI 신뢰도: 92% ✅ (바로 저장 가능)           │
   │ 처리 시간: 4.2초 | 비용: $0.003            │
   └─────────────────────────────────────────────┘

   - 📋 학습 목표: "포커 게임의 기본 규칙 이해"
   - 📝 구조화된 콘텐츠:
     ## 포커 게임 기초
     포커는 52장의 표준 카드 덱을 사용하는 카드 게임입니다.

     ### 게임 진행 방식
     1. 각 플레이어는 2장의 홀 카드를 받습니다
     2. 5장의 커뮤니티 카드가 순차적으로 공개됩니다
     ...
   ↓
6. 🆕 변경사항 diff 보기 (원본 vs AI 정리본)
   [원본]                    [AI 정리본]
   "뭐 그런 거 있잖아요"  →  (삭제됨)
   (구조 없음)            →  ### 게임 진행 방식

   신뢰도 기준:
   - 90% 이상: ✅ 바로 저장 가능
   - 70-89%: ⚠️ 검토 권장 (변경사항 확인)
   - 70% 미만: ❌ 수동 편집 필수
   ↓
7. 수정 가능 (필요시) + 만족도 평가 (1-5)
   ↓
8. 저장 (버전 관리)
```

### 트레이너: AI 퀴즈 생성 플로우

```
1. 레슨 관리 페이지 (/dashboard/admin/lessons)
   ↓
2. 레슨 선택 → "퀴즈 생성" 버튼
   ↓
3. 퀴즈 생성 옵션 선택
   - 문제 개수: 5 / 10 / 15 / 20
   - 난이도: 쉬움 / 보통 / 어려움 / 혼합
   - 유형: 객관식 / O/X / 단답형 / 혼합
   ↓
4. "AI 생성 시작" 클릭
   ↓
5. 로딩 (10-30초)
   ↓
6. 생성된 문제 미리보기
   [문제 1] 포커 게임에서 사용하는 카드는 몇 장인가?
   A) 40장  B) 52장  C) 60장  D) 100장
   정답: B
   해설: 포커는 조커를 제외한 52장의 표준 카드 덱을 사용합니다.
   ↓
7. 문제별 승인/거부/재생성
   ↓
8. 최종 저장
```

### 학습자: 랜덤 퀴즈 풀이 플로우

```
1. 레슨 완료 후 "퀴즈 풀기" 버튼
   ↓
2. 시스템이 퀴즈 풀에서 랜덤 선택
   - 이전에 틀린 문제 우선
   - 난이도 자동 조절 (정답률 기반)
   ↓
3. 문제 풀이
   ↓
4. 즉시 피드백
   - ✅ 정답: "잘했어요! +10점"
   - ❌ 오답: "아쉽네요. 정답은 B입니다."
   - 📝 해설 표시
   ↓
5. 다음 문제 (총 5-10문제)
   ↓
6. 최종 결과
   - 정답률: 8/10 (80%)
   - 획득 포인트: 80점
   - 틀린 문제 복습하기
```

---

## 🚀 MVP 기능 범위

### Phase 1: AI 콘텐츠 정리 (우선순위 1)
- [ ] 🆕 AI 정리 API 엔드포인트 (`/api/admin/process-content`)
  - [ ] Gemini API 통합
  - [ ] 🆕 신뢰도 점수 계산 로직
  - [ ] 🆕 PII 자동 감지 및 제거
  - [ ] 프롬프트 최적화 (구조화, 학습 목표 추출)
- [ ] 레슨 작성 UI
  - [ ] 원본 vs 정리본 비교 (diff viewer)
  - [ ] 🆕 진행 상황 피드백 (프로그레스 바)
  - [ ] 🆕 만족도 평가 (1-5)
- [ ] 🆕 데이터 인프라
  - [ ] `lesson_versions` 테이블 (버전 관리)
  - [ ] `ai_processing_logs` 테이블 (로깅)
  - [ ] `content_creation_metrics` 테이블 (지표 수집)
  - [ ] `poker_glossary` 테이블 (용어 사전)

### Phase 2: AI 퀴즈 생성 (우선순위 2)
- [ ] 퀴즈 생성 API 개선 (`/api/admin/generate-quiz`)
  - [ ] 난이도별 생성 알고리즘
  - [ ] 문제 검증 시스템 (모호성 검사)
  - [ ] 🆕 비용 추적 (tokens, cost_usd)
- [ ] 퀴즈 풀 관리 시스템
  - [ ] 🆕 캐싱 전략 (동일 콘텐츠 재생성 방지)
  - [ ] 문제 승인/거부 워크플로우

### Phase 3: 🆕 SRS 퀴즈 출제 시스템 (우선순위 3)
- [ ] 🆕 `user_question_history` 테이블 (SRS 이력)
- [ ] 🆕 SuperMemo SM-2 알고리즘 구현
  - [ ] 간격 반복 로직 (1일 → 3일 → 7일 → 14일)
  - [ ] Ease Factor 개인화
- [ ] 하이브리드 퀴즈 선택 알고리즘
  - [ ] 40% 복습 문제 (오답 우선)
  - [ ] 30% 중간 난이도 신규
  - [ ] 20% 쉬운 문제
  - [ ] 10% 어려운 문제
- [ ] 적응형 난이도 조절
  - [ ] 정답률 80% 이상 → 난이도 상승
  - [ ] 정답률 50% 이하 → 난이도 하락

### Phase 4: 🆕 비용 관리 & 모니터링 (우선순위 4)
- [ ] 🆕 비용 모니터링 대시보드
  - [ ] 실시간 API 비용 추적
  - [ ] 일일/월간 비용 리포트
  - [ ] 예산 초과 알림 시스템
- [ ] 🆕 캐싱 & Rate Limiting
  - [ ] Redis 캐싱 (SHA-256 해시 기반)
  - [ ] 트레이너당 시간당 제한
  - [ ] 폴백 전략 (대기열, 수동 편집)
- [ ] 🆕 운영 알림 시스템
  - [ ] AI 성능 저하 감지 (10초 초과)
  - [ ] 품질 저하 감지 (만족도 3.0 미만)
  - [ ] 슬랙/이메일 통합

### Phase 5: 분석 & 최적화 (우선순위 5)
- [ ] A/B 테스트 프레임워크
  - [ ] AI 정리 vs 수동 작성 학습 효과 비교
  - [ ] 통계적 유의성 검증 (p < 0.05)
- [ ] 학습 효과 분석 대시보드
  - [ ] 온보딩 기간 추적
  - [ ] 현장 투입률 측정
  - [ ] ROI 계산

---

## 📈 성공 지표 (Success Metrics)

### A. 콘텐츠 작성 효율성 (측정 가능)

**측정 방법**: 타이머 자동 기록 (`content_creation_metrics` 테이블)
- 레슨 작성 페이지 진입~저장 시간 측정
- AI 사용 vs 수동 작성 비교

| 지표 | 기존 (수동) | Phase 1 목표 | Phase 3 최종 |
|------|------------|-------------|-------------|
| 평균 작성 시간 | 30분 | 15분 (50% 단축) | 9-12분 (60-70% 단축) |
| 트레이너 만족도 | - | 3.5/5.0 | 4.0/5.0 |
| AI 결과 수용률 | - | 40-50% | 60-70% |
| 수정 횟수 | - | 평균 3회 | 평균 2회 이하 |
| 재처리율 | - | 20% | 10% 이하 |

**데이터 수집**:
```sql
SELECT
  AVG(duration_minutes) as avg_time,
  AVG(satisfaction_score) as avg_satisfaction,
  COUNT(*) FILTER (WHERE edit_count = 0) * 100.0 / COUNT(*) as acceptance_rate
FROM content_creation_metrics
WHERE ai_used = true
  AND created_at >= NOW() - INTERVAL '30 days';
```

### B. AI 품질 지표

| 지표 | Phase 1 목표 | Phase 3 최종 | 측정 방법 |
|------|-------------|-------------|----------|
| AI 신뢰도 점수 | 평균 75% | 평균 85% | `ai_confidence_score` 필드 |
| 트레이너 승인률 | 60% | 75% | 신뢰도 70% 이상 비율 |
| PII 감지율 | 100% | 100% | 처리 전 자동 스캔 |
| 처리 성공률 | 95% | 98% | `ai_processing_logs.status` |

### C. 퀴즈 생성 효율성

| 지표 | 기존 (수동) | Phase 1 목표 | Phase 3 최종 |
|------|------------|-------------|-------------|
| 퀴즈 제작 시간 | 60분 | 30분 (50% 단축) | 6-10분 (85-90% 단축) |
| 레슨당 문제 수 | 5-10개 | 20-30개 | 50+ 개 |
| 난이도 정확도 | - | 70% | 85% (실제 정답률 vs 예상) |
| 트레이너 승인률 | - | 60% | 80% |

### D. 학습 효과 (A/B 테스트)

**방법**: AI 정리 콘텐츠(Group A) vs 수동 작성(Group B)

| 지표 | Group A (AI) | Group B (수동) | 통계적 유의성 |
|------|-------------|---------------|-------------|
| 퀴즈 평균 점수 | 측정 예정 | 측정 예정 | p < 0.05 목표 |
| 학습 완료 시간 | 측정 예정 | 측정 예정 | - |
| 재시도율 | 측정 예정 | 측정 예정 | - |
| 학습자 만족도 | 측정 예정 | 측정 예정 | - |

### E. 비용 효율성

| 지표 | Phase 1 예산 | Phase 3 예산 | 측정 방법 |
|------|-------------|-------------|----------|
| 일일 API 비용 | < $10 | < $50 | `ai_processing_logs.cost_usd` 합계 |
| 레슨당 평균 비용 | $0.10 | $0.05 | 캐싱 최적화 |
| 트레이너당 시간 절감 | 2시간/주 | 10시간/주 | ROI 계산 |
| 전체 ROI | - | > 200% | (절감 시간 × 시급) / API 비용 |

---

## 🔐 보안 & 개인정보

### A. AI 전송 데이터 보호

**🆕 PII 자동 감지 시스템**:
```typescript
// AI 전송 전 개인정보 스캔
function sanitizeBeforeAI(content: string): {
  sanitized: string
  warnings: string[]
} {
  const patterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b\d{3}[-.]?\d{3,4}[-.]?\d{4}\b/g,
    ssn: /\b\d{6}-\d{7}\b/g,  // 주민번호
    card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g  // 카드번호
  }

  let warnings = []
  let sanitized = content

  for (const [type, regex] of Object.entries(patterns)) {
    if (regex.test(content)) {
      warnings.push(`${type} 감지됨 - AI 전송 차단`)
      sanitized = sanitized.replace(regex, '[REDACTED]')
    }
  }

  return { sanitized, warnings }
}
```

### B. API 보안

- **API 키 관리**: 환경 변수 (GEMINI_API_KEY), 서버 사이드만 사용
- **Rate Limiting**: 트레이너당 시간당 10회 (콘텐츠), 5회 (퀴즈)
- **비용 상한선**: 일일 $50 초과 시 자동 중단 + 관리자 알림
- **캐싱 전략**: 동일 콘텐츠 재처리 방지 (SHA-256 해시 기반)

### C. 퀴즈 정답 보호

```typescript
// ❌ 나쁜 예: 클라이언트에 정답 노출
const quiz = await fetch(`/api/quiz/${lessonId}`)  // includes correct_answer

// ✅ 좋은 예: 정답은 서버에서만
const quiz = await fetch(`/api/quiz/${lessonId}`)  // NO correct_answer
const result = await fetch('/api/quiz/submit', {
  method: 'POST',
  body: JSON.stringify({
    quiz_id: quiz.id,
    user_answer: selectedOption
  })
})  // 서버에서 정답 비교 후 결과만 반환
```

### D. 데이터 백업 & 버전 관리

- **원본 보존**: `lessons.raw_content` 필드에 항상 원본 저장
- **버전 관리**: `lesson_versions` 테이블로 모든 변경 이력 추적
- **롤백 가능**: AI 처리 결과가 잘못되면 이전 버전으로 복구

---

## 💰 비용 관리 & 모니터링 (NEW)

### A. AI API 비용 최적화

#### 캐싱 전략
```typescript
// 동일 콘텐츠 재처리 방지
const cacheKey = sha256(rawContent)
const cached = await redis.get(`ai:content:${cacheKey}`)
if (cached) {
  return JSON.parse(cached)  // 캐시된 결과 반환 (API 호출 없음)
}

// 퀴즈는 사전 생성 후 재사용 (실시간 생성 X)
const quizPool = await db.quizzes.findMany({
  where: { lesson_id, ai_generated: true }
})
if (quizPool.length >= 50) {
  return selectRandomQuestions(quizPool, 10)  // 캐시된 문제 사용
}
```

#### Rate Limiting
```typescript
const RATE_LIMITS = {
  content_processing: { max: 10, window: '1h' },  // 시간당 10회
  quiz_generation: { max: 5, window: '1h' },      // 시간당 5회
}

// 학습자는 사전 생성된 문제만 사용 (API 호출 없음)
```

#### 폴백 전략
```typescript
try {
  return await gemini.processContent(rawContent)
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // 대기열에 추가, 나중에 재시도
    await queue.add('ai-processing', { content: rawContent })
    return { status: 'queued', message: '처리 중입니다. 잠시 후 확인하세요.' }
  }

  // 완전 실패 시 수동 편집으로 안내
  return {
    status: 'failed',
    fallback: 'manual_edit',
    message: 'AI 처리 실패. 수동으로 작성해주세요.'
  }
}
```

### B. 비용 모니터링 대시보드

**실시간 지표**:
```typescript
interface CostMetrics {
  daily_api_calls: number
  daily_cost_usd: number
  cost_per_user: number
  cost_per_lesson: number
  budget_alert_threshold: number  // $50/일 초과 시 알림
  projected_monthly_cost: number
}
```

**알림 시스템**:
```typescript
interface OperationalAlerts {
  // AI 성능 저하 감지
  ai_latency_alert: {
    threshold: 10,  // 초
    action: "슬랙 알림 + 대기열 전환"
  },

  // 비용 초과 감지
  cost_alert: {
    daily_budget: 50,  // USD
    action: "관리자 이메일 + AI 기능 일시 중단"
  },

  // 품질 저하 감지
  quality_alert: {
    satisfaction_below: 3.0,  // 5점 만점
    retry_rate_above: 0.3,    // 30%
    action: "프롬프트 재검토 필요"
  }
}
```

---

## 🚀 배포 전략 (Rollout Plan) (NEW)

### Week 1-2: Internal Alpha
- **대상**: 트레이너 2명, 학습자 5명
- **목표**: 버그 발견, 워크플로우 검증
- **성공 기준**: 크리티컬 버그 0건
- **Feature Flag**: `alpha_testers` 그룹만 활성화

### Week 3-4: Closed Beta
- **대상**: 트레이너 5명, 학습자 20명
- **목표**: 사용성 개선, AI 품질 검증
- **성공 기준**: 만족도 3.5/5.0 이상
- **모니터링**: 일일 비용 < $10

### Week 5-6: Open Beta
- **대상**: 모든 트레이너, 학습자 50명
- **목표**: 스케일 테스트, 비용 검증
- **성공 기준**: API 비용 < $30/day, 성능 저하 없음
- **A/B 테스트**: AI vs 수동 효과 비교

### Week 7+: General Availability
- **점진적 활성화**:
  - Day 1: 20% 트래픽
  - Day 3: 50% 트래픽
  - Day 7: 100% 트래픽
- **비상 스위치**: Feature flag로 AI 기능 온/오프 가능
- **모니터링**: 24/7 알림 시스템 가동

---

## 🎯 로드맵

### Q1 2025: AI 기반 콘텐츠 관리 (현재)
- ✅ AI 콘텐츠 정리 시스템 (개발 완료)
- ✅ AI 퀴즈 생성 시스템 (기본 버전)
- 🔄 랜덤 출제 알고리즘 (개발 중)

### Q2 2025: 지능형 학습 최적화
- 적응형 난이도 시스템
- 개인화된 학습 경로
- 실시간 피드백 개선

### Q3 2025: 고급 AI 기능
- 멀티모달 콘텐츠 처리 (이미지, 비디오)
- 음성 인식 퀴즈
- AI 튜터 챗봇

---

## 📎 참고 문서

- [CLAUDE.md](../CLAUDE.md) - 개발 가이드
- [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) - 프로젝트 현황
- [DATABASE_SETUP.md](../DATABASE_SETUP.md) - DB 스키마 상세
- [AI Integration Guide](../docs/AI_INTEGRATION.md) - AI API 사용법 (예정)

---

**작성자**: Claude Code
**리뷰어**: -
**승인자**: -
**다음 단계**: Phase 1 Task 생성 (`python scripts/generate_tasks.py`)

---

## 📝 변경 이력 (Change Log)

### v3.0.0 (2025-01-17) - 개선사항 반영
**주요 변경**:
- ✅ **현실적인 목표 설정**: 21일→7일에서 21일→10일로 조정 (3단계 목표)
- ✅ **AI 품질 보장 시스템**: 신뢰도 점수, 검증 워크플로우, PII 감지 추가
- ✅ **SRS 알고리즘**: SuperMemo SM-2 기반 간격 반복 학습 시스템 추가
- ✅ **DB 스키마 강화**: 7개 새 테이블/필드 추가 (버전 관리, 로깅, SRS 이력)
- ✅ **비용 관리**: 캐싱, Rate Limiting, 모니터링 대시보드 추가
- ✅ **측정 가능한 지표**: 구체적인 측정 방법과 SQL 쿼리 예시 포함
- ✅ **배포 전략**: 7주 점진적 롤아웃 플랜 추가

**새로 추가된 테이블**:
1. `lesson_versions` - 콘텐츠 버전 관리
2. `user_question_history` - SRS 이력 추적
3. `ai_processing_logs` - AI 처리 로깅 및 비용 추적
4. `content_creation_metrics` - 콘텐츠 작성 지표 수집
5. `poker_glossary` - 포커 용어 사전

**개선된 필드**:
- `lessons.ai_confidence_score` - AI 신뢰도 점수 (0-100)

**개선 이유**:
- 심층 분석 결과, 비현실적 목표/AI 품질 보장 부재/비용 관리 누락 등 발견
- 실무 적용 가능성을 높이기 위한 데이터 기반 의사결정 체계 추가
- 학습 과학 이론(SRS) 반영으로 교육 효과 극대화

### v2.0.0 (2025-01-13) - 핵심 기능 재정의
- AI 콘텐츠 정리 시스템 정의
- AI 퀴즈 생성 시스템 정의
- 기본 DB 스키마 설계

### v1.0.0 (초기 버전)
- 기본 PRD 작성
