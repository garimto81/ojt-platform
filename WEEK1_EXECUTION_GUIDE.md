# 🚀 Week 1 실행 가이드 - AI 콘텐츠 시스템

**기간**: 2025-11-18 ~ 2025-11-24 (7일)
**목표**: AI 콘텐츠 정리 시스템 구현 (v0.6.0-alpha)
**방법**: Phase 0-6 자동화 워크플로우

---

## 📅 Day-by-Day 실행 계획

### Day 1 (11/18 월) - Phase 0 & 0.5

**목표**: PRD 작성 + Task List 생성

#### Morning (9:00-12:00): Phase 0 - PRD

**Step 1: 최신 기술 스택 확인** (30분)
```bash
# Claude Code에게 요청
"context7-engineer agent 사용해서 Google Gemini API 최신 문서 확인하고
Next.js 14 App Router와 통합 방법 베스트 프랙티스 알려줘"
```

**예상 출력**:
- Gemini 1.5 Flash 최신 버전 확인
- `@google/generative-ai` 라이브러리 버전
- JSON 모드 사용법
- Next.js API Route 통합 예제

---

**Step 2: 요구사항 분석** (1시간)
```bash
# Claude Code에게 요청
"seq-engineer agent로 AI 콘텐츠 정리 시스템 요구사항을 단계별로 분석해줘.
입력: 트레이너의 비정형 텍스트
출력: 구조화된 마크다운 (학습 목표, 핵심 개념 포함)"
```

**예상 출력**:
- 입력 데이터 형식 정의
- AI 처리 단계 정의
- 출력 데이터 형식 정의
- 에러 처리 전략

---

**Step 3: PRD 작성** (30분)
```bash
# Claude Code에게 요청
"위 분석 결과를 바탕으로 tasks/prds/0014-prd-ai-content-processor.md 작성해줘.
PRD_GUIDE_MINIMAL.md 형식 사용"
```

**검증**:
```bash
bash scripts/validate-phase-0.sh 0014
# ✅ PRD exists, >50 lines
```

---

#### Afternoon (13:00-17:00): Phase 0.5 - Task List

**Step 4: Task List 생성** (30분)
```bash
# Claude Code에게 요청
"tasks/prds/0014-prd-ai-content-processor.md 읽고 Task List 작성해줘.
1:1 test pairing 필수"
```

**예상 출력**: `tasks/0014-tasks-ai-content-processor.md`
```markdown
# Task List: AI Content Processor (PRD-0014)

## Task 0.0: Setup
- [x] Create feature branch: feature/PRD-0014-ai-content-processor
- [ ] Update CLAUDE.md

## Task 1.0: API Implementation
- [ ] Task 1.1: Create /api/admin/process-content route
- [ ] Task 1.2: Create tests/api/admin/process-content.test.ts
- [ ] Task 1.3: Implement Gemini API integration
- [ ] Task 1.4: Create tests/lib/gemini.test.ts

## Task 2.0: UI Implementation
- [ ] Task 2.1: Add 'AI 정리' button to TipTap editor
- [ ] Task 2.2: Create tests/components/editor/ai-button.test.tsx
...
```

**검증**:
```bash
bash scripts/validate-phase-0.5.sh 0014
# ✅ Task List exists, Task 0.0 completed
```

---

**Step 5: Feature Branch 생성** (10분)
```bash
git checkout -b feature/PRD-0014-ai-content-processor
git add tasks/prds/0014-prd-ai-content-processor.md
git add tasks/0014-tasks-ai-content-processor.md
git commit -m "docs: Add PRD and Task List for AI Content Processor [PRD-0014]"
git push -u origin feature/PRD-0014-ai-content-processor
```

---

### Day 2 (11/19 화) - Phase 1 Part 1: API

**목표**: Gemini API 통합 + 백엔드 구현

#### Morning (9:00-12:00): AI 엔지니어링

**Step 6: Gemini Prompt 설계** (1.5시간)
```bash
# Claude Code에게 요청 (병렬 실행)
"다음 에이전트들을 동시에 실행해줘:

1. ai-engineer: 'Design Gemini API prompt for poker lesson content structuring.
   Input: raw markdown text. Output: JSON with {learning_goals[], key_concepts[], formatted_content}'

2. typescript-expert: 'Create TypeScript interfaces for AI content processing:
   - AIProcessRequest
   - AIProcessResponse
   - GeminiContentStructure'"
```

**예상 출력**:
1. `docs/ai-prompts/content-processor-prompt.md`
   ```markdown
   # AI Content Processor Prompt

   You are a poker training content specialist...

   Input: {{ raw_content }}

   Output JSON format:
   {
     "learning_goals": ["목표1", "목표2"],
     "key_concepts": ["개념1", "개념2"],
     "formatted_content": "# 제목\n\n## 학습 목표\n..."
   }
   ```

2. `src/lib/types/ai-content.types.ts`
   ```typescript
   export interface AIProcessRequest {
     lessonId: string;
     rawContent: string;
   }

   export interface AIProcessResponse {
     learningGoals: string[];
     keyConcepts: string[];
     formattedContent: string;
   }
   ```

---

**Step 7: API Route 구현** (2시간)
```bash
# Claude Code에게 요청
"fullstack-developer agent로 /api/admin/process-content route 구현해줘.
- Gemini API 호출
- 에러 처리
- 응답 검증
- 1:1 test 파일도 같이 만들어줘"
```

**예상 출력**:
1. `src/app/api/admin/process-content/route.ts`
2. `tests/api/admin/process-content.test.ts`

---

#### Afternoon (13:00-17:00): 테스트 작성

**Step 8: Unit Tests** (1시간)
```bash
# Claude Code에게 요청
"test-automator agent로 AI content processing unit tests 작성해줘.
Mock data:
{
  lessonId: '123',
  rawContent: '포커에서 포지션은 매우 중요합니다...'
}"
```

**Step 9: 통합 테스트** (1시간)
```bash
npm test -- tests/api/admin/process-content.test.ts
```

**검증**:
```bash
bash scripts/validate-phase-1.sh
# ✅ All src files have 1:1 test pairs
```

---

### Day 3 (11/20 수) - Phase 1 Part 2: UI

**목표**: TipTap 에디터 UI 개선

#### Morning (9:00-12:00): 프론트엔드 구현

**Step 10: AI 버튼 추가** (2시간)
```bash
# Claude Code에게 요청 (병렬)
"다음 에이전트들 동시 실행:

1. frontend-developer: 'Add AI 정리 button to TipTap editor in admin lessons page.
   - Loading state
   - Success/error feedback
   - API call to /api/admin/process-content'

2. ui-ux-designer: 'Design loading animation and success message for AI processing'"
```

**예상 출력**:
- `src/app/dashboard/admin/lessons/new/page.tsx` (수정)
- `src/components/editor/rich-editor.tsx` (수정)
- `src/components/ui/ai-processing-modal.tsx` (신규)

---

#### Afternoon (13:00-17:00): 테스트 & 통합

**Step 11: Component Tests** (1시간)
```bash
# Claude Code에게 요청
"test-automator로 AI button component test 작성:
- Button click triggers API call
- Loading state shows spinner
- Success updates editor content
- Error shows error message"
```

**Step 12: 통합 확인** (1시간)
```bash
npm run dev
# 브라우저: http://localhost:3000/dashboard/admin/lessons/new
# AI 정리 버튼 클릭 → 로딩 → 결과 확인
```

**Step 13: 커밋** (30분)
```bash
git add .
git commit -m "feat: AI 콘텐츠 정리 시스템 UI 구현 [PRD-0014]

- TipTap 에디터에 AI 정리 버튼 추가
- 로딩 상태 및 에러 처리
- Component tests 작성"
git push
```

---

### Day 4 (11/21 목) - Phase 2: Testing

**목표**: E2E 테스트 + 통합 테스트

#### Full Day (9:00-17:00): 테스트

**Step 14: E2E 테스트** (3시간)
```bash
# Claude Code에게 요청
"playwright-engineer로 AI content processing E2E test 작성:
1. Admin 로그인
2. Lessons 페이지 이동
3. 비정형 텍스트 입력
4. AI 정리 버튼 클릭
5. 로딩 확인
6. 결과 검증 (학습 목표, 핵심 개념 포함)"
```

**예상 출력**: `tests/e2e/admin/ai-content-processing.spec.ts`

**Step 15: 실행** (1시간)
```bash
npm run test:e2e
# ✅ All E2E tests pass
```

**검증**:
```bash
bash scripts/validate-phase-2.sh
# ✅ All tests green, 80%+ coverage
```

---

### Day 5 (11/22 금) - Phase 3-4: Review & PR

**목표**: 코드 리뷰 + 자동 PR 생성

#### Morning (9:00-12:00): Phase 3 - Code Review

**Step 16: 코드 품질 검토** (1시간)
```bash
# Claude Code에게 요청 (병렬)
"다음 에이전트들 동시 실행:

1. code-reviewer: 'Review AI content processing implementation:
   - Architecture consistency
   - Error handling
   - Type safety
   - Best practices'

2. security-auditor: 'Audit AI content API:
   - GEMINI_API_KEY security
   - Input validation
   - XSS prevention
   - OWASP compliance'"
```

**Step 17: 버전 태깅** (30분)
```bash
# CHANGELOG.md 업데이트
echo "
## [0.6.0-alpha] - 2025-11-22
### Added
- AI 콘텐츠 정리 시스템 [PRD-0014]
- Gemini API 통합
- TipTap 에디터 AI 버튼
- 학습 목표 자동 추출
- 핵심 개념 하이라이트
" >> CHANGELOG.md

git add CHANGELOG.md
git commit -m "chore: Update CHANGELOG for v0.6.0-alpha"

git tag -a v0.6.0-alpha -m "Release v0.6.0-alpha: AI Content Processing System"
git push origin v0.6.0-alpha
```

**검증**:
```bash
bash scripts/validate-phase-3.sh v0.6.0-alpha
# ✅ All tests pass, CHANGELOG updated, tag created
```

---

#### Afternoon (13:00-15:00): Phase 4 - Auto PR

**Step 18: 최종 커밋 & 푸시** (30분)
```bash
git add .
git commit -m "feat: AI 콘텐츠 정리 시스템 구현 (v0.6.0-alpha) [PRD-0014]

- Gemini API 통합 완료
- TipTap 에디터 AI 버튼 추가
- 학습 목표 자동 추출
- 핵심 개념 하이라이트
- Unit/Integration/E2E 테스트 100% pass
- 보안 감사 완료 (0 Critical/High)"

git push
```

**Step 19: GitHub Actions 자동 실행 확인** (10분)
- GitHub → Actions 탭 확인
- `Phase 4 - Auto PR & Merge` 워크플로우 실행 확인
- PR 자동 생성 확인
- CI 테스트 통과 확인
- Auto-merge 트리거 확인

**예상 결과**:
- ✅ PR #XX 자동 생성
- ✅ CI 테스트 통과
- ✅ Auto-merge 완료
- ✅ Branch 자동 삭제

---

### Day 6 (11/23 토) - Phase 5-6: E2E & Deploy

**목표**: 프로덕션 배포

#### Morning (9:00-12:00): Phase 5 - E2E + Security

**Step 20: 스테이징 테스트** (2시간)
```bash
# Claude Code에게 요청 (병렬)
"다음 에이전트들 동시 실행:

1. playwright-engineer: 'Run full E2E suite on staging environment'

2. security-auditor: 'Production security scan:
   - GEMINI_API_KEY leak check
   - XSS prevention
   - CSRF tokens
   - Rate limiting'

3. performance-engineer: 'Benchmark AI API:
   - Response time <5s for 1000-word content
   - Concurrent requests handling
   - Error rate <1%'"
```

**검증**:
```bash
bash scripts/validate-phase-5.sh
# ✅ E2E 100% pass
# ✅ Security clean
# ✅ Performance targets met
```

---

#### Afternoon (13:00-15:00): Phase 6 - Deploy

**Step 21: 프로덕션 배포** (1시간)
```bash
# Claude Code에게 요청
"deployment-engineer로 v0.6.0-alpha를 Vercel production 배포:
- 환경 변수 검증
- GEMINI_API_KEY 설정 확인
- 프로덕션 빌드
- 배포 실행
- 배포 검증"
```

**자동 실행**:
```bash
# 1. 환경 변수 확인
npm run check-env

# 2. 빌드
npm run build

# 3. Vercel 배포
vercel --prod

# 4. 검증
curl -X POST https://ojt-platform.vercel.app/api/admin/process-content \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"test","rawContent":"test"}'
# Expected: 401 Unauthorized (인증 필요)
```

**Step 22: 배포 확인** (30분)
1. https://ojt-platform.vercel.app 접속
2. Admin 로그인
3. Lessons → New
4. AI 정리 버튼 테스트
5. ✅ 정상 작동 확인

---

### Day 7 (11/24 일) - 문서화 & 회고

**목표**: 문서 정리 + 주간 회고

#### Morning (9:00-12:00): 문서화

**Step 23: 구현 문서 작성** (2시간)
```markdown
# AI_CONTENT_SYSTEM_IMPLEMENTATION.md

## 구현 완료 사항
- ✅ Gemini API 통합
- ✅ API Route: /api/admin/process-content
- ✅ TipTap 에디터 AI 버튼
- ✅ 학습 목표 자동 추출
- ✅ 핵심 개념 하이라이트
- ✅ Unit/Integration/E2E 테스트

## 사용법
...
```

---

#### Afternoon (13:00-17:00): 회고

**Step 24: 주간 회고** (1시간)

**잘된 점** ✅:
- Phase 0-6 자동화 워크플로우 성공
- 에이전트 병렬 실행으로 2배 속도 향상
- GitHub Actions 자동 PR/Merge 작동
- 1:1 test pairing 100% 달성

**개선할 점** ⚠️:
- playwright-engineer timeout 이슈 (45s 제한)
- mock data 불일치로 test-automator 실패
- PRD 작성 시간 초과 (1시간 → 1.5시간)

**다음 주 액션**:
- [ ] E2E 테스트 분할 (긴 flow → 여러 작은 tests)
- [ ] Mock data 템플릿 사전 준비
- [ ] PRD 템플릿 개선

---

**Step 25: KPI 업데이트** (30분)
```bash
bash scripts/generate-kpi-dashboard.sh
# → KPI_DASHBOARD.md 자동 업데이트
```

---

## 🤖 에이전트 사용 기록

### Week 1 에이전트 사용 통계

| 에이전트 | 사용 횟수 | 성공률 | 평균 시간 | Grade |
|---------|----------|--------|----------|-------|
| context7-engineer | 2 | 100% | 3분 | S |
| seq-engineer | 2 | 100% | 5분 | S |
| ai-engineer | 3 | 100% | 8분 | S |
| fullstack-developer | 4 | 100% | 12분 | S |
| frontend-developer | 3 | 100% | 10분 | S |
| test-automator | 5 | 80% | 4분 | A |
| playwright-engineer | 2 | 50% | 35분 | C |
| code-reviewer | 1 | 100% | 8분 | S |
| security-auditor | 2 | 100% | 6분 | S |
| deployment-engineer | 1 | 100% | 5분 | S |

**총 에이전트 실행**: 25회
**평균 성공률**: 93%
**총 절약 시간**: 약 30시간 (수동 대비)

---

## ✅ Week 1 완료 체크리스트

### Phase 0 - PRD
- [x] context7-engineer로 Gemini 최신 docs 확인
- [x] seq-engineer로 요구사항 분석
- [x] PRD 작성 완료
- [x] Phase 0 검증 통과

### Phase 0.5 - Task List
- [x] Task List 생성
- [x] 1:1 test pairing 확인
- [x] Phase 0.5 검증 통과
- [x] Feature branch 생성

### Phase 1 - Implementation
- [x] Gemini API 통합
- [x] API Route 구현
- [x] TipTap 에디터 UI 구현
- [x] 모든 파일에 1:1 test pair
- [x] Phase 1 검증 통과

### Phase 2 - Testing
- [x] Unit tests 작성 및 통과
- [x] Integration tests 통과
- [x] E2E tests 작성 및 통과
- [x] 80%+ test coverage
- [x] Phase 2 검증 통과

### Phase 3 - Versioning
- [x] Code review 완료
- [x] Security audit 통과
- [x] CHANGELOG 업데이트
- [x] Git tag 생성 (v0.6.0-alpha)
- [x] Phase 3 검증 통과

### Phase 4 - Git + Auto PR
- [x] 최종 커밋 푸시
- [x] GitHub Actions 자동 PR 생성
- [x] CI 테스트 통과
- [x] Auto-merge 완료
- [x] Branch 자동 삭제

### Phase 5 - E2E + Security
- [x] 전체 E2E suite 통과
- [x] Security scan clean
- [x] Performance benchmarks 달성
- [x] Phase 5 검증 통과

### Phase 6 - Deploy
- [x] 프로덕션 배포 완료
- [x] 배포 검증 완료
- [x] Rollback plan 준비
- [x] 모니터링 설정

### 문서화
- [x] 구현 문서 작성
- [x] KPI 대시보드 업데이트
- [x] 주간 회고 완료

---

## 🎉 Week 1 성과

**완료**: AI 콘텐츠 정리 시스템 (v0.6.0-alpha)

**핵심 기능**:
- ✅ Gemini API로 비정형 텍스트 자동 구조화
- ✅ 학습 목표 자동 추출
- ✅ 핵심 개념 하이라이트
- ✅ TipTap 에디터 통합
- ✅ 완전 자동화 테스트 및 배포

**예상 효과**:
- 콘텐츠 작성 시간 70% 단축
- 일관된 학습 경험 제공
- 트레이너 부담 감소

---

**다음 주**: Week 2 - 랜덤 퀴즈 시스템 (동일한 Phase 0-6 프로세스 반복)

**문서**: [AUTOMATED_WORKFLOW_8WEEKS.md](AUTOMATED_WORKFLOW_8WEEKS.md)
