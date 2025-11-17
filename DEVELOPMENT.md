# 🛠️ Development Guide

GG Production 플랫폼 개발 워크플로우 및 베스트 프랙티스입니다.

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend**:
- Next.js 14 (App Router)
- TypeScript 5.3 (strict mode)
- Tailwind CSS 3.3
- Radix UI + Shadcn UI
- TipTap (rich text editor)

**Backend**:
- Supabase (PostgreSQL + Auth + Real-time)
- Next.js API Routes (RESTful)
- Row Level Security (RLS)

**AI Integration**:
- Google Gemini API (`gemini-1.5-flash`)
- Structured JSON output
- Lazy initialization (optional feature)

### Project Structure

```
ojt-platform/
├── src/app/              # Next.js App Router
│   ├── api/              # Backend endpoints
│   ├── dashboard/        # Main application
│   └── auth/callback/    # OAuth callback
├── src/components/       # React components
├── src/lib/              # Utilities
│   ├── supabase/         # Database clients
│   └── types/            # TypeScript types
├── supabase/migrations/  # Database migrations
├── public/               # Static assets
└── tests/                # Tests (Jest + Playwright)
```

---

## 📊 Development Workflow

### Phase 0: PRD (Product Requirements Document)

모든 기능 개발은 PRD 작성부터 시작합니다.

**위치**: `tasks/prds/NNNN-prd-feature-name.md`

**PRD 가이드**:
- 최소 50줄 이상
- 목적, 핵심 기능, 기대 효과 포함
- 정량적 목표 설정

**검증**:
```bash
bash scripts/validate-phase-0.sh NNNN
```

### Phase 0.5: Task List 생성

PRD를 기반으로 구체적인 작업 목록을 생성합니다.

**방법 1: Claude Code와 대화** (권장):
```
사용자: "tasks/prds/0001-prd-feature.md 읽고 Task List 작성해줘"
Claude Code: Task List 생성 → tasks/0001-tasks-feature.md 저장
```

**방법 2: Python 스크립트**:
```bash
pip install anthropic
python scripts/generate_tasks_ai.py tasks/prds/NNNN-prd-feature.md
```

**검증**:
```bash
bash scripts/validate-phase-0.5.sh NNNN
```

### Phase 1-6: 개발 사이클

1. **Phase 1**: 구현 (1:1 테스트 페어링 필수)
2. **Phase 2**: 테스트 (Unit + E2E)
3. **Phase 3**: 버전 태깅 (Semantic Versioning)
4. **Phase 4**: Git 커밋 + Auto PR
5. **Phase 5**: E2E & Security 테스트
6. **Phase 6**: 프로덕션 배포

---

## 🗄️ Database Migrations

### 마이그레이션 파일 작성

**위치**: `supabase/migrations/`

**명명 규칙**: `NNN_descriptive_name.sql`

예시:
```
001_initial_schema.sql
002_seed_data.sql
003_sample_lesson_content.sql
004_ai_features.sql
...
010_ai_confidence_score.sql
```

### Supabase Dashboard에서 실행

#### Step 1: SQL Editor 접속

```
https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/sql
```

#### Step 2: 마이그레이션 순서대로 실행

1. **New Query** 버튼 클릭
2. 마이그레이션 파일 내용 복사 (Ctrl+A → Ctrl+C)
3. SQL Editor에 붙여넣기 (Ctrl+V)
4. **RUN** 버튼 클릭 (Ctrl+Enter)
5. 성공 메시지 확인:
   ```
   Success. No rows returned
   CREATE TABLE
   CREATE INDEX
   CREATE FUNCTION
   CREATE TRIGGER
   CREATE POLICY
   ```

#### Step 3: 마이그레이션 확인

```sql
-- 테이블 목록 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 커리큘럼 데이터 확인
SELECT day_number, title FROM curriculum_days ORDER BY day_number;

-- RLS 정책 확인
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- 트리거 확인
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

### 로컬 Supabase CLI (선택)

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref [YOUR-PROJECT-REF]

# 마이그레이션 적용
supabase db push
```

### 마이그레이션 롤백

```sql
-- ⚠️ 주의: 모든 데이터 삭제됨!
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.curriculum_days CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
```

---

## 🤖 Auto PR Creation

GitHub API를 사용하여 자동으로 Pull Request를 생성합니다.

### Step 1: GitHub Personal Access Token 발급

1. [GitHub Settings → Tokens](https://github.com/settings/tokens) 접속
2. **Generate new token (classic)** 클릭
3. 설정:
   - Note: `OJT Platform PR Creation`
   - Expiration: 90 days
   - Scopes: ✅ **repo** (Full control)
4. **Generate token** → 토큰 복사 (⚠️ 한 번만 표시)

### Step 2: 환경 변수 설정

```bash
export GITHUB_TOKEN=ghp_your_token_here
```

**영구 설정 (Bash/Zsh)**:
```bash
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.bashrc
source ~/.bashrc
```

**영구 설정 (Windows PowerShell)**:
```powershell
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_your_token_here", "User")
```

### Step 3: PR 생성

```bash
npm run create-pr
```

**성공 시 출력**:
```
=====================================================================
✅ Pull Request가 성공적으로 생성되었습니다!
=====================================================================

PR #42
URL: https://github.com/garimto81/ojt-platform/pull/42
```

### 대화형 입력 (토큰 미설정 시)

```bash
npm run create-pr
# → GitHub Personal Access Token을 입력하세요: ghp_xxxxx
```

### 문제 해결

**401 Unauthorized**:
- 원인: 토큰 만료 또는 유효하지 않음
- 해결: 토큰 재발급

**422 Unprocessable Entity**:
- 원인: PR이 이미 존재
- 해결: 기존 PR 확인 또는 닫기

**403 Forbidden**:
- 원인: 토큰 권한 부족
- 해결: **repo** 권한 체크 후 재발급

**404 Not Found**:
- 원인: 저장소 이름 오류 또는 접근 권한 없음
- 해결: `git remote -v`로 저장소 정보 확인

---

## 💻 Development Best Practices

### 1. 코드 스타일

**TypeScript**:
- Strict mode 활성화
- 모든 파일에 타입 정의
- `any` 사용 금지

**ESLint**:
```bash
npm run lint  # 린트 검사
```

**Import 경로**:
```typescript
// ✅ Good: Path alias 사용
import { createClient } from '@/lib/supabase/server'

// ❌ Bad: 상대 경로
import { createClient } from '../../lib/supabase/server'
```

### 2. Supabase Client 사용

**Server Components & API Routes**:
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createClient()
  const { data, error } = await supabase.from('lessons').select()
  return <div>{data}</div>
}
```

**Client Components**:
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function Component() {
  const supabase = createClient()
  // 클라이언트 사이드 작업
}
```

**⚠️ 중요**: Server/Client 클라이언트를 혼용하지 마세요!

### 3. 환경 변수 검증

```bash
# 개발 시작 전 검증
npm run check-env

# 빌드 전 자동 검증 (prebuild script)
npm run build
```

### 4. Git 커밋 컨벤션

**형식**: `type: subject (vX.Y.Z) [PRD-NNNN]`

**타입**:
- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `refactor`: 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가
- `chore`: 기타 작업

**예시**:
```bash
git commit -m "feat: Add AI quiz generation (v0.2.0) [PRD-0001]"
git commit -m "fix: Fix middleware cookie handling (v0.2.1) [#11]"
```

### 5. 브랜치 전략

**브랜치 명명**:
- `feature/PRD-NNNN-feature-name`
- `fix/issue-123-bug-description`
- `refactor/component-restructure`

**워크플로우**:
```bash
# 1. 기능 브랜치 생성
git checkout -b feature/PRD-0001-ai-quiz

# 2. 개발 & 커밋
git add .
git commit -m "feat: Add AI quiz generation (v0.2.0) [PRD-0001]"

# 3. 푸시
git push origin feature/PRD-0001-ai-quiz

# 4. 자동 PR 생성
npm run create-pr
```

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm test           # Watch mode (개발 중)
npm run test:ci    # CI mode (파이프라인)
```

### E2E Tests (Playwright)

```bash
npm run test:e2e               # 모든 브라우저
npm run test:e2e:ui            # UI 모드 (권장)
npm run test:e2e:chromium      # Chromium만
npm run test:e2e:debug         # 디버그 모드
```

자세한 내용은 [TESTING.md](./TESTING.md) 참조

---

## 🔐 Security

### 환경 변수 관리

**절대 커밋 금지**:
- `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GITHUB_TOKEN`

**.gitignore 확인**:
```gitignore
.env*
!.env.example
*.key
secrets/
```

### Row Level Security (RLS)

모든 테이블에서 RLS 활성화:
```sql
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
```

**정책 예시**:
```sql
-- 사용자는 자신의 진행률만 읽기
CREATE POLICY "Users can read own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);
```

### API 인증

```typescript
// API Route에서 인증 확인
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 인증된 사용자 작업
}
```

---

## 📚 추가 문서

- [QUICK_START.md](./QUICK_START.md) - 빠른 시작
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
- [TESTING.md](./TESTING.md) - 테스트 가이드
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 문제 해결
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 기여 가이드
- [CLAUDE.md](./CLAUDE.md) - Claude Code 개발 가이드

---

**버전**: 1.0.0 | **최종 업데이트**: 2025-01-17
