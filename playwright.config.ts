import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 *
 * 주요 기능:
 * - 멀티 브라우저 테스트 (Chromium, Firefox, WebKit)
 * - 실패 시 자동 스크린샷 및 비디오 녹화
 * - 병렬 실행 지원
 * - 개발 서버 자동 시작 (옵션)
 */
export default defineConfig({
  // 테스트 파일 위치
  testDir: './tests/e2e',

  // 테스트 실행 타임아웃 (30초)
  timeout: 30 * 1000,

  // expect() 타임아웃 (5초)
  expect: {
    timeout: 5000,
  },

  // 실패한 테스트 재시도 횟수
  // CI 환경에서는 2회, 로컬에서는 0회
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,

  // 워커 수 (병렬 실행)
  // CI 환경에서는 1개, 로컬에서는 CPU 코어의 절반
  workers: process.env.CI ? 1 : undefined,

  // 테스트 결과 리포터
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // 공통 설정
  use: {
    // 기본 URL (모든 테스트에서 사용)
    baseURL: 'http://localhost:3001',

    // 네비게이션 타임아웃 (10초)
    navigationTimeout: 10 * 1000,

    // 액션 타임아웃 (5초)
    actionTimeout: 5 * 1000,

    // 실패 시 스크린샷 캡처
    screenshot: 'only-on-failure',

    // 실패 시 비디오 녹화
    video: 'retain-on-failure',

    // 실패 시 트레이스 수집 (디버깅용)
    trace: 'on-first-retry',

    // 브라우저 컨텍스트 설정
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // 로케일 및 타임존
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },

  // 테스트 프로젝트 (브라우저별)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chromium 전용 설정
        launchOptions: {
          args: ['--disable-web-security'], // CORS 테스트용
        },
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // 모바일 브라우저 (필요시 활성화)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 13'] },
    // },
  ],

  // 개발 서버 설정 (테스트 실행 시 자동 시작)
  // 주석 해제하면 테스트 실행 시 자동으로 dev 서버 시작
  webServer: {
    command: 'npm run dev -- -p 3001',
    port: 3001,
    timeout: 120 * 1000, // 서버 시작 대기 시간 (2분)
    reuseExistingServer: !process.env.CI, // CI에서는 새 서버 시작
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // 출력 디렉토리
  outputDir: 'test-results/',
});
