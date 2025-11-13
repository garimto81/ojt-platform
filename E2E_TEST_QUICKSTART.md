# Playwright E2E 테스트 빠른 시작 가이드

이 가이드는 OJT 플랫폼의 Playwright E2E 테스트를 빠르게 시작하는 방법을 설명합니다.

## 설치 완료 확인

모든 필수 구성 요소가 이미 설치되어 있습니다:

- ✅ Playwright Test (`@playwright/test`)
- ✅ Chromium, Firefox, WebKit 브라우저
- ✅ 테스트 설정 파일 (`playwright.config.ts`)
- ✅ 테스트 시나리오 (12개 테스트 × 3개 브라우저 = 36개 테스트)

## 5분 안에 테스트 실행하기

### 1단계: 개발 서버 시작

터미널 1에서 실행:

```bash
npm run dev -- -p 3001
```

서버가 시작될 때까지 대기 (약 10-30초)

### 2단계: 테스트 실행

터미널 2에서 실행:

```bash
# 권장: UI 모드로 실행 (시각적 인터페이스)
npm run test:e2e:ui
```

또는 헤드리스 모드로 실행:

```bash
npm run test:e2e
```

## 테스트 시나리오 개요

### 기본 네비게이션 테스트 (7개)

1. **홈페이지 → 대시보드 리다이렉트**
   - URL: http://localhost:3001
   - 검증: 자동으로 /dashboard로 이동

2. **404 페이지 Coming Soon**
   - URL: http://localhost:3001/dashboard/community
   - 검증: "곧 출시됩니다" 메시지 표시

3. **리더보드 페이지**
   - URL: http://localhost:3001/dashboard/leaderboard
   - 검증: "1위" 텍스트 또는 트로피 아이콘

4. **다중 페이지 네비게이션 성능**
   - 5개 페이지 연속 클릭
   - 각 페이지 로드 < 1초
   - 콘솔 에러 0건

5. **네비게이션 메뉴 동작**
   - 메뉴 항목 존재 확인
   - 클릭 가능 여부 검증

6. **주요 페이지 200 응답**
   - 모든 페이지 HTTP 200 확인

7. **리소스 로딩 검증**
   - JavaScript, CSS 파일 로드 확인

### AI 기능 테스트 (5개)

1. **AI 콘텐츠 정리 전체 플로우**
   - "예시 보기" 버튼 클릭
   - "AI로 정리하기" 버튼 클릭
   - 결과 대기 (최대 15초)
   - "학습 목표" 텍스트 확인

2. **UI 요소 검증**
   - 텍스트 영역, 버튼 존재 확인

3. **에러 핸들링**
   - 빈 입력 시 동작 확인

4. **성능 테스트**
   - AI 처리 시간 < 20초

5. **연속 요청 안정성**
   - 3회 연속 요청 테스트

## 유용한 명령어

### 테스트 실행

```bash
# UI 모드 (추천 - 시각적 디버깅)
npm run test:e2e:ui

# Headed 모드 (브라우저 창 표시)
npm run test:e2e:headed

# 디버그 모드 (단계별 실행)
npm run test:e2e:debug

# 특정 브라우저만 실행
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### 특정 테스트만 실행

```bash
# 기본 네비게이션만
npx playwright test basic-navigation

# AI 기능만
npx playwright test ai-features

# 특정 시나리오만
npx playwright test -g "시나리오 1"
```

### 결과 확인

```bash
# HTML 리포트 보기
npm run test:e2e:report
```

## 테스트 구조

```
ojt-platform/
├── playwright.config.ts          # Playwright 설정
├── tests/
│   └── e2e/
│       ├── README.md             # 상세 가이드
│       ├── basic-navigation.spec.ts  # 네비게이션 테스트
│       └── ai-features.spec.ts   # AI 기능 테스트
├── test-results/                 # 테스트 결과 (자동 생성)
└── playwright-report/            # HTML 리포트 (자동 생성)
```

## 설정 파일 하이라이트

### `playwright.config.ts` 주요 설정

```typescript
{
  baseURL: 'http://localhost:3001',
  timeout: 30000,              // 테스트 타임아웃 30초
  expect: { timeout: 5000 },   // Assertion 타임아웃 5초
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
  workers: process.env.CI ? 1 : undefined,  // 병렬 실행
  retries: process.env.CI ? 2 : 0,          // CI에서 재시도
}
```

### 자동 개발 서버 시작

`playwright.config.ts`에 다음 설정이 활성화되어 있습니다:

```typescript
webServer: {
  command: 'npm run dev -- -p 3001',
  port: 3001,
  timeout: 120000,
  reuseExistingServer: !process.env.CI,
}
```

이 설정이 활성화되어 있으면 테스트 실행 시 자동으로 개발 서버가 시작됩니다.

## 트러블슈팅

### 문제: 포트 3001이 이미 사용 중

**해결책 1**: 다른 포트 사용

```bash
npm run dev -- -p 3002
```

그리고 `playwright.config.ts`에서 `baseURL`을 수정:

```typescript
baseURL: 'http://localhost:3002'
```

**해결책 2**: 기존 프로세스 종료

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### 문제: 브라우저 실행 실패

**해결책**: 브라우저 재설치

```bash
npx playwright install --force chromium firefox webkit
```

### 문제: 테스트 타임아웃

**해결책**: `playwright.config.ts`에서 타임아웃 증가

```typescript
export default defineConfig({
  timeout: 60 * 1000,  // 60초
  expect: {
    timeout: 10000,    // 10초
  },
});
```

### 문제: 개발 서버가 시작되지 않음

**해결책 1**: 수동으로 서버 시작 후 테스트 실행

```bash
# 터미널 1
npm run dev -- -p 3001

# 터미널 2
npm run test:e2e
```

**해결책 2**: `playwright.config.ts`에서 `webServer` 주석 처리

```typescript
// webServer: {
//   command: 'npm run dev -- -p 3001',
//   ...
// },
```

## 다음 단계

1. **테스트 커버리지 확장**
   - 로그인/로그아웃 시나리오
   - 폼 유효성 검사
   - 파일 업로드/다운로드

2. **CI/CD 통합**
   - GitHub Actions에 E2E 테스트 추가
   - 자동화된 테스트 실행

3. **시각적 회귀 테스트**
   - 스크린샷 비교
   - 레이아웃 변경 감지

4. **성능 모니터링**
   - Lighthouse 통합
   - 페이지 로드 시간 추적

## 추가 리소스

- **상세 가이드**: `tests/e2e/README.md`
- **Playwright 문서**: https://playwright.dev/
- **Best Practices**: https://playwright.dev/docs/best-practices
- **API Reference**: https://playwright.dev/docs/api/class-playwright

## 자주 사용하는 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `npm run test:e2e` | 전체 테스트 실행 (헤드리스) |
| `npm run test:e2e:ui` | UI 모드로 실행 (추천) |
| `npm run test:e2e:headed` | 브라우저 창 표시하며 실행 |
| `npm run test:e2e:debug` | 디버그 모드 |
| `npm run test:e2e:chromium` | Chromium만 실행 |
| `npm run test:e2e:report` | HTML 리포트 보기 |
| `npx playwright test basic-navigation` | 특정 테스트 파일만 실행 |
| `npx playwright test -g "시나리오 1"` | 특정 테스트만 실행 |

## 테스트 작성 팁

### Given-When-Then 패턴

```typescript
test('사용자 로그인', async ({ page }) => {
  // Given: 초기 상태
  await page.goto('/login');

  // When: 액션 실행
  await page.fill('#email', 'user@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');

  // Then: 결과 검증
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1')).toContainText('대시보드');
});
```

### 재사용 가능한 헬퍼 함수

```typescript
async function login(page, email, password) {
  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test('로그인 후 프로필 편집', async ({ page }) => {
  await login(page, 'user@example.com', 'password123');
  // ... 나머지 테스트
});
```

## 성공 지표

테스트가 성공적으로 설정되었는지 확인:

- ✅ 모든 12개 테스트가 3개 브라우저에서 실행 (총 36개)
- ✅ 평균 로드 시간 < 800ms
- ✅ 콘솔 에러 0건
- ✅ 모든 페이지 HTTP 200 응답
- ✅ AI 처리 시간 < 20초

## 기여 방법

새로운 테스트를 추가하려면:

1. `tests/e2e/` 디렉토리에 `*.spec.ts` 파일 생성
2. Given-When-Then 패턴 사용
3. 명확한 테스트 이름과 주석 추가
4. 대안 검증 로직 구현 (try-catch)
5. 콘솔 로그로 진행 상황 출력

## 문의

문제가 발생하면:

1. `tests/e2e/README.md` 참조
2. Playwright 공식 문서 확인
3. GitHub Issues에 버그 리포트

---

**Happy Testing! 🎭**
