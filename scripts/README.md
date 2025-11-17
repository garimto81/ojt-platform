# 🔧 스크립트 사용 가이드

프로젝트에서 사용하는 자동화 스크립트 모음입니다.

---

## 📁 폴더 구조

```
scripts/
├── node/          # Node.js 스크립트 (.js)
├── bash/          # Bash 스크립트 (.sh)
├── python/        # Python 스크립트 (.py)
└── typescript/    # TypeScript 스크립트 (.ts)
```

---

## 🟢 Node.js 스크립트

### check-env.js
환경 변수 검증 스크립트

```bash
node scripts/node/check-env.js
# 또는
npm run check-env
```

**기능**:
- `.env.local` 파일 존재 확인
- 필수 환경 변수 검증
- Supabase 키 형식 확인

### get-supabase-config.js
Supabase 설정 정보 출력

```bash
node scripts/node/get-supabase-config.js
```

**기능**:
- Supabase URL 확인
- Anon Key 확인 (마스킹 처리)
- 프로젝트 ID 확인

### setup-vercel-env.js
Vercel 환경 변수 자동 설정

```bash
node scripts/node/setup-vercel-env.js
# 또는
npm run setup:vercel
```

**기능**:
- `.env.local` → Vercel 환경 변수 자동 업로드
- Production/Preview/Development 환경별 설정
- 대화형 입력으로 간편 설정

---

## 🔵 Bash 스크립트

### create-pr-api.sh
GitHub API를 통한 자동 PR 생성

```bash
bash scripts/bash/create-pr-api.sh
```

**요구사항**:
- `GITHUB_TOKEN` 환경 변수 설정 필수
- 현재 브랜치가 `main`이 아니어야 함

**사용법**:
```bash
# 환경 변수 설정
export GITHUB_TOKEN=ghp_your_token_here

# 스크립트 실행
bash scripts/bash/create-pr-api.sh
```

### create-pr-guide.sh
PR 생성 가이드 출력

```bash
bash scripts/bash/create-pr-guide.sh
```

**기능**:
- PR 생성 단계별 가이드 출력
- GitHub Token 발급 방법 안내

### create-deployment-issue.sh
GitHub 배포 이슈 자동 생성

```bash
bash scripts/bash/create-deployment-issue.sh
```

**기능**:
- 배포 체크리스트가 포함된 이슈 자동 생성
- 배포 담당자 자동 태그

---

## 🐍 Python 스크립트

### generate-tasks-gemini.py
PRD 기반 Task List 자동 생성 (Google Gemini API)

```bash
# 의존성 설치
pip install -r scripts/python/requirements.txt

# 스크립트 실행
python scripts/python/generate-tasks-gemini.py tasks/prds/0001-prd-feature.md
```

**환경 변수**:
```bash
# Google Gemini API 키 필요
export GEMINI_API_KEY=your_api_key_here
```

**기능**:
- PRD 파일 읽기
- AI로 Task List 자동 생성
- `tasks/task-lists/`에 저장

**의존성** (`requirements.txt`):
```
google-generativeai>=0.3.0
```

**참고**: Claude Code와 대화로 생성하는 방법이 더 간단합니다 (API 키 불필요, 무료).

### replace_dummy_data.py
더미 데이터 실제 데이터로 교체

```bash
python scripts/python/replace_dummy_data.py
```

**기능**:
- 개발용 더미 데이터 제거
- 실제 프로덕션 데이터로 교체
- 백업 자동 생성

---

## 📘 TypeScript 스크립트

### seed-sample-content.ts
샘플 콘텐츠 시드 데이터 생성

```bash
npx tsx scripts/typescript/seed-sample-content.ts
# 또는
npm run db:seed
```

**기능**:
- Supabase에 샘플 레슨 삽입
- 샘플 퀴즈 생성
- 개발 환경용 테스트 데이터 생성

**요구사항**:
- Supabase 환경 변수 설정 필요
- `SUPABASE_SERVICE_ROLE_KEY` 필수

---

## 🚀 npm scripts 통합

`package.json`에서 바로 실행 가능:

```json
{
  "scripts": {
    "check-env": "node scripts/node/check-env.js",
    "setup:supabase": "node scripts/node/setup-supabase-env.js",
    "setup:vercel": "node scripts/node/setup-vercel-env.js",
    "db:seed": "npx tsx scripts/typescript/seed-sample-content.ts",
    "create-pr": "bash scripts/bash/create-pr-api.sh"
  }
}
```

**사용 예시**:
```bash
# 환경 변수 검증
npm run check-env

# Vercel 환경 변수 설정
npm run setup:vercel

# 데이터베이스 시드 데이터 생성
npm run db:seed

# PR 자동 생성
npm run create-pr
```

---

## 📋 스크립트 목록 요약

| 스크립트 | 언어 | 용도 | npm 명령 |
|---------|------|------|----------|
| `check-env.js` | Node.js | 환경 변수 검증 | `npm run check-env` |
| `get-supabase-config.js` | Node.js | Supabase 설정 확인 | - |
| `setup-vercel-env.js` | Node.js | Vercel 환경 설정 | `npm run setup:vercel` |
| `create-pr-api.sh` | Bash | PR 자동 생성 | `npm run create-pr` |
| `create-pr-guide.sh` | Bash | PR 가이드 출력 | - |
| `create-deployment-issue.sh` | Bash | 배포 이슈 생성 | - |
| `generate-tasks-gemini.py` | Python | Task List 생성 | - |
| `replace_dummy_data.py` | Python | 더미 데이터 교체 | - |
| `seed-sample-content.ts` | TypeScript | 시드 데이터 생성 | `npm run db:seed` |

---

## 🔍 스크립트 사용 팁

### 개발 시작 시
1. `npm run check-env` - 환경 변수 검증
2. `npm run db:seed` - 샘플 데이터 생성

### 배포 준비 시
1. `npm run check-env` - 프로덕션 환경 변수 검증
2. `npm run setup:vercel` - Vercel 환경 설정
3. `npm run create-pr` - PR 자동 생성

### 문제 발생 시
- `node scripts/node/check-env.js` - 상세 디버깅 정보
- `node scripts/node/get-supabase-config.js` - Supabase 연결 확인

---

## 🆘 문제 해결

### 스크립트 실행 실패

**권한 오류 (Bash)**:
```bash
chmod +x scripts/bash/*.sh
```

**Python 의존성 오류**:
```bash
pip install -r scripts/python/requirements.txt
```

**Node.js 모듈 오류**:
```bash
npm install
```

### 환경 변수 문제

**GITHUB_TOKEN 없음**:
```bash
# GitHub → Settings → Developer settings → Personal access tokens
# repo 권한으로 토큰 생성 후:
export GITHUB_TOKEN=ghp_your_token_here
```

**Supabase 연결 실패**:
- `.env.local` 파일 확인
- `NEXT_PUBLIC_SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 검증
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) 참조

---

## 📚 관련 문서

- [DEVELOPMENT.md](../DEVELOPMENT.md) - 개발 워크플로우
- [DEPLOYMENT.md](../DEPLOYMENT.md) - 배포 가이드
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - 문제 해결

---

**버전**: 1.1.0 | **최종 업데이트**: 2025-01-17
