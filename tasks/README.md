# Task 관리 가이드 (Task Management Guide)

PRD 기반 Task List 관리 및 Phase 0-6 워크플로우

---

## 📁 폴더 구조

```
tasks/
├── prds/                  # Phase 0: Product Requirement Documents
│   └── NNNN-prd-*.md
│
├── task-lists/            # Phase 0.5: Task List 출력물
│   └── NNNN-tasks-*.md
│
├── completed/             # 완료된 작업
│   └── archive/           # 아카이브
│
└── templates/             # 템플릿
    ├── prd-template.md
    └── task-list-template.md
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

**검증**:
```bash
bash scripts/validation/validate-phase-0.sh 0001
```

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
- ✅ 즉시 실행 (설치 불필요)
- ✅ 무료
- ✅ 대화형 수정 가능

#### 방법 2: Python 스크립트 (선택)
```bash
export ANTHROPIC_API_KEY=your_key_here
python scripts/python/generate-tasks-gemini.py tasks/prds/0001-prd-feature.md
```

**검증**:
```bash
bash scripts/validation/validate-phase-0.5.sh 0001
```

---

### Phase 1-6: 개발 진행

각 Phase별로 해당 Task List를 참조하여 진행:

- **Phase 1**: 구현 (1:1 테스트 페어링)
- **Phase 2**: 테스트 (유닛/통합/E2E)
- **Phase 3**: 버전 태깅
- **Phase 4**: Git + 자동 PR/머지
- **Phase 5**: E2E & 보안 테스트
- **Phase 6**: 배포

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
- [ ] Task 1.1: Create `src/auth.py`
- [ ] Task 1.2: Create `tests/test_auth.py` (1:1 pair with 1.1)
- [ ] Task 1.3: Implement login logic
```

### 체크박스 형식
- `[ ]` - pending
- `[x]` - done
- `[!]` - failed
- `[⏸]` - blocked

---

## 🎯 1:1 테스트 페어링 (필수)

**규칙**: 모든 구현 파일은 반드시 테스트 파일과 쌍을 이룸

```markdown
❌ 잘못된 예:
- [ ] Task 1.1: Create `src/auth.py`
- [ ] Task 1.2: Create `src/user.py`
- [ ] Task 1.3: Write tests

✅ 올바른 예:
- [ ] Task 1.1: Create `src/auth.py`
- [ ] Task 1.2: Create `tests/test_auth.py` (1:1 pair with 1.1)
- [ ] Task 1.3: Create `src/user.py`
- [ ] Task 1.4: Create `tests/test_user.py` (1:1 pair with 1.3)
```

---

## 📊 진행률 추적

### 명령줄 체크
```bash
# 완료된 태스크 수
grep '\[x\]' tasks/task-lists/0001-tasks-feature.md | wc -l

# 전체 태스크 수
grep '\[ \]' tasks/task-lists/0001-tasks-feature.md | wc -l

# 진행률 계산
echo "scale=2; $(grep '\[x\]' tasks/task-lists/0001-tasks-feature.md | wc -l) / $(grep -E '\[.\]' tasks/task-lists/0001-tasks-feature.md | wc -l) * 100" | bc
```

---

## 🗂️ 완료된 Task 정리

프로젝트 완료 후:

```bash
# PRD는 유지, Task List는 아카이브
mv tasks/task-lists/0001-tasks-feature.md tasks/completed/archive/
```

---

## 📋 템플릿 사용

### PRD 템플릿
```bash
cp tasks/templates/prd-template.md tasks/prds/0002-prd-new-feature.md
```

### Task List 템플릿
```bash
cp tasks/templates/task-list-template.md tasks/task-lists/0002-tasks-new-feature.md
```

---

## 🔍 참고 문서

- [PRD 가이드](../docs/development/PRD_GUIDE.md)
- [Phase 검증 스크립트](../scripts/validation/)
- [CLAUDE.md](../CLAUDE.md) - Phase 0-6 워크플로우 상세

---

**마지막 업데이트**: 2025-01-17
**버전**: 1.0.0
