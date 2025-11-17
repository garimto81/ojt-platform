# 프로젝트 폴더 정리 계획 (Folder Reorganization Plan)

**작성일**: 2025-01-17
**버전**: 1.0.0
**PRD 버전**: v3.0.0 기준
**목적**: 프로젝트 가독성 향상, 유지보수성 개선, PRD v3.0.0 반영

---

## 📋 현재 문제점 (Current Issues)

### 🔴 Critical Issues

#### 1. 루트 디렉토리 혼잡 (Root Clutter)
**문제**: 23개의 Markdown 파일이 루트에 산재
```
❌ 현재 (23개 MD 파일)
./CLAUDE.md
./DATABASE_SETUP.md
./DEPLOYMENT.md
./DEPLOYMENT_INFO.md
./DEPLOYMENT_ISSUES.md
./E2E_TEST_QUICKSTART.md
./EMAIL_VERIFICATION_GUIDE.md
./GOOGLE_AUTH_SETUP.md
./MIGRATION_GUIDE.md
./NAVIGATION_PERFORMANCE.md
./NEXT_STEPS.md
./PERFORMANCE_OPTIMIZATION_COMPLETE.md
./PLAYWRIGHT_SETUP_SUMMARY.md
./PR_TEMPLATE.md
./PROJECT_SUMMARY.md
./QUICK_SETUP_GUIDE.md
./QUICK_START.md
./README.md
./REAL_DATA_INTEGRATION.md
./REMOVE_DUMMY_DATA.md
./SUPABASE_SETUP.md
./VERCEL_DEPLOYMENT_GUIDE.md
./VERCEL_ENV_CHECK.md
```

**영향**:
- 필요한 문서 찾기 어려움
- 신규 개발자 온보딩 혼란
- 문서 중복 가능성

#### 2. 테스트 폴더 중복 (Duplicate Test Folders)
```
❌ 중복:
./tests/e2e/
./testse2e/  (오타?)
```

#### 3. 일관성 없는 스크립트 (Inconsistent Scripts)
```
./scripts/
├── check-env.js           (Node.js)
├── create-pr-api.sh       (Bash)
├── generate_tasks_gemini.py  (Python, 스네이크 케이스)
├── setup-vercel-env.js    (Node.js, 케밥 케이스)
└── seed-sample-content.ts (TypeScript)
```

**문제**: 파일명 규칙 없음, 언어 혼재

### 🟡 Medium Issues

#### 4. docs/ 폴더 미활용
```
./docs/
├── CREATE_PR_AUTO.md
├── NAVIGATION_OPTIMIZATION_SUMMARY.md
├── PERFORMANCE_ARCHITECTURE.md
├── PERFORMANCE_QUICK_REFERENCE.md
└── PERFORMANCE_TEST_GUIDE.md
```

**문제**: 일부 문서만 docs/에, 대부분은 루트에

#### 5. PRD v3.0.0 반영 누락
- 5개 새 테이블 마이그레이션 파일 없음:
  - `lesson_versions`
  - `user_question_history`
  - `ai_processing_logs`
  - `content_creation_metrics`
  - `poker_glossary`

---

## 🎯 정리 목표 (Reorganization Goals)

### 1. 루트 디렉토리 간소화
**목표**: 루트에는 필수 파일만 (5-7개)
```
✅ 목표:
./README.md              (프로젝트 소개)
./CLAUDE.md              (Claude Code 가이드)
./package.json
./tsconfig.json
./next.config.js
./.gitignore
./.env.example
```

### 2. 문서 카테고리별 정리
**원칙**: 역할에 따른 폴더 구조
```
docs/
├── setup/              (환경 설정)
├── deployment/         (배포 관련)
├── development/        (개발 가이드)
├── testing/            (테스트 가이드)
├── architecture/       (아키텍처)
└── reference/          (레퍼런스)
```

### 3. 스크립트 표준화
**규칙**:
- 파일명: 케밥 케이스 (kebab-case)
- 언어별 폴더 분리
- 명확한 README.md

### 4. 마이그레이션 파일 추가
**PRD v3.0.0 반영**:
- 5개 새 테이블 마이그레이션

---

## 📁 제안하는 새 폴더 구조 (Proposed Structure)

### A. 루트 레벨 (Root Level)
```
ojt-platform/
├── README.md                 ✅ 유지 (프로젝트 개요)
├── CLAUDE.md                 ✅ 유지 (프로젝트별 Claude 가이드)
├── CHANGELOG.md              🆕 추가 (변경 이력)
├── package.json              ✅ 유지
├── tsconfig.json             ✅ 유지
├── next.config.js            ✅ 유지
├── playwright.config.ts      ✅ 유지
├── tailwind.config.ts        ✅ 유지
├── .env.example              ✅ 유지
├── .gitignore                ✅ 유지
└── .prettierrc               🆕 추가 (코드 포맷팅)
```

### B. docs/ 폴더 재구성
```
docs/
├── README.md                          🆕 (문서 네비게이션 가이드)
│
├── setup/                             📁 환경 설정 가이드
│   ├── QUICK_START.md                 ⬅️ 이동 (루트에서)
│   ├── DATABASE_SETUP.md              ⬅️ 이동
│   ├── SUPABASE_SETUP.md              ⬅️ 이동
│   ├── GOOGLE_AUTH_SETUP.md           ⬅️ 이동
│   ├── EMAIL_VERIFICATION_GUIDE.md    ⬅️ 이동
│   └── ENV_VARIABLES.md               🆕 추가 (환경 변수 가이드)
│
├── deployment/                        📁 배포 관련
│   ├── DEPLOYMENT.md                  ⬅️ 이동
│   ├── DEPLOYMENT_INFO.md             ⬅️ 이동
│   ├── DEPLOYMENT_ISSUES.md           ⬅️ 이동
│   ├── VERCEL_DEPLOYMENT_GUIDE.md     ⬅️ 이동
│   ├── VERCEL_ENV_CHECK.md            ⬅️ 이동
│   └── DEPLOYMENT_CHECKLIST.md        ⬅️ 이동 (.github/에서)
│
├── development/                       📁 개발 가이드
│   ├── MIGRATION_GUIDE.md             ⬅️ 이동
│   ├── REAL_DATA_INTEGRATION.md       ⬅️ 이동
│   ├── REMOVE_DUMMY_DATA.md           ⬅️ 이동
│   ├── CREATE_PR_AUTO.md              ⬅️ 이동
│   ├── NEXT_STEPS.md                  ⬅️ 이동
│   └── API_DOCUMENTATION.md           🆕 추가 (API 문서화)
│
├── testing/                           📁 테스트 가이드
│   ├── E2E_TEST_QUICKSTART.md         ⬅️ 이동
│   ├── PLAYWRIGHT_SETUP_SUMMARY.md    ⬅️ 이동
│   ├── PERFORMANCE_TEST_GUIDE.md      ✅ 유지
│   └── TESTING_STRATEGY.md            🆕 추가 (전체 테스트 전략)
│
├── architecture/                      📁 아키텍처 문서
│   ├── PERFORMANCE_ARCHITECTURE.md    ✅ 유지
│   ├── NAVIGATION_OPTIMIZATION_SUMMARY.md  ✅ 유지
│   ├── NAVIGATION_PERFORMANCE.md      ⬅️ 이동
│   ├── DATABASE_SCHEMA.md             🆕 추가 (PRD 스키마 요약)
│   ├── AI_INTEGRATION.md              🆕 추가 (AI 통합 가이드)
│   └── SRS_ALGORITHM.md               🆕 추가 (간격 반복 알고리즘)
│
└── reference/                         📁 레퍼런스
    ├── PROJECT_SUMMARY.md             ⬅️ 이동
    ├── PERFORMANCE_QUICK_REFERENCE.md ✅ 유지
    ├── PERFORMANCE_OPTIMIZATION_COMPLETE.md  ⬅️ 이동
    └── GLOSSARY.md                    🆕 추가 (용어 사전)
```

### C. scripts/ 폴더 재구성
```
scripts/
├── README.md                          🆕 (스크립트 사용법)
│
├── node/                              📁 Node.js 스크립트
│   ├── check-env.js                   ⬅️ 이동
│   ├── get-supabase-config.js         ⬅️ 이동
│   └── setup-vercel-env.js            ⬅️ 이동
│
├── bash/                              📁 Bash 스크립트
│   ├── create-deployment-issue.sh     ⬅️ 이동
│   ├── create-pr-api.sh               ⬅️ 이동
│   └── create-pr-guide.sh             ⬅️ 이동
│
├── python/                            📁 Python 스크립트
│   ├── generate-tasks-gemini.py       ⬅️ 이동 (이름 변경)
│   └── requirements.txt               🆕 추가
│
├── typescript/                        📁 TypeScript 스크립트
│   └── seed-sample-content.ts         ⬅️ 이동
│
└── validation/                        📁 Phase 검증 스크립트 (새로 추가)
    ├── validate-phase-0.sh            🆕 추가
    ├── validate-phase-0.5.sh          🆕 추가
    ├── validate-phase-1.sh            🆕 추가
    ├── validate-phase-2.sh            🆕 추가
    ├── validate-phase-3.sh            🆕 추가
    └── validate-phase-5.sh            🆕 추가
```

### D. supabase/ 폴더 재구성
```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql         ✅ 유지
│   ├── 002_seed_data.sql              ✅ 유지
│   ├── 003_sample_lesson_content.sql  ✅ 유지
│   ├── 004_ai_features_schema.sql     ✅ 유지
│   ├── 005_lesson_versions.sql        🆕 추가 (버전 관리)
│   ├── 006_user_question_history.sql  🆕 추가 (SRS 이력)
│   ├── 007_ai_processing_logs.sql     🆕 추가 (AI 로깅)
│   ├── 008_content_metrics.sql        🆕 추가 (지표 수집)
│   ├── 009_poker_glossary.sql         🆕 추가 (용어 사전)
│   └── 010_ai_confidence_score.sql    🆕 추가 (신뢰도 점수 컬럼)
│
└── seed/                              📁 시드 데이터
    ├── poker-terms.sql                🆕 추가 (포커 용어 시드)
    └── sample-lessons.sql             🆕 추가 (샘플 레슨)
```

### E. tasks/ 폴더 재구성
```
tasks/
├── README.md                          🆕 (Task 관리 가이드)
│
├── prds/                              ✅ 유지
│   └── 0001-prd-ai-powered-learning-platform.md  (v3.0.0)
│
├── task-lists/                        📁 Task List (Phase 0.5)
│   └── 0001-tasks-ai-powered-learning-platform.md  ⬅️ 이동
│
├── completed/                         📁 완료된 작업
│   └── archive/                       📁 아카이브
│
└── templates/                         📁 템플릿
    ├── prd-template.md                🆕 추가
    └── task-list-template.md          🆕 추가
```

### F. tests/ 폴더 정리
```
tests/
├── e2e/                               ✅ 유지
│   ├── ai-features.spec.ts
│   ├── authentication.spec.ts
│   └── basic-navigation.spec.ts
│
├── unit/                              📁 유닛 테스트 (새로 추가)
│   ├── lib/
│   └── components/
│
└── integration/                       📁 통합 테스트 (새로 추가)
    └── api/

./testse2e/                            ❌ 삭제 (중복 폴더)
```

---

## 🚀 실행 계획 (Implementation Plan)

### Phase 1: 백업 (안전장치)
```bash
# 1. Git 커밋 확인
git status
git add .
git commit -m "chore: Before folder reorganization"

# 2. 백업 브랜치 생성
git checkout -b backup/before-reorganization
git push origin backup/before-reorganization
git checkout main
```

### Phase 2: 폴더 생성
```bash
# docs/ 하위 폴더
mkdir -p docs/{setup,deployment,development,testing,architecture,reference}

# scripts/ 하위 폴더
mkdir -p scripts/{node,bash,python,typescript,validation}

# tasks/ 하위 폴더
mkdir -p tasks/{task-lists,completed/archive,templates}

# supabase/ 하위 폴더
mkdir -p supabase/seed

# tests/ 하위 폴더
mkdir -p tests/{unit/lib,unit/components,integration/api}
```

### Phase 3: 파일 이동 (Markdown 우선)
```bash
# 루트 → docs/setup/
mv QUICK_START.md docs/setup/
mv DATABASE_SETUP.md docs/setup/
mv SUPABASE_SETUP.md docs/setup/
mv GOOGLE_AUTH_SETUP.md docs/setup/
mv EMAIL_VERIFICATION_GUIDE.md docs/setup/

# 루트 → docs/deployment/
mv DEPLOYMENT.md docs/deployment/
mv DEPLOYMENT_INFO.md docs/deployment/
mv DEPLOYMENT_ISSUES.md docs/deployment/
mv VERCEL_DEPLOYMENT_GUIDE.md docs/deployment/
mv VERCEL_ENV_CHECK.md docs/deployment/
mv .github/DEPLOYMENT_CHECKLIST.md docs/deployment/

# 루트 → docs/development/
mv MIGRATION_GUIDE.md docs/development/
mv REAL_DATA_INTEGRATION.md docs/development/
mv REMOVE_DUMMY_DATA.md docs/development/
mv NEXT_STEPS.md docs/development/
mv docs/CREATE_PR_AUTO.md docs/development/

# 루트 → docs/testing/
mv E2E_TEST_QUICKSTART.md docs/testing/
mv PLAYWRIGHT_SETUP_SUMMARY.md docs/testing/

# 루트 → docs/architecture/
mv NAVIGATION_PERFORMANCE.md docs/architecture/

# 루트 → docs/reference/
mv PROJECT_SUMMARY.md docs/reference/
mv PERFORMANCE_OPTIMIZATION_COMPLETE.md docs/reference/
```

### Phase 4: 스크립트 정리
```bash
# scripts/ 재구성
mv scripts/check-env.js scripts/node/
mv scripts/get-supabase-config.js scripts/node/
mv scripts/setup-vercel-env.js scripts/node/

mv scripts/create-deployment-issue.sh scripts/bash/
mv scripts/create-pr-api.sh scripts/bash/
mv scripts/create-pr-guide.sh scripts/bash/

mv scripts/generate_tasks_gemini.py scripts/python/generate-tasks-gemini.py
mv scripts/seed-sample-content.ts scripts/typescript/
```

### Phase 5: Tasks 정리
```bash
# Task List 이동
mv tasks/0001-tasks-ai-powered-learning-platform.md tasks/task-lists/
```

### Phase 6: 테스트 폴더 정리
```bash
# 중복 폴더 삭제 (백업 후)
rm -rf testse2e/
```

### Phase 7: 새 파일 생성
```bash
# README 파일들
touch docs/README.md
touch scripts/README.md
touch tasks/README.md

# CHANGELOG
touch CHANGELOG.md

# 새 문서
touch docs/setup/ENV_VARIABLES.md
touch docs/development/API_DOCUMENTATION.md
touch docs/testing/TESTING_STRATEGY.md
touch docs/architecture/DATABASE_SCHEMA.md
touch docs/architecture/AI_INTEGRATION.md
touch docs/architecture/SRS_ALGORITHM.md
touch docs/reference/GLOSSARY.md

# 템플릿
touch tasks/templates/prd-template.md
touch tasks/templates/task-list-template.md

# Python requirements
touch scripts/python/requirements.txt
```

### Phase 8: 마이그레이션 파일 생성
```bash
# PRD v3.0.0 반영
touch supabase/migrations/005_lesson_versions.sql
touch supabase/migrations/006_user_question_history.sql
touch supabase/migrations/007_ai_processing_logs.sql
touch supabase/migrations/008_content_metrics.sql
touch supabase/migrations/009_poker_glossary.sql
touch supabase/migrations/010_ai_confidence_score.sql

# 시드 데이터
touch supabase/seed/poker-terms.sql
touch supabase/seed/sample-lessons.sql
```

### Phase 9: 링크 업데이트
```bash
# README.md 링크 업데이트
# CLAUDE.md 링크 업데이트
# 기타 문서 내부 링크 수정
```

### Phase 10: 검증 및 커밋
```bash
# 빌드 테스트
npm run build

# E2E 테스트
npm run test:e2e

# 커밋
git add .
git commit -m "chore: Reorganize project folders for better maintainability (v3.0.0)

- Moved 23 root MD files to docs/ subfolders (setup, deployment, etc.)
- Reorganized scripts/ by language (node, bash, python, typescript)
- Added validation/ scripts for Phase 0-6 workflow
- Created tasks/task-lists/ for Phase 0.5 outputs
- Added 6 new migrations for PRD v3.0.0 (SRS, AI quality, cost tracking)
- Removed duplicate testse2e/ folder
- Added README files for each major folder
"
```

---

## 📊 정리 전후 비교 (Before/After Comparison)

| 항목 | 정리 전 | 정리 후 | 개선 |
|------|---------|---------|------|
| 루트 MD 파일 | 23개 | 2개 | ✅ 91% 감소 |
| docs/ 구조 | 1단계 (flat) | 2단계 (카테고리별) | ✅ 체계화 |
| scripts/ 구조 | 언어 혼재 | 언어별 폴더 | ✅ 일관성 |
| 마이그레이션 | 4개 | 10개 (+6) | ✅ PRD 반영 |
| 테스트 폴더 | 중복 있음 | 중복 제거 | ✅ 정리 |
| README 커버리지 | 20% | 100% | ✅ 문서화 |

---

## ⚠️ 주의사항 (Warnings)

### 1. Git 이력 보존
- `git mv` 사용 (이력 유지)
- `mv` 사용 시 Git이 이동 감지 못할 수 있음

### 2. 링크 깨짐 방지
- 모든 내부 링크 확인 필요
- README.md, CLAUDE.md 업데이트 필수

### 3. CI/CD 파이프라인
- `.github/workflows/` 파일 경로 확인
- 스크립트 경로 변경 시 workflow 업데이트

### 4. 환경 변수
- `.env.example` 유지 (루트)
- docs/setup/ENV_VARIABLES.md에 상세 설명

---

## 🎯 다음 단계 (Next Steps)

### 즉시 실행 가능
1. **백업 브랜치 생성** (안전장치)
2. **Phase 2-3 실행** (폴더 생성 + MD 파일 이동)
3. **README 링크 업데이트**

### 후속 작업
1. **마이그레이션 파일 작성** (PRD v3.0.0 반영)
2. **새 문서 작성** (AI_INTEGRATION.md, SRS_ALGORITHM.md 등)
3. **검증 스크립트 작성** (validate-phase-*.sh)

---

## 📝 체크리스트 (Checklist)

### 실행 전
- [ ] 현재 작업 모두 커밋
- [ ] 백업 브랜치 생성
- [ ] 팀원에게 공지 (폴더 구조 변경 예정)

### 실행 중
- [ ] Phase 1-10 순차 실행
- [ ] 각 Phase마다 Git 커밋
- [ ] 빌드 에러 즉시 수정

### 실행 후
- [ ] `npm run build` 성공 확인
- [ ] `npm run test:e2e` 성공 확인
- [ ] README.md 링크 동작 확인
- [ ] CLAUDE.md 링크 동작 확인
- [ ] PR 생성 및 리뷰 요청

---

**작성자**: Claude Code
**승인자**: -
**실행 예정일**: 사용자 승인 후
**예상 소요 시간**: 1-2시간
