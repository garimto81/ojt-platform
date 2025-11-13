# Playwright E2E 테스트

이 디렉토리는 OJT 플랫폼의 End-to-End (E2E) 테스트를 포함합니다.

## 개요

Playwright를 사용하여 실제 브라우저 환경에서 사용자 시나리오를 자동으로 테스트합니다.

### 테스트 범위

1. **기본 네비게이션** (`basic-navigation.spec.ts`)
   - 홈페이지 → 대시보드 리다이렉트
   - 404 페이지 (Coming Soon)
   - 리더보드 페이지
   - 다중 페이지 네비게이션 성능
   - 네비게이션 메뉴 동작

2. **AI 기능** (`ai-features.spec.ts`)
   - AI 콘텐츠 정리 전체 플로우
   - UI 요소 검증
   - 에러 핸들링
   - 성능 테스트
   - 연속 요청 안정성

## 설치

```bash
# Playwright 설치 (이미 완료됨)
npm install --save-dev @playwright/test

# 브라우저 설치
npx playwright install chromium firefox webkit
```

## 실행 방법

### 기본 테스트 실행

```bash
# 모든 브라우저에서 전체 테스트 실행
npm run test:e2e

# UI 모드로 실행 (권장 - 시각적 디버깅)
npm run test:e2e:ui

# Headed 모드로 실행 (브라우저 창 표시)
npm run test:e2e:headed

# 디버그 모드로 실행 (단계별 실행)
npm run test:e2e:debug
```

### 브라우저별 실행

```bash
# Chromium만 실행
npm run test:e2e:chromium

# Firefox만 실행
npm run test:e2e:firefox

# WebKit만 실행
npm run test:e2e:webkit
```

### 특정 테스트 파일 실행

```bash
# 기본 네비게이션 테스트만 실행
npx playwright test basic-navigation

# AI 기능 테스트만 실행
npx playwright test ai-features

# 특정 테스트만 실행
npx playwright test -g "시나리오 1"
```

### 테스트 결과 확인

```bash
# HTML 리포트 보기
npm run test:e2e:report

# 또는
npx playwright show-report
```

## 개발 서버 설정

테스트 실행 전 개발 서버가 실행 중이어야 합니다.

### 방법 1: 수동 실행 (권장)

```bash
# 터미널 1: 개발 서버 실행
npm run dev -- -p 3001

# 터미널 2: 테스트 실행
npm run test:e2e
```

### 방법 2: 자동 실행

`playwright.config.ts`의 `webServer` 설정이 활성화되어 있어 자동으로 개발 서버가 시작됩니다.

```typescript
webServer: {
  command: 'npm run dev -- -p 3001',
  port: 3001,
  reuseExistingServer: !process.env.CI,
}
```

## 테스트 작성 가이드

### 기본 구조

```typescript
import { test, expect } from '@playwright/test';

test.describe('테스트 그룹 이름', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 실행되는 설정
  });

  test('테스트 이름', async ({ page }) => {
    // Given: 초기 상태 설정
    await page.goto('/dashboard');

    // When: 액션 실행
    await page.click('button');

    // Then: 결과 검증
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### 셀렉터 우선순위

1. **Role 기반** (가장 권장)
   ```typescript
   page.getByRole('button', { name: '로그인' })
   ```

2. **텍스트 기반**
   ```typescript
   page.getByText('환영합니다')
   ```

3. **Test ID** (안정적)
   ```typescript
   page.getByTestId('submit-button')
   ```

4. **CSS/XPath** (최후의 수단)
   ```typescript
   page.locator('.submit-btn')
   ```

### 대기 전략

```typescript
// 요소 표시 대기
await page.locator('button').waitFor({ state: 'visible' });

// 네트워크 대기
await page.waitForLoadState('networkidle');

// API 응답 대기
await page.waitForResponse(response =>
  response.url().includes('/api/') && response.status() === 200
);
```

## CI/CD 통합

### GitHub Actions 예시

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 디버깅

### 실패한 테스트 디버깅

```bash
# 디버그 모드로 실행
npm run test:e2e:debug

# 특정 테스트만 디버그
npx playwright test --debug -g "테스트 이름"
```

### 스크린샷 확인

실패한 테스트의 스크린샷은 자동으로 `test-results/` 디렉토리에 저장됩니다.

### 비디오 녹화

실패한 테스트의 비디오는 `test-results/` 디렉토리에 저장됩니다.

### 트레이스 확인

```bash
# 트레이스 뷰어 열기
npx playwright show-trace test-results/<test-name>/trace.zip
```

## 성능 최적화

### 병렬 실행

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
});
```

### 재시도 설정

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

## 모범 사례

### DO ✅

- **독립적인 테스트**: 각 테스트는 독립적으로 실행 가능해야 함
- **명확한 테스트 이름**: 테스트 목적을 명확하게 설명
- **적절한 대기**: `waitFor()` 사용, 임의의 `setTimeout()` 지양
- **의미 있는 Assertion**: 단순 존재 여부뿐 아니라 실제 기능 검증
- **에러 핸들링**: Try-catch로 대안 검증 로직 구현

### DON'T ❌

- **테스트 간 의존성**: 테스트 순서에 의존하지 않기
- **하드코딩된 대기**: `await page.waitForTimeout(5000)` 지양
- **과도한 CSS 셀렉터**: 유지보수가 어려움
- **불필요한 검증**: 너무 세부적인 내용 검증 지양
- **공유 상태**: 테스트 간 상태 공유 금지

## 문제 해결

### 브라우저 실행 실패

```bash
# 브라우저 재설치
npx playwright install --force chromium firefox webkit
```

### 포트 충돌

```bash
# 다른 포트 사용
npm run dev -- -p 3002
```

`playwright.config.ts`에서 `baseURL` 수정 필요

### 타임아웃 에러

`playwright.config.ts`에서 타임아웃 증가:

```typescript
export default defineConfig({
  timeout: 60 * 1000, // 60초
  expect: {
    timeout: 10000, // 10초
  },
});
```

## 추가 리소스

- [Playwright 공식 문서](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Selectors Guide](https://playwright.dev/docs/selectors)

## 기여 가이드

새로운 테스트를 추가할 때:

1. 테스트 목적을 명확히 설명하는 주석 추가
2. Given-When-Then 패턴 사용
3. 여러 시나리오를 `describe` 블록으로 그룹화
4. 콘솔 로그로 테스트 진행 상황 출력
5. 대안 검증 로직 구현 (유연한 테스트)

## 라이선스

이 프로젝트의 라이선스를 따릅니다.
