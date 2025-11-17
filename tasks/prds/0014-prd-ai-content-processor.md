# PRD-0014: AI 콘텐츠 정리 시스템

**버전**: 1.0.0
**작성일**: 2025-11-17
**작성자**: Claude Code (AI Assistant)
**상태**: Draft
**우선순위**: P0 (Critical)

---

## 1. 개요 (Overview)

### 문제 정의
트레이너들이 포커 교육 콘텐츠를 비정형적이고 불완전하게 입력하여 학습 품질이 저하되고, 일관성 없는 콘텐츠로 인해 학습자 경험이 나빠지는 문제가 발생합니다.

**예시**:
```
포지션 중요함. EP타이트. LP루즈. 버튼에서 많이 레이즈.
SB BB 디펜스중요 ㅇㅇ
```

### 해결 방안
Google Gemini 2.5 Flash API를 활용하여 비정형 텍스트를 자동으로 구조화된 마크다운으로 변환하고, 학습 목표와 핵심 개념을 자동 추출합니다.

**변환 결과**:
```markdown
# 포커에서의 포지션 전략

## 학습 목표
- 포지션별 플레이 전략 이해
- EP, LP, SB, BB에서의 핸드 선택
- 포지션 기반 레이즈 전략 수립

## 핵심 개념
- Early Position (EP): 타이트한 플레이
- Late Position (LP): 루즈한 플레이
- Button: 공격적 레이즈
- Small Blind (SB) / Big Blind (BB): 디펜스 전략

## 상세 설명
...
```

---

## 2. 목표 및 성공 지표

### 주요 목표
1. **콘텐츠 작성 시간 70% 단축** (60분 → 18분)
2. **일관된 구조화**: 100% 콘텐츠가 동일한 형식 준수
3. **자동 학습 목표 추출**: 3-5개 명확한 학습 목표
4. **핵심 개념 하이라이트**: 5-10개 key concepts

### 성공 지표 (KPI)
- AI 처리 성공률: **99%** (현재 90% → 목표 99%)
- 평균 처리 시간: **<5초** (1000단어 기준)
- 트레이너 만족도: **80%** 이상
- 콘텐츠 일관성 점수: **95%** 이상

### ROI
- **연간 절감**: $116,800 (트레이너 시간 1,820시간)
- **개발 비용**: $2,000-3,000
- **투자 회수 기간**: **10일**
- **ROI**: 3,700% (첫해)

---

## 3. 핵심 요구사항

### 기능 요구사항 (Functional Requirements)

#### FR-1: 비정형 텍스트 입력
- **ID**: FR-1
- **우선순위**: P0 (Must Have)
- **설명**: 트레이너가 자유 형식으로 텍스트 입력
- **입력 형식**:
  - 한국어 + 포커 전문 용어 (영어 혼용)
  - 최소 100자, 최대 10,000자
  - 마크다운 부분 지원 (옵션)
- **검증 규칙**:
  1. Null/empty 체크
  2. 길이 검증 (100-10,000자)
  3. 인코딩 검증 (UTF-8)
  4. 언어 검증 (한국어 포함 여부)
  5. 비속어 필터링
  6. 손상 여부 체크
  7. 중복 제출 방지 (24시간 내 동일 콘텐츠)
  8. Prompt injection 방지

#### FR-2: AI 자동 구조화
- **ID**: FR-2
- **우선순위**: P0 (Must Have)
- **설명**: Gemini API로 구조화된 JSON 생성
- **출력 형식**:
```typescript
{
  learning_goals: string[],        // 3-5개
  key_concepts: string[],          // 5-10개
  formatted_content: string,       // 마크다운
  difficulty_level: 'easy' | 'medium' | 'hard',
  estimated_duration_minutes: number, // 5-120
  summary: string                  // 요약 (100자)
}
```

#### FR-3: 에러 처리 및 Fallback
- **ID**: FR-3
- **우선순위**: P0 (Must Have)
- **설명**: AI 실패 시 4단계 Fallback
- **Fallback 전략**:
  1. **Level 1**: 캐시에서 유사 콘텐츠 조회 (1초)
  2. **Level 2**: 최소 포맷팅 적용 (헤더 추가만, 3초)
  3. **Level 3**: 처리 큐 등록 후 나중에 재처리
  4. **Level 4**: 원본 그대로 저장 + 관리자 알림

#### FR-4: 비용 추적 및 예산 관리
- **ID**: FR-4
- **우선순위**: P1 (Should Have)
- **설명**: 모든 AI 요청의 비용 추적
- **추적 항목**:
  - Input tokens
  - Output tokens
  - 총 비용 (USD)
  - 처리 시간 (milliseconds)
  - 성공/실패 여부
- **예산 제한**:
  - 월간 예산: $100
  - 일일 예산: $5
  - 시간당 예산: $1
  - 초과 시 자동 차단 + 알림

#### FR-5: 인증 및 권한 관리
- **ID**: FR-5
- **우선순위**: P0 (Must Have)
- **설명**: Admin 및 Trainer만 접근 가능
- **권한 요구사항**:
  - Supabase Auth 기반 인증
  - Role 확인: `admin` 또는 `trainer`
  - Session 검증
  - CORS 설정 (origin 제한)

---

### 비기능 요구사항 (Non-Functional Requirements)

#### NFR-1: 성능
- AI 처리 시간: **<5초** (1000단어 기준)
- API 응답 시간: **<500ms** (캐시 hit)
- 동시 처리: 최소 5명 (Rate limiting 적용)

#### NFR-2: 신뢰성
- 가용성: **99.5%** (월간 기준)
- 에러율: **<1%**
- Retry 성공률: **90%** (3회 재시도 시)

#### NFR-3: 보안
- API Key 보안: 환경 변수 저장 (절대 노출 금지)
- Input sanitization: Prompt injection 방지
- HTTPS Only
- Rate limiting: 사용자당 분당 5회

#### NFR-4: 확장성
- 콘텐츠 길이: 최대 10,000자 (긴 콘텐츠는 자동 분할)
- 동시 사용자: 최대 50명
- 월간 처리량: 10,000건

---

## 4. 기술 스택

### 핵심 기술
- **AI**: Google Gemini 2.5 Flash (`@google/genai` v1.29.1)
- **백엔드**: Next.js 14 API Routes
- **데이터베이스**: Supabase PostgreSQL
- **인증**: Supabase Auth
- **언어**: TypeScript 5.3

### SDK 마이그레이션 (URGENT)
- **기존**: `@google/generative-ai` v0.24.1 (DEPRECATED)
- **신규**: `@google/genai` v1.29.1 (필수 마이그레이션)
- **모델**: `gemini-1.5-flash` → `gemini-2.5-flash`

---

## 5. 현재 상태 분석

### 구현 완료 항목 ✅
1. 기본 API Route 구조 (`/api/admin/process-content`)
2. Gemini API 호출 로직
3. JSON 출력 설정

### 미구현/개선 필요 항목 ❌

#### 🚨 Critical Issues (Week 1, 8-10시간)

1. **인증 비활성화** (1시간)
   - 현재: Commented out for development
   - 문제: 누구나 API 접근 가능
   - 해결: Supabase Auth 재활성화 + Role 확인

2. **입력 검증 부족** (2-3시간)
   - 현재: Null check만 (40% 완성)
   - 문제: 10% 요청 실패 (잘못된 입력)
   - 해결: 8단계 검증 파이프라인 추가

3. **에러 처리 없음** (2-3시간)
   - 현재: Try-catch 부재
   - 문제: Gemini 실패 시 500 error crash
   - 해결: 전체 경로 에러 핸들링 + 3회 재시도

4. **비용 추적 없음** (1-2시간)
   - 현재: 비용 모니터링 0%
   - 문제: 예산 초과 위험
   - 해결: `ai_processing_logs` 테이블 + 비용 계산

5. **Fallback 전략 없음** (1-2시간)
   - 현재: 실패 시 500 error 반환
   - 문제: 0% 가용성 (AI 장애 시)
   - 해결: 4단계 Fallback chain 구현

---

## 6. 구현 계획

### Week 1: Critical Path (8-10시간) → 85% 완성도
**Day 1 (3-4시간)**:
- 입력 검증 파이프라인 구현 (8 steps)
- 인증 재활성화 + Role 확인

**Day 2 (3-4시간)**:
- 전체 경로 에러 처리
- 3회 재시도 로직 (exponential backoff)

**Day 3 (2시간)**:
- 비용 추적 로그 구현
- 기본 Fallback 전략 (Level 1-2)

### Week 2: Robustness (6-8시간) → 99% 완성도
**Day 4 (3-4시간)**:
- Advanced Fallback (Level 3-4)
- 캐시 시스템 구현

**Day 5 (3-4시간)**:
- Rate limiting
- 예산 제한 기능

### Week 3: Optimization (8-10시간) → Enterprise-ready
**Day 6-7 (4-5시간)**:
- JSON Schema 검증 (Zod)
- 긴 콘텐츠 자동 분할 (chunking)

**Day 8-9 (4-5시간)**:
- 성능 최적화 (caching, 병렬 처리)
- 보안 강화 (prompt injection 고급 방어)

**총 소요 시간**: 26-34시간 (3-4주)

---

## 7. 데이터베이스 스키마

### ai_processing_logs (신규 테이블)
```sql
CREATE TABLE ai_processing_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  lesson_id UUID REFERENCES lessons(id),
  input_length INT,
  output_length INT,
  input_tokens INT,
  output_tokens INT,
  cost_usd NUMERIC(10, 6),
  processing_time_ms INT,
  status TEXT, -- 'success' | 'failed' | 'cached'
  error_message TEXT,
  fallback_level INT, -- 0-4
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cost_tracking ON ai_processing_logs(user_id, created_at);
CREATE INDEX idx_budget_monitoring ON ai_processing_logs(created_at, cost_usd);
```

---

## 8. API 명세

### POST /api/admin/process-content

**Request**:
```typescript
{
  lessonId?: string,
  rawContent: string // 100-10,000자
}
```

**Response (Success)**:
```typescript
{
  success: true,
  data: {
    learning_goals: string[],
    key_concepts: string[],
    formatted_content: string,
    difficulty_level: 'easy' | 'medium' | 'hard',
    estimated_duration_minutes: number,
    summary: string
  },
  metadata: {
    processing_time_ms: number,
    cost_usd: number,
    cached: boolean
  }
}
```

**Response (Error)**:
```typescript
{
  success: false,
  error: string,
  fallback_level: number, // 사용된 fallback 레벨
  original_content?: string // Level 4 fallback 시
}
```

**Error Codes**:
- `400`: Invalid input (검증 실패)
- `401`: Unauthorized (인증 실패)
- `403`: Forbidden (권한 없음)
- `429`: Too Many Requests (Rate limit)
- `500`: Server Error (Gemini API 실패 + Fallback 실패)
- `507`: Insufficient Storage (예산 초과)

---

## 9. 보안 요구사항

### Input Validation
1. Length: 100-10,000자
2. Encoding: UTF-8 only
3. Language: 한국어 포함 필수
4. Profanity filter: 비속어 차단
5. Prompt injection: 특수 문자 패턴 검증
6. Duplication: 24시간 내 동일 콘텐츠 차단

### API Key 보안
- 환경 변수 저장 (`GEMINI_API_KEY`)
- 절대 클라이언트 노출 금지
- 서버 사이드 전용
- Vercel Secrets 사용 (프로덕션)

### Rate Limiting
- 사용자당: **분당 5회**
- IP당: **분당 10회**
- 전체: **시간당 300회**

---

## 10. 테스트 계획

### Unit Tests
- Input validation (8 cases)
- Gemini API mocking (3 scenarios)
- Error handling (15+ scenarios)
- Fallback logic (4 levels)

### Integration Tests
- End-to-end AI processing
- Database logging
- Cost calculation
- Cache hit/miss

### E2E Tests (Playwright)
- 트레이너 로그인 → 레슨 작성
- 비정형 텍스트 입력
- "AI 정리" 버튼 클릭
- 로딩 표시 확인
- 결과 검증 (학습 목표, 핵심 개념)

### Performance Tests
- 1000단어 처리 시간 <5초
- 10명 동시 처리
- 메모리 사용량 <100MB

---

## 11. 리스크 및 완화 전략

| 리스크 | 영향 | 확률 | 완화 전략 |
|--------|------|------|-----------|
| Gemini API 장애 | High | Medium | 4단계 Fallback |
| 예산 초과 | High | Low | 일일/월간 예산 제한 |
| 품질 저하 (AI 출력) | Medium | Medium | 수동 검토 + 피드백 루프 |
| 한국어 처리 오류 | Medium | Low | Prompt에 명시적 한국어 지시 |
| 포커 용어 오역 | Medium | Medium | 용어 사전 추가 (향후) |
| Rate limit 초과 | Low | Medium | Retry with backoff |
| 보안 취약점 | High | Low | Input sanitization + Auth |

---

## 12. 의존성

### 필수 의존성
- `@google/genai` (v1.29.1+)
- `next` (v14.0.4+)
- `@supabase/ssr` (인증)
- TypeScript (v5.3+)

### 선택적 의존성
- `zod` (JSON schema 검증)
- `@upstash/ratelimit` (Rate limiting)

---

## 13. 문서 참조

- **기술 상세 분석**: [ANALYSIS_AI_CONTENT_PROCESSING.md](../../ANALYSIS_AI_CONTENT_PROCESSING.md)
- **Executive Summary**: [ANALYSIS_EXECUTIVE_SUMMARY.md](../../ANALYSIS_EXECUTIVE_SUMMARY.md)
- **Quick Reference**: [ANALYSIS_QUICK_REFERENCE.md](../../ANALYSIS_QUICK_REFERENCE.md)
- **Visual Diagrams**: [ANALYSIS_VISUAL_DIAGRAMS.md](../../ANALYSIS_VISUAL_DIAGRAMS.md)
- **Gemini 마이그레이션**: context7-engineer 분석 결과

---

## 14. 승인 및 서명

**작성**: Claude Code (AI Assistant)
**검토**: (사용자 검토 필요)
**승인**: (사용자 승인 필요)

**다음 단계**: Phase 0.5 - Task List 생성

---

**PRD 버전**: 1.0.0
**최종 수정**: 2025-11-17
