# Task List: AI Content Processor (PRD-0014)

**PRD Reference**: [tasks/prds/0014-prd-ai-content-processor.md](prds/0014-prd-ai-content-processor.md)
**Feature Branch**: `feature/PRD-0014-ai-content-processor`
**Target Version**: v0.6.0-alpha
**Total Estimated Time**: 26-34 hours (3 weeks)

---

## Progress Overview

| Week | Phase | Tasks | Estimated | Status |
|------|-------|-------|-----------|--------|
| Week 1 | Critical Path | Task 1.0-3.0 | 8-10h | ⏳ |
| Week 2 | Robustness | Task 4.0-5.0 | 6-8h | ⏳ |
| Week 3 | Optimization | Task 6.0-7.0 | 8-10h | ⏳ |
| Testing | Validation | Task 8.0 | 4-6h | ⏳ |

**Total**: 26-34 hours

---

## Task 0.0: Setup ✅

- [x] Create feature branch: `feature/PRD-0014-ai-content-processor`
- [x] Update CLAUDE.md with project context
- [x] Create PRD document (438 lines)

**Status**: Completed
**Duration**: 30 minutes

---

## Task 1.0: Week 1 Day 1 - Input Validation & Auth (3-4h) 🔴 Critical

### Task 1.1: SDK Migration to @google/genai
**Duration**: 1 hour
**Priority**: P0 (URGENT - Deprecated SDK)

- [ ] Install `@google/genai` v1.29.1
- [ ] Uninstall deprecated `@google/generative-ai` v0.24.1
- [ ] Update import statements in all AI-related files
- [ ] Migrate API initialization code
- [ ] Update model name: `gemini-1.5-flash` → `gemini-2.5-flash`
- [ ] Test API connectivity

**Implementation File**: `src/lib/gemini/client.ts` (new file)
**Test File**: `tests/lib/gemini/client.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ New SDK installed and working
- ✅ No references to old SDK remaining
- ✅ API calls return 200 status
- ✅ Test coverage >80%

---

### Task 1.2: Input Validation Pipeline (8 Steps)
**Duration**: 2 hours
**Priority**: P0

Implement 8-step validation as per FR-1:

1. [ ] Null/empty check
2. [ ] Length validation (100-10,000자)
3. [ ] Encoding validation (UTF-8)
4. [ ] Language validation (한국어 포함 여부)
5. [ ] Profanity filtering
6. [ ] Corruption check
7. [ ] Duplication prevention (24h window)
8. [ ] Prompt injection prevention

**Implementation File**: `src/lib/validation/content-validator.ts` (new file)
**Test File**: `tests/lib/validation/content-validator.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ All 8 validation steps implemented
- ✅ Clear error messages for each failure type
- ✅ Test coverage >90% (8+ test cases)

---

### Task 1.3: Authentication Re-activation
**Duration**: 30 minutes
**Priority**: P0 (SECURITY CRITICAL)

- [ ] Remove authentication bypass in `/api/admin/process-content/route.ts`
- [ ] Add Supabase Auth check
- [ ] Verify user session

**Implementation File**: `src/app/api/admin/process-content/route.ts` (existing)
**Test File**: `tests/api/admin/process-content/auth.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Returns 401 for unauthenticated requests
- ✅ Passes session validation
- ✅ Test coverage >80%

---

### Task 1.4: Role-Based Access Control
**Duration**: 30 minutes
**Priority**: P0 (SECURITY CRITICAL)

- [ ] Check user role (admin or trainer only)
- [ ] Return 403 for unauthorized roles

**Implementation File**: `src/lib/auth/role-check.ts` (new file)
**Test File**: `tests/lib/auth/role-check.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Returns 403 for trainee role
- ✅ Allows admin and trainer roles
- ✅ Test coverage >80%

---

## Task 2.0: Week 1 Day 2 - Error Handling (3-4h) 🔴 Critical

### Task 2.1: Complete Error Handling
**Duration**: 2 hours
**Priority**: P0

- [ ] Wrap all Gemini API calls in try-catch
- [ ] Handle network errors
- [ ] Handle API quota errors
- [ ] Handle malformed response errors
- [ ] Log all errors to console and database

**Implementation File**: `src/lib/gemini/error-handler.ts` (new file)
**Test File**: `tests/lib/gemini/error-handler.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ No unhandled promise rejections
- ✅ Graceful degradation on all error types
- ✅ Test coverage >85% (15+ error scenarios)

---

### Task 2.2: Retry Logic with Exponential Backoff
**Duration**: 1.5 hours
**Priority**: P0

- [ ] Implement 3 retry attempts
- [ ] Exponential backoff: 1s, 2s, 4s
- [ ] Skip retry for 4xx errors (client errors)
- [ ] Retry only on 5xx and network errors

**Implementation File**: `src/lib/utils/retry.ts` (new file)
**Test File**: `tests/lib/utils/retry.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Retries 3 times on transient failures
- ✅ Respects backoff timing
- ✅ Test coverage >80%

---

### Task 2.3: Error Response Standardization
**Duration**: 30 minutes
**Priority**: P1

- [ ] Define standard error response format
- [ ] Include error codes (400, 401, 403, 429, 500, 507)
- [ ] Return user-friendly error messages

**Implementation File**: `src/lib/utils/error-response.ts` (new file)
**Test File**: `tests/lib/utils/error-response.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Consistent error format across all endpoints
- ✅ Test coverage >80%

---

## Task 3.0: Week 1 Day 3 - Cost Tracking & Basic Fallback (2h) 🔴 Critical

### Task 3.1: Database Schema Migration
**Duration**: 30 minutes
**Priority**: P0

- [ ] Create `ai_processing_logs` table in Supabase
- [ ] Add indexes for cost tracking
- [ ] Test migration

**Implementation File**: `supabase/migrations/0015_ai_processing_logs.sql` (new file)
**Test File**: `tests/db/migrations/0015.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Table created successfully
- ✅ Indexes applied
- ✅ No migration errors

---

### Task 3.2: Cost Tracking Implementation
**Duration**: 1 hour
**Priority**: P1

- [ ] Calculate input/output tokens
- [ ] Calculate cost in USD (Gemini pricing)
- [ ] Log to `ai_processing_logs` table
- [ ] Track processing time

**Implementation File**: `src/lib/gemini/cost-tracker.ts` (new file)
**Test File**: `tests/lib/gemini/cost-tracker.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Accurate token counting
- ✅ Correct cost calculation
- ✅ Test coverage >80%

---

### Task 3.3: Basic Fallback (Level 1-2)
**Duration**: 30 minutes
**Priority**: P0

- [ ] **Level 1**: Cache lookup (check for identical content in last 24h)
- [ ] **Level 2**: Minimal formatting (add headers only, no AI)

**Implementation File**: `src/lib/fallback/basic-fallback.ts` (new file)
**Test File**: `tests/lib/fallback/basic-fallback.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Cache returns in <1s
- ✅ Minimal formatting in <3s
- ✅ Test coverage >80%

---

## Task 4.0: Week 2 Day 4 - Advanced Fallback & Cache (3-4h) 🟡 High

### Task 4.1: Advanced Fallback (Level 3-4)
**Duration**: 2 hours
**Priority**: P1

- [ ] **Level 3**: Queue for retry (background job)
- [ ] **Level 4**: Save original + admin alert

**Implementation File**: `src/lib/fallback/advanced-fallback.ts` (new file)
**Test File**: `tests/lib/fallback/advanced-fallback.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Queue system working
- ✅ Admin alerts sent
- ✅ Test coverage >75%

---

### Task 4.2: Cache System Implementation
**Duration**: 2 hours
**Priority**: P1

- [ ] Implement in-memory cache (Map)
- [ ] Set TTL to 24 hours
- [ ] Cache key: hash of raw content
- [ ] Return cached results in <500ms

**Implementation File**: `src/lib/cache/content-cache.ts` (new file)
**Test File**: `tests/lib/cache/content-cache.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Cache hit returns in <500ms
- ✅ Cache miss triggers AI processing
- ✅ Test coverage >80%

---

## Task 5.0: Week 2 Day 5 - Rate Limiting & Budget (3-4h) 🟡 High

### Task 5.1: Rate Limiting (User/IP/Global)
**Duration**: 2 hours
**Priority**: P1

- [ ] User-based: 5 requests/minute
- [ ] IP-based: 10 requests/minute
- [ ] Global: 300 requests/hour
- [ ] Return 429 when exceeded

**Implementation File**: `src/lib/rate-limit/limiter.ts` (new file)
**Test File**: `tests/lib/rate-limit/limiter.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Correctly blocks excess requests
- ✅ Returns 429 with Retry-After header
- ✅ Test coverage >80%

---

### Task 5.2: Budget Limiting (Daily/Monthly)
**Duration**: 2 hours
**Priority**: P1

- [ ] Daily budget: $5
- [ ] Monthly budget: $100
- [ ] Query current spend from `ai_processing_logs`
- [ ] Return 507 when budget exceeded

**Implementation File**: `src/lib/budget/budget-limiter.ts` (new file)
**Test File**: `tests/lib/budget/budget-limiter.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Blocks requests when budget exceeded
- ✅ Accurate spend calculation
- ✅ Test coverage >80%

---

## Task 6.0: Week 3 Day 6-7 - Schema & Chunking (4-5h) 🟢 Medium

### Task 6.1: JSON Schema Validation (Zod)
**Duration**: 2-3 hours
**Priority**: P2

- [ ] Install `zod` package
- [ ] Define schema for AI output
- [ ] Validate Gemini response against schema
- [ ] Return 500 if schema validation fails

**Implementation File**: `src/lib/validation/schema.ts` (new file)
**Test File**: `tests/lib/validation/schema.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Strict schema validation
- ✅ Clear error messages on validation failure
- ✅ Test coverage >80%

---

### Task 6.2: Long Content Chunking
**Duration**: 2 hours
**Priority**: P2

- [ ] Detect content >10,000 characters
- [ ] Split into chunks of 5,000 characters (on paragraph boundaries)
- [ ] Process each chunk separately
- [ ] Merge results intelligently

**Implementation File**: `src/lib/utils/chunker.ts` (new file)
**Test File**: `tests/lib/utils/chunker.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Respects paragraph boundaries
- ✅ Merges chunks without duplication
- ✅ Test coverage >75%

---

## Task 7.0: Week 3 Day 8-9 - Optimization & Security (4-5h) 🟢 Medium

### Task 7.1: Performance Optimization
**Duration**: 2-3 hours
**Priority**: P2

- [ ] Implement response caching
- [ ] Parallel processing (if multiple chunks)
- [ ] Reduce API call latency (<5s)
- [ ] Memory usage <100MB

**Implementation File**: `src/lib/optimization/performance.ts` (new file)
**Test File**: `tests/lib/optimization/performance.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ 1000 words processed in <5s
- ✅ Memory usage <100MB
- ✅ Test coverage >70%

---

### Task 7.2: Security Enhancement (Prompt Injection)
**Duration**: 2 hours
**Priority**: P1

- [ ] Advanced prompt injection detection
- [ ] Sanitize special characters: `<>{}[]|\/`
- [ ] Block system commands
- [ ] Log suspicious patterns

**Implementation File**: `src/lib/security/prompt-injection.ts` (new file)
**Test File**: `tests/lib/security/prompt-injection.test.ts` ⭐ (1:1 pairing)

**Acceptance Criteria**:
- ✅ Blocks common injection patterns
- ✅ Logs suspicious activity
- ✅ Test coverage >85%

---

## Task 8.0: Testing & Documentation (4-6h) ✅ Final

### Task 8.1: Unit Tests (Complete Coverage)
**Duration**: 2 hours
**Priority**: P0

- [ ] All 1:1 test pairs completed
- [ ] Overall test coverage >80%
- [ ] All edge cases covered

**Test Files** (15 total):
1. `tests/lib/gemini/client.test.ts`
2. `tests/lib/validation/content-validator.test.ts`
3. `tests/api/admin/process-content/auth.test.ts`
4. `tests/lib/auth/role-check.test.ts`
5. `tests/lib/gemini/error-handler.test.ts`
6. `tests/lib/utils/retry.test.ts`
7. `tests/lib/utils/error-response.test.ts`
8. `tests/db/migrations/0015.test.ts`
9. `tests/lib/gemini/cost-tracker.test.ts`
10. `tests/lib/fallback/basic-fallback.test.ts`
11. `tests/lib/fallback/advanced-fallback.test.ts`
12. `tests/lib/cache/content-cache.test.ts`
13. `tests/lib/rate-limit/limiter.test.ts`
14. `tests/lib/budget/budget-limiter.test.ts`
15. `tests/lib/validation/schema.test.ts`
16. `tests/lib/utils/chunker.test.ts`
17. `tests/lib/optimization/performance.test.ts`
18. `tests/lib/security/prompt-injection.test.ts`

**Acceptance Criteria**:
- ✅ All tests pass
- ✅ Coverage >80%

---

### Task 8.2: Integration Tests
**Duration**: 1-2 hours
**Priority**: P0

- [ ] End-to-end AI processing flow
- [ ] Database logging verification
- [ ] Cache hit/miss scenarios
- [ ] Cost calculation accuracy

**Test File**: `tests/integration/ai-content-processor.test.ts`

**Acceptance Criteria**:
- ✅ All integration tests pass
- ✅ Real database transactions work

---

### Task 8.3: E2E Tests (Playwright)
**Duration**: 1-2 hours
**Priority**: P1

- [ ] Trainer login
- [ ] Navigate to lesson editor
- [ ] Input raw content
- [ ] Click "AI 정리" button
- [ ] Verify loading indicator
- [ ] Verify formatted output

**Test File**: `tests/e2e/ai-content-processing.spec.ts`

**Acceptance Criteria**:
- ✅ User flow completes successfully
- ✅ UI updates correctly

---

### Task 8.4: Performance Tests
**Duration**: 1 hour
**Priority**: P2

- [ ] 1000 words processed in <5s
- [ ] 10 concurrent users
- [ ] Memory usage <100MB

**Test File**: `tests/performance/ai-processing.perf.ts`

**Acceptance Criteria**:
- ✅ Performance targets met
- ✅ No memory leaks

---

## Validation Checklist

### Phase 0.5 Validation
```bash
bash scripts/validate-phase-0.5.sh 0014
```
- ✅ Task List exists
- ✅ Task 0.0 completed
- ✅ 1:1 test pairing for all implementation tasks

### Phase 1 Validation
```bash
bash scripts/validate-phase-1.sh
```
- ⏳ All implementation files have test pairs

### Phase 2 Validation
```bash
bash scripts/validate-phase-2.sh
```
- ⏳ All tests pass
- ⏳ Coverage >80%

---

## Commit Message Format

```
feat: [task description] (v0.6.0-alpha) [PRD-0014]

- Implemented Task X.Y
- Added 1:1 test pairing
- Coverage: XX%
```

---

## Dependencies

### New Packages to Install
```bash
npm install @google/genai  # v1.29.1 (required)
npm install zod            # Schema validation
npm install @upstash/ratelimit  # Rate limiting (optional)
```

### Packages to Remove
```bash
npm uninstall @google/generative-ai  # Deprecated
```

---

## Success Metrics (from PRD)

After all tasks completed:

- ✅ AI processing success rate: **99%**
- ✅ Average processing time: **<5s** (1000 words)
- ✅ Trainer satisfaction: **80%+**
- ✅ Content consistency: **95%+**
- ✅ ROI: **$121,000/year**, 10-day payback

---

## References

- **PRD**: [tasks/prds/0014-prd-ai-content-processor.md](prds/0014-prd-ai-content-processor.md)
- **Week 1 Guide**: [WEEK1_EXECUTION_GUIDE.md](../WEEK1_EXECUTION_GUIDE.md)
- **Workflow**: [AUTOMATED_WORKFLOW_8WEEKS.md](../AUTOMATED_WORKFLOW_8WEEKS.md)

---

**Created**: 2025-11-17
**Version**: 1.0.0
**Status**: Ready for Phase 1 Implementation
