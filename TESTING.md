# 🧪 Testing Guide

GG Production 플랫폼의 포괄적인 테스트 가이드입니다.

---

## 📋 테스트 전략

### 테스트 피라미드

```
        /\
       /E2E\ (5%)    - Playwright
      /------\
     /Integration\ (15%) - Jest
    /------------\
   /  Unit Tests  \ (80%) - Jest
  /----------------\
```

**목표**:
- Unit Tests: 80% 커버리지
- Integration Tests: 핵심 기능
- E2E Tests: 사용자 여정

---

## 🔬 Unit Tests (Jest)

### 실행 명령어

```bash
# Watch mode (개발 중)
npm test

# CI mode (파이프라인)
npm run test:ci

# 커버리지 리포트
npm run test:coverage
```

### 테스트 작성 예시

**컴포넌트 테스트**:
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**유틸리티 함수 테스트**:
```typescript
// src/lib/__tests__/format.test.ts
import { formatDate, formatPoints } from '../format'

describe('formatDate', () => {
  it('formats date correctly', () => {
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

### 베스트 프랙티스

**DO ✅**:
- 독립적인 테스트 작성
- AAA 패턴 (Arrange, Act, Assert)
- 의미 있는 테스트 이름
- 하나의 테스트는 하나의 개념만
- Mock은 최소한으로

**DON'T ❌**:
- 테스트 간 의존성 생성
- 구현 세부사항 테스트
- 하드코딩된 값
- 불필요한 중복

---

## 🎭 E2E Tests (Playwright)

### 빠른 시작

#### Step 1: 개발 서버 시작 (자동)

Playwright가 자동으로 서버를 시작합니다 (port 3001).

#### Step 2: 테스트 실행

```bash
# UI 모드 (권장 - 시각적 디버깅)
npm run test:e2e:ui

# Headless 모드 (CI용)
npm run test:e2e

# Headed 모드 (브라우저 창 표시)
npm run test:e2e:headed

# 디버그 모드
npm run test:e2e:debug
```

#### Step 3: 결과 확인

```bash
npm run test:e2e:report
```

### 브라우저별 실행

```bash
npm run test:e2e:chromium  # Chrome
npm run test:e2e:firefox   # Firefox
npm run test:e2e:webkit    # Safari
```

### 테스트 시나리오

**기본 네비게이션** (7개 테스트):
1. 홈페이지 → 대시보드 리다이렉트
2. 404 페이지 Coming Soon
3. 리더보드 표시
4. 다중 페이지 네비게이션 (5개 페이지 < 1초)
5. 메뉴 동작 확인
6. 모든 페이지 200 응답
7. 리소스 로딩 검증

**AI 기능** (5개 테스트):
1. AI 콘텐츠 정리 전체 플로우
2. UI 요소 검증
3. 에러 핸들링
4. 성능 테스트 (< 20초)
5. 연속 요청 안정성 (3회)

### 테스트 작성 예시

```typescript
// tests/e2e/user-auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Authentication', () => {
  test('should login successfully', async ({ page }) => {
    // Given: 로그인 페이지 접속
    await page.goto('/login')

    // When: 로그인 정보 입력
    await page.fill('#email', 'test@example.com')
    await page.fill('#password', 'password123')
    await page.click('button[type="submit"]')

    // Then: 대시보드로 이동
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('대시보드')
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', 'wrong@example.com')
    await page.fill('#password', 'wrong')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error')).toBeVisible()
    await expect(page.locator('.error')).toContainText('잘못된 인증 정보')
  })
})
```

### Playwright 설정

**파일**: `playwright.config.ts`

**주요 설정**:
```typescript
{
  baseURL: 'http://localhost:3001',
  timeout: 30000,              // 테스트 타임아웃
  expect: { timeout: 5000 },   // Assertion 타임아웃
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
}
```

### 특정 테스트 실행

```bash
# 특정 파일
npx playwright test basic-navigation.spec.ts

# 특정 테스트만
npx playwright test -g "시나리오 1"

# 특정 브라우저 + 특정 테스트
npx playwright test --project=chromium -g "로그인"
```

---

## ⚡ Performance Tests

### React DevTools 프로파일링

#### Step 1: 설치

React DevTools 브라우저 확장 프로그램 설치

#### Step 2: 프로파일링

1. React DevTools → **Profiler** 탭
2. **Record** 버튼 클릭
3. 테스트할 액션 수행 (사이드바 토글, 페이지 이동 등)
4. **Stop** 버튼 클릭
5. Flame graph 분석

**성공 지표**:
- 사이드바 토글: < 5개 컴포넌트 re-render
- 페이지 이동: < 12개 컴포넌트 re-render
- 각 액션: < 16ms (60fps)

### Chrome DevTools 성능 분석

#### CPU Profiling

1. Chrome DevTools → **Performance** 탭
2. **Record** 클릭
3. 액션 수행
4. **Stop** 클릭
5. 메인 스레드 활동 분석

**확인 사항**:
- Yellow blocks (JavaScript): 최소화
- Purple blocks (Rendering): 변경된 컴포넌트만
- Green blocks (Painting): 국소화

#### Memory Leak 확인

1. Chrome DevTools → **Memory** 탭
2. Heap snapshot (Baseline) 생성
3. 액션 20회 반복
4. Garbage Collection 강제 실행
5. 새 Heap snapshot 생성
6. 비교 분석

**성공 지표**:
- Detached DOM nodes: < 10
- Memory 증가: < 2MB
- 지속적인 증가 패턴 없음

### 성능 벤치마크

**페이지 로드 시간**:
```typescript
// 성능 측정
const start = performance.now()
router.push('/dashboard')
router.events.on('routeChangeComplete', () => {
  const end = performance.now()
  console.log(`Route change: ${end - start}ms`)
})
```

**목표**:
- 페이지 로드: < 1000ms
- 사이드바 토글: < 16ms
- API 응답: < 500ms

### Web Vitals 모니터링

```typescript
// src/app/layout.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  console.log(metric.name, metric.value)
  // Analytics 서비스로 전송
}

getCLS(sendToAnalytics)  // Cumulative Layout Shift
getFID(sendToAnalytics)  // First Input Delay
getFCP(sendToAnalytics)  // First Contentful Paint
getLCP(sendToAnalytics)  // Largest Contentful Paint
getTTFB(sendToAnalytics) // Time to First Byte
```

**목표 점수**:
- FCP: < 1.5s
- LCP: < 2.5s
- CLS: < 0.1
- FID: < 100ms
- TTFB: < 600ms

---

## 🔄 Continuous Integration

### GitHub Actions

**.github/workflows/test.yml**:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run test:ci
```

---

## 🐛 문제 해결

### Jest 관련

**문제**: "Cannot find module"
```bash
# 해결
npm install
rm -rf node_modules/.cache
```

**문제**: "Timeout"
```typescript
// jest.config.js
module.exports = {
  testTimeout: 10000  // 10초로 증가
}
```

### Playwright 관련

**문제**: 포트 충돌
```bash
# 다른 포트 사용
npm run dev -- -p 3002

# playwright.config.ts에서 baseURL 변경
```

**문제**: 브라우저 실행 실패
```bash
npx playwright install --force chromium firefox webkit
```

**문제**: 테스트 타임아웃
```typescript
// playwright.config.ts
{
  timeout: 60000,  // 60초로 증가
  expect: { timeout: 10000 }
}
```

---

## 📊 테스트 커버리지

### 현재 커버리지

**Unit Tests**:
- Components: 70%
- Utilities: 85%
- API Routes: 60%

**E2E Tests**:
- 기본 네비게이션: 7개 시나리오
- AI 기능: 5개 시나리오
- 총 브라우저: 3개 (Chromium, Firefox, WebKit)

### 목표 커버리지

- Unit Tests: 80% 이상
- Integration Tests: 핵심 기능 100%
- E2E Tests: 주요 사용자 여정 100%

---

## 🎯 테스트 체크리스트

### 개발 중
- [ ] 모든 새 기능에 Unit Test 작성
- [ ] 컴포넌트 테스트 (렌더링, 이벤트)
- [ ] 유틸리티 함수 테스트
- [ ] API Route 테스트

### PR 생성 전
- [ ] `npm run test:ci` 통과
- [ ] `npm run lint` 통과
- [ ] 새 E2E 시나리오 추가 (필요시)
- [ ] 커버리지 감소 없음

### 배포 전
- [ ] `npm run test:e2e` 모든 브라우저 통과
- [ ] 성능 테스트 통과
- [ ] Memory leak 없음
- [ ] Web Vitals 목표 달성

---

## 📚 추가 리소스

- **Jest 문서**: [jestjs.io](https://jestjs.io/)
- **Testing Library**: [testing-library.com](https://testing-library.com/)
- **Playwright 문서**: [playwright.dev](https://playwright.dev/)
- **React Testing**: [react.dev/learn/testing](https://react.dev/learn)
- **Web Vitals**: [web.dev/vitals](https://web.dev/vitals/)

---

## 🔗 관련 문서

- [DEVELOPMENT.md](./DEVELOPMENT.md) - 개발 워크플로우
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 배포 가이드
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - 문제 해결

---

**버전**: 1.0.0 | **최종 업데이트**: 2025-01-17
