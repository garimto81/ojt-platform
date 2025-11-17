# 🤝 Contributing Guide

GG Production 플랫폼 오픈소스 기여 가이드입니다.

---

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [기여 워크플로우](#기여-워크플로우)
3. [코드 스타일](#코드-스타일)
4. [Pull Request 프로세스](#pull-request-프로세스)
5. [커밋 메시지 규칙](#커밋-메시지-규칙)
6. [테스트 요구사항](#테스트-요구사항)
7. [문서화](#문서화)
8. [행동 강령](#행동-강령)

---

## 🛠️ 개발 환경 설정

### Step 1: Repository Fork

1. GitHub에서 [ojt-platform](https://github.com/garimto81/ojt-platform) 포크
2. 로컬에 클론:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ojt-platform.git
   cd ojt-platform
   ```
3. Upstream 원격 저장소 추가:
   ```bash
   git remote add upstream https://github.com/garimto81/ojt-platform.git
   ```

### Step 2: 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (자동화)
npm run setup:supabase

# 또는 수동 설정
cp .env.example .env.local
# .env.local 편집
```

**필수 환경 변수**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (admin 기능 테스트 시)
- `GEMINI_API_KEY` (AI 기능 테스트 시)

### Step 3: 데이터베이스 설정

Supabase Dashboard → SQL Editor에서 마이그레이션 실행:

```bash
# 순서대로 실행
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_seed_data.sql
supabase/migrations/003_sample_lesson_content.sql
# ... 010_ai_confidence_score.sql까지
```

### Step 4: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 확인

---

## 🔄 기여 워크플로우

### 1. Issue 생성 또는 선택

**새 기능 제안**:
```bash
gh issue create --title "feat: Add feature X" --body "Description..."
```

**버그 리포트**:
```bash
gh issue create --title "fix: Bug in Y" --body "Steps to reproduce..."
```

**기존 Issue 선택**:
- [Good First Issue](https://github.com/garimto81/ojt-platform/labels/good%20first%20issue) 라벨 확인
- Issue에 댓글로 작업 의사 표시

### 2. Feature Branch 생성

```bash
# Upstream 최신 상태 동기화
git fetch upstream
git checkout main
git merge upstream/main

# 새 브랜치 생성
git checkout -b feature/issue-123-feature-name
# 또는
git checkout -b fix/issue-456-bug-description
```

**브랜치 명명 규칙**:
- `feature/issue-NNN-short-description`
- `fix/issue-NNN-bug-name`
- `docs/issue-NNN-doc-update`
- `refactor/issue-NNN-refactor-name`

### 3. 개발 진행

**개발 사이클**:
```bash
# 1. 코드 작성
vim src/feature.ts

# 2. 테스트 작성 (필수!)
vim tests/feature.test.ts

# 3. 로컬 테스트 실행
npm test
npm run test:e2e

# 4. 린트 체크
npm run lint

# 5. 빌드 테스트
npm run build
```

**1:1 Test Pairing (필수)**:
- 모든 구현 파일은 대응하는 테스트 파일 필요
- `src/foo.ts` → `tests/foo.test.ts`
- PR 시 테스트 없는 코드는 거부됨

### 4. 커밋

```bash
git add .
git commit -m "feat: Add feature X (v1.2.0) [#123]"
git push origin feature/issue-123-feature-name
```

### 5. Pull Request 생성

**자동 생성** (권장):
```bash
npm run create-pr
```

**수동 생성**:
```bash
gh pr create --title "feat: Add feature X [#123]" \
  --body "## Summary\n\n- Implements #123\n- Adds feature X\n\n## Test Plan\n\n- [ ] Unit tests pass\n- [ ] E2E tests pass"
```

---

## 🎨 코드 스타일

### TypeScript

**DO ✅**:
```typescript
// Path alias 사용
import { createClient } from '@/lib/supabase/server'

// 명시적 타입 정의
interface User {
  id: string
  email: string
  role: 'trainee' | 'trainer' | 'admin'
}

// async/await 사용
async function fetchUser(id: string): Promise<User | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', id)
    .single()

  if (error) return null
  return data
}
```

**DON'T ❌**:
```typescript
// 상대 경로
import { createClient } from '../../lib/supabase/server'

// any 타입
function fetchUser(id: any): any { }

// 타입 없는 Promise
async function fetchUser(id: string) { }
```

### React 컴포넌트

**Server Component (기본)**:
```typescript
// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data } = await supabase.from('lessons').select()

  return <div>{data?.map(...)}</div>
}
```

**Client Component**:
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export default function InteractiveComponent() {
  const [data, setData] = useState(null)
  const supabase = createClient()

  // 클라이언트 사이드 로직
}
```

### 파일 구조

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # App pages
│   └── ...
├── components/
│   ├── ui/            # Shadcn UI components
│   └── ...            # Feature components
├── lib/
│   ├── supabase/
│   ├── types/
│   └── utils/
└── ...
```

### ESLint

모든 PR은 ESLint 통과 필수:

```bash
npm run lint

# 자동 수정
npm run lint -- --fix
```

---

## 📝 Pull Request 프로세스

### PR 체크리스트

PR 생성 전 확인:

- [ ] 최신 `main` 브랜치와 병합 완료
- [ ] 모든 테스트 통과 (`npm test`, `npm run test:e2e`)
- [ ] 린트 체크 통과 (`npm run lint`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 1:1 테스트 파일 존재 (구현 파일마다)
- [ ] 타입 정의 완료 (TypeScript strict mode)
- [ ] 커밋 메시지 규칙 준수
- [ ] 문서 업데이트 (필요 시)

### PR 템플릿

```markdown
## Summary
<!-- 변경 사항 요약 -->

Fixes #123

## Changes
- Added feature X
- Refactored component Y
- Fixed bug Z

## Test Plan
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
<!-- UI 변경 시 스크린샷 첨부 -->

## Checklist
- [ ] Tests pass
- [ ] Lint passes
- [ ] Build succeeds
- [ ] Docs updated
```

### 리뷰 프로세스

1. **자동 검사** (GitHub Actions):
   - TypeScript 컴파일
   - ESLint 체크
   - Jest 단위 테스트
   - Playwright E2E 테스트 (일부)

2. **코드 리뷰**:
   - 최소 1명의 Maintainer 승인 필요
   - 요청된 변경사항 반영

3. **병합**:
   - Squash merge 사용 (커밋 히스토리 정리)
   - 브랜치 자동 삭제

---

## 💬 커밋 메시지 규칙

### 형식

```
type: subject (vX.Y.Z) [#issue]

body (선택)

footer (선택)
```

### Type

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `perf`: 성능 개선
- `test`: 테스트 추가/수정
- `chore`: 빌드 설정, 패키지 업데이트

### 예시

```bash
# 새 기능
feat: Add AI quiz generation (v0.2.0) [#42]

# 버그 수정
fix: Fix middleware cookie handling (v0.2.1) [#11]

# 문서 업데이트
docs: Update QUICK_START.md (v1.0.0) [#50]

# 리팩토링
refactor: Simplify authentication flow (v1.1.0) [#55]

# 테스트 추가
test: Add E2E tests for login flow (v1.0.1) [#60]
```

### Semantic Versioning

버전 번호 규칙:

- **MAJOR (v2.0.0)**: Breaking changes (호환성 깨짐)
- **MINOR (v1.2.0)**: 새 기능 (하위 호환)
- **PATCH (v1.0.1)**: 버그 수정

---

## 🧪 테스트 요구사항

### 단위 테스트 (Jest)

**모든 새 기능은 테스트 필수**:

```typescript
// tests/utils/format.test.ts
import { formatDate, formatPoints } from '@/lib/utils/format'

describe('formatDate', () => {
  it('formats date correctly in Korean', () => {
    const date = new Date('2025-01-17')
    expect(formatDate(date)).toBe('2025년 1월 17일')
  })
})

describe('formatPoints', () => {
  it('formats points with commas', () => {
    expect(formatPoints(1000)).toBe('1,000')
    expect(formatPoints(1234567)).toBe('1,234,567')
  })
})
```

**커버리지 목표**:
- 전체: 80% 이상
- 새 파일: 100%

```bash
npm run test:coverage
```

### E2E 테스트 (Playwright)

**주요 기능 변경 시 E2E 테스트 추가**:

```typescript
// tests/e2e/feature.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Feature X', () => {
  test('should complete user flow', async ({ page }) => {
    // Given: 초기 상태
    await page.goto('/dashboard')

    // When: 사용자 액션
    await page.click('button#feature-x')

    // Then: 기대 결과
    await expect(page.locator('h1')).toContainText('Success')
  })
})
```

**실행**:
```bash
npm run test:e2e:ui  # UI 모드 (개발 중)
npm run test:e2e     # Headless (CI)
```

### 테스트 작성 가이드

**AAA 패턴** (Arrange, Act, Assert):
```typescript
test('description', () => {
  // Arrange: 테스트 준비
  const input = 'test'

  // Act: 실행
  const result = myFunction(input)

  // Assert: 검증
  expect(result).toBe('expected')
})
```

**DO ✅**:
- 독립적인 테스트 (순서 무관)
- 의미 있는 테스트 이름
- Edge case 포함

**DON'T ❌**:
- 테스트 간 의존성
- 하드코딩된 값
- 구현 세부사항 테스트

---

## 📚 문서화

### 코드 주석

**필요한 경우만 주석 작성**:

```typescript
// ✅ Good: 복잡한 로직 설명
// SuperMemo SM-2 알고리즘 구현
// interval = interval * ease_factor
// ease_factor는 2.5에서 시작하여 정답률에 따라 조정
function calculateNextReview(quality: number): number {
  // ...
}

// ❌ Bad: 자명한 코드
// 사용자 ID를 가져옴
const userId = user.id
```

### README 업데이트

기능 추가 시 README.md의 Features 섹션 업데이트:

```markdown
## Features

- ✅ AI-powered content organization
- ✅ Random quiz generation
- ✅ Spaced repetition system (NEW!)
```

### CHANGELOG 업데이트

모든 PR은 CHANGELOG.md 업데이트 필요:

```markdown
## [Unreleased]

### Added
- Spaced repetition system based on SuperMemo SM-2 [#123]

### Fixed
- Quiz submission timeout bug [#124]
```

---

## 🤝 행동 강령

### 존중과 협력

- 건설적인 피드백 제공
- 다양한 의견 존중
- 포용적인 언어 사용

### 금지 행위

- 차별적/공격적 언어
- 괴롭힘 또는 트롤링
- 스팸 또는 광고성 PR

### 보고

문제 발생 시: [garimto81@gmail.com](mailto:garimto81@gmail.com)

---

## 🆘 도움 받기

### 질문하기

- **GitHub Discussions**: 일반 질문, 아이디어 공유
- **GitHub Issues**: 버그 리포트, 기능 제안
- **Discord**: 실시간 채팅 (준비 중)

### 리소스

- [QUICK_START.md](./QUICK_START.md) - 빠른 시작
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 개발 워크플로우
- [TESTING.md](./TESTING.md) - 테스트 가이드
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 문제 해결

---

## 🎯 기여 아이디어

### Good First Issues

처음 기여하는 분들을 위한 간단한 작업:

- [ ] 문서 오타 수정
- [ ] 테스트 커버리지 개선
- [ ] UI 컴포넌트 접근성 개선
- [ ] 번역 추가 (영어 → 한글)

**라벨 필터**:
- `good first issue`: 초보자 친화적
- `help wanted`: 도움 필요
- `documentation`: 문서 작업

### 주요 기여 영역

**AI 기능 개선**:
- 퀴즈 품질 향상 (다양한 문제 유형)
- 콘텐츠 정리 정확도 개선
- 스페이스 반복 알고리즘 최적화

**UI/UX 개선**:
- 모바일 반응형 개선
- 다크 모드 지원
- 접근성 개선 (ARIA 라벨, 키보드 내비게이션)

**성능 최적화**:
- 이미지 최적화
- 코드 스플리팅
- 데이터베이스 쿼리 최적화

**테스트 강화**:
- E2E 테스트 시나리오 추가
- 엣지 케이스 테스트
- 성능 테스트 자동화

---

## 📊 기여 통계

프로젝트 현황:

- **Contributors**: 1명 (더 많은 기여자 환영!)
- **Open Issues**: [확인하기](https://github.com/garimto81/ojt-platform/issues)
- **Pull Requests**: [확인하기](https://github.com/garimto81/ojt-platform/pulls)

---

## 🙏 감사의 말

모든 기여자분들께 감사드립니다! 🎉

- 코드 기여
- 버그 리포트
- 문서 개선
- 아이디어 제안

**함께 만들어가는 오픈소스 프로젝트입니다!**

---

**버전**: 1.0.0 | **최종 업데이트**: 2025-01-17
