# 스크립트 사용 가이드 (Scripts Usage Guide)

프로젝트에서 사용하는 자동화 스크립트 모음

---

## 📁 폴더 구조

```
scripts/
├── node/          # Node.js 스크립트 (.js)
├── bash/          # Bash 스크립트 (.sh)
├── python/        # Python 스크립트 (.py)
├── typescript/    # TypeScript 스크립트 (.ts)
└── validation/    # Phase 검증 스크립트
```

---

## 🟢 Node.js 스크립트

### check-env.js
환경 변수 검증 스크립트

```bash
node scripts/node/check-env.js
```

**기능**:
- .env.local 파일 존재 확인
- 필수 환경 변수 검증
- Supabase 연결 테스트

### get-supabase-config.js
Supabase 설정 정보 출력

```bash
node scripts/node/get-supabase-config.js
```

**기능**:
- Supabase URL 확인
- Anon Key 확인 (마스킹)
- 프로젝트 ID 확인

### setup-vercel-env.js
Vercel 환경 변수 자동 설정

```bash
node scripts/node/setup-vercel-env.js
```

**기능**:
- .env.local → Vercel 환경 변수 업로드
- 프로덕션/프리뷰/개발 환경별 설정

---

## 🔵 Bash 스크립트

### create-pr-api.sh
GitHub API를 통한 자동 PR 생성

```bash
bash scripts/bash/create-pr-api.sh
```

**요구사항**:
- `GITHUB_TOKEN` 환경 변수
- Git branch가 main이 아님

### create-pr-guide.sh
PR 생성 가이드 출력

```bash
bash scripts/bash/create-pr-guide.sh
```

### create-deployment-issue.sh
GitHub 배포 이슈 자동 생성

```bash
bash scripts/bash/create-deployment-issue.sh
```

---

## 🐍 Python 스크립트

### generate-tasks-gemini.py
PRD 기반 Task List 자동 생성 (Google Gemini API)

```bash
# API 키 설정 필요
export ANTHROPIC_API_KEY=your_key_here
pip install anthropic

python scripts/python/generate-tasks-gemini.py tasks/prds/0001-prd-feature.md
```

**기능**:
- PRD 파일 읽기
- AI로 Task List 생성
- tasks/task-lists/에 저장

**의존성** (requirements.txt):
```
google-generativeai>=0.3.0
```

---

## 📘 TypeScript 스크립트

### seed-sample-content.ts
샘플 콘텐츠 시드 데이터 생성

```bash
npx tsx scripts/typescript/seed-sample-content.ts
```

**기능**:
- Supabase에 샘플 레슨 삽입
- 샘플 퀴즈 생성
- 개발 환경용 데이터

---

## ✅ Validation 스크립트 (Phase 검증)

### validate-phase-0.sh
PRD 검증

```bash
bash scripts/validation/validate-phase-0.sh NNNN
```

**확인사항**:
- PRD 파일 존재
- 최소 50줄 이상

### validate-phase-0.5.sh
Task List 검증

```bash
bash scripts/validation/validate-phase-0.5.sh NNNN
```

**확인사항**:
- Task List 파일 존재
- Task 0.0 완료 여부

### validate-phase-1.sh
1:1 테스트 페어링 검증

```bash
bash scripts/validation/validate-phase-1.sh
```

**확인사항**:
- 모든 src 파일에 test 파일 존재
- 1:1 페어링 검증

### validate-phase-2.sh
테스트 통과 검증

```bash
bash scripts/validation/validate-phase-2.sh
```

**확인사항**:
- 모든 테스트 통과
- 커버리지 임계값 달성

### validate-phase-3.sh
버전 태깅 검증

```bash
bash scripts/validation/validate-phase-3.sh vX.Y.Z
```

**확인사항**:
- 테스트 통과
- CHANGELOG.md 업데이트
- 커밋되지 않은 변경 없음

### validate-phase-5.sh
E2E & 보안 검증

```bash
bash scripts/validation/validate-phase-5.sh
```

**확인사항**:
- E2E 테스트 통과
- 보안 취약점 없음
- 성능 벤치마크 달성

---

## 🚀 npm scripts 통합

package.json에서 바로 실행 가능:

```json
{
  "scripts": {
    "check-env": "node scripts/node/check-env.js",
    "setup:vercel": "node scripts/node/setup-vercel-env.js",
    "db:seed": "npx tsx scripts/typescript/seed-sample-content.ts",
    "validate:phase-1": "bash scripts/validation/validate-phase-1.sh"
  }
}
```

사용법:
```bash
npm run check-env
npm run setup:vercel
npm run db:seed
```

---

**마지막 업데이트**: 2025-01-17
**버전**: 1.0.0
