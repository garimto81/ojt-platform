# 📋 작업 관리 가이드 (Task Management)

PRD 기반 Task List 관리 및 Phase 0-6 워크플로우 안내입니다.

---

## 📁 폴더 구조

```
tasks/
├── prds/                  # Phase 0: Product Requirement Documents
│   └── NNNN-prd-*.md
│
└── task-lists/            # Phase 0.5: Task List 출력물
    └── NNNN-tasks-*.md
```

---

## 🔄 Phase 0-6 워크플로우

### Phase 0: PRD 작성
**위치**: `tasks/prds/`

**파일명 규칙**:
```
NNNN-prd-feature-name.md
```

**예시**:
```
0001-prd-ai-powered-learning-platform.md
0002-prd-user-dashboard.md
```

**PRD 작성 가이드는 [DEVELOPMENT.md](../DEVELOPMENT.md)의 Phase 0 섹션을 참조하세요.**

---

### Phase 0.5: Task List 생성
**위치**: `tasks/task-lists/`

**파일명 규칙**:
```
NNNN-tasks-feature-name.md
```

**생성 방법**:

#### 방법 1: Claude Code와 대화 (추천 ⭐)
```
사용자: "tasks/prds/0001-prd-feature.md 읽고 Task List 작성해줘"
Claude Code: PRD 분석 후 Task List 생성 → tasks/task-lists/0001-tasks-feature.md 저장
```

**장점**:
- ✅ 즉시 실행 (설치/설정 불필요)
- ✅ 무료 (대화형 서비스)
- ✅ 대화하며 수정 가능
- ✅ 96% 시간 단축 (8시간 → 5분)

#### 방법 2: Python 스크립트 (선택)
```bash
# Google Gemini API 키 필요
export GEMINI_API_KEY=your_api_key_here

# 의존성 설치
pip install -r scripts/python/requirements.txt

# 실행
python scripts/python/generate-tasks-gemini.py tasks/prds/0001-prd-feature.md
```

**참고**: 방법 1이 훨씬 간단하고 빠릅니다.

---

### Phase 1-6: 개발 진행

각 Phase별로 해당 Task List를 참조하여 진행:

- **Phase 1**: 구현 (1:1 테스트 페어링 필수)
- **Phase 2**: 테스트 (Unit + Integration + E2E)
- **Phase 3**: 버전 태깅 (Semantic Versioning)
- **Phase 4**: Git 커밋 + 자동 PR/병합
- **Phase 5**: E2E & 보안 테스트
- **Phase 6**: 프로덕션 배포

**상세 가이드**: [DEVELOPMENT.md](../DEVELOPMENT.md)

---

## 📝 Task List 형식

### 필수 섹션

#### 1. Task 0.0 (필수)
```markdown
## Task 0.0: Setup
- [ ] Create feature branch: `feature/PRD-XXXX-feature-name`
- [ ] Update CLAUDE.md with project context
```

#### 2. Parent Tasks (5-12개)
```markdown
## Task 1.0: Phase 1 - Implementation
## Task 2.0: Phase 2 - Testing
## Task 3.0: Phase 3 - Versioning
```

#### 3. Sub-Tasks (상세 단계)
```markdown
## Task 1.0: Phase 1 - Implementation
- [ ] Task 1.1: Create `src/auth.ts`
- [ ] Task 1.2: Create `tests/auth.test.ts` (1:1 pair with 1.1)
- [ ] Task 1.3: Implement login logic
- [ ] Task 1.4: Create `tests/auth-login.test.ts` (1:1 pair with 1.3)
```

### 체크박스 상태

- `[ ]` - pending (대기 중)
- `[x]` - done (완료)
- `[!]` - failed (실패)
- `[⏸]` - blocked (차단됨)

---

## 🎯 1:1 테스트 페어링 (필수)

**규칙**: 모든 구현 파일은 반드시 테스트 파일과 쌍을 이룸

**❌ 잘못된 예**:
```markdown
- [ ] Task 1.1: Create `src/auth.ts`
- [ ] Task 1.2: Create `src/user.ts`
- [ ] Task 1.3: Write tests for all
```

**✅ 올바른 예**:
```markdown
- [ ] Task 1.1: Create `src/auth.ts`
- [ ] Task 1.2: Create `tests/auth.test.ts` (1:1 pair with 1.1)
- [ ] Task 1.3: Create `src/user.ts`
- [ ] Task 1.4: Create `tests/user.test.ts` (1:1 pair with 1.3)
```

**참고**: [DEVELOPMENT.md](../DEVELOPMENT.md)의 Phase 1 섹션에서 1:1 테스트 페어링 상세 설명

---

## 📊 진행률 추적

### 명령줄로 확인

```bash
# 완료된 태스크 수
grep '\[x\]' tasks/task-lists/0001-tasks-feature.md | wc -l

# 전체 태스크 수
grep -E '\[.\]' tasks/task-lists/0001-tasks-feature.md | wc -l

# 진행률 계산 (%)
echo "scale=2; $(grep '\[x\]' tasks/task-lists/0001-tasks-feature.md | wc -l) / $(grep -E '\[.\]' tasks/task-lists/0001-tasks-feature.md | wc -l) * 100" | bc
```

### VS Code 확장 (선택)

[Task List](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-todo-plus) 확장 설치 시 시각적 진행률 표시

---

## 🗂️ Task 생명주기

### 1. PRD 작성
```bash
# PRD 파일 생성
vim tasks/prds/0001-prd-new-feature.md
```

### 2. Task List 생성
```bash
# Claude Code에게 요청
"tasks/prds/0001-prd-new-feature.md 읽고 Task List 작성해줘"
```

### 3. 개발 진행
```bash
# Feature 브랜치 생성 (Task 0.0)
git checkout -b feature/PRD-0001-new-feature

# Task를 하나씩 완료하며 체크박스 업데이트
```

### 4. 완료 후
```bash
# PRD는 유지 (향후 참조용)
# Task List는 tasks/task-lists/에 보관
# 필요시 아카이브 가능
```

---

## 📋 예시: Task List 구조

```markdown
# Task List: AI Quiz Generator (PRD-0001)

## Task 0.0: Setup
- [x] Create feature branch: `feature/PRD-0001-ai-quiz`
- [x] Update CLAUDE.md with context

## Task 1.0: Phase 1 - Implementation
- [x] Task 1.1: Create `src/api/admin/generate-quiz/route.ts`
- [x] Task 1.2: Create `tests/api/admin/generate-quiz.test.ts`
- [ ] Task 1.3: Implement Gemini API integration
- [ ] Task 1.4: Create `tests/api/admin/gemini.test.ts`

## Task 2.0: Phase 2 - Testing
- [ ] Task 2.1: Unit tests (80% coverage)
- [ ] Task 2.2: E2E test with Playwright

## Task 3.0: Phase 3 - Versioning
- [ ] Task 3.1: Update CHANGELOG.md
- [ ] Task 3.2: Create git tag v0.2.0

(... 계속)
```

---

## 🔍 참고 문서

- [DEVELOPMENT.md](../DEVELOPMENT.md) - Phase 0-6 워크플로우 상세
- [CLAUDE.md](../CLAUDE.md) - Claude Code 활용 가이드
- [CONTRIBUTING.md](../CONTRIBUTING.md) - 기여 프로세스

---

## 💡 팁

### PRD 작성 팁
1. 목적을 명확하게 (왜 필요한가?)
2. 핵심 기능 3-5개로 요약
3. 성공 지표 정량화 (예: "응답 시간 50% 단축")

### Task List 작성 팁
1. Task 0.0 필수 포함
2. 1:1 테스트 페어링 엄격히 준수
3. 각 Task는 1-2시간 내 완료 가능하도록 분할
4. 의존성 명시 (Task X는 Task Y 이후 진행)

### 진행 팁
1. 작은 단위로 자주 커밋
2. 각 Task 완료 후 체크박스 즉시 업데이트
3. 블로킹 이슈 발생 시 `[⏸]`로 표시하고 별도 이슈 등록

---

## 🆘 문제 해결

### Task List가 너무 길어요
→ Parent Task를 더 작은 단위로 쪼개거나, 별도 PRD로 분리 고려

### 1:1 테스트 페어링이 어려워요
→ 구현과 테스트를 번갈아 작성하세요 (TDD 권장)

### Claude Code가 Task List를 생성 못 해요
→ PRD가 너무 짧거나 불명확한 경우. PRD 보완 후 재시도

---

**버전**: 1.1.0 | **최종 업데이트**: 2025-01-17
