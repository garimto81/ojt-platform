import { test, expect } from '@playwright/test';

/**
 * 인증 시스템 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 비인증 사용자 → 보호된 라우트 접근 → 로그인 페이지 리다이렉트
 * 2. 로그인 페이지 접근 확인
 * 3. 로그아웃 플로우 (구현 후 테스트)
 * 4. Admin 라우트 접근 제어
 */

test.describe('인증 시스템 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 콘솔 에러 수집
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });

    // 페이지 에러 수집
    page.on('pageerror', (error) => {
      console.error(`Page error: ${error.message}`);
    });
  });

  test('시나리오 1: 비인증 사용자가 보호된 라우트 접근 시 로그인 페이지로 리다이렉트', async ({
    page,
  }) => {
    // Given: 비인증 상태에서 대시보드 접근 시도
    await page.goto('/dashboard');

    // When: 페이지 로드 완료 대기
    await page.waitForLoadState('domcontentloaded');

    // Then: URL이 /login으로 리다이렉트되었는지 확인
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });

    // Then: redirectTo 또는 callbackUrl 파라미터가 포함되어 있는지 확인
    const url = page.url();
    const hasRedirectParam = url.includes('redirectTo') || url.includes('callbackUrl');
    expect(hasRedirectParam).toBe(true);
    console.log('✓ 비인증 사용자 → 로그인 페이지 리다이렉트 성공');
  });

  test('시나리오 2: 로그인 페이지 정상 렌더링', async ({ page }) => {
    // Given: 로그인 페이지 접근
    await page.goto('/login');

    // When: 페이지 로드 완료 대기
    await page.waitForLoadState('domcontentloaded');

    // Then: 로그인 폼이 표시되는지 확인
    const loginForm = page.locator('form, [data-testid="login-form"]').first();
    await expect(loginForm).toBeVisible({ timeout: 5000 });

    console.log('✓ 로그인 페이지 렌더링 확인');
  });

  test('시나리오 3: Admin 라우트 접근 제어 (비인증)', async ({ page }) => {
    // Given: 비인증 상태에서 Admin 페이지 접근 시도
    await page.goto('/dashboard/admin/lessons');

    // When: 페이지 로드 완료 대기
    await page.waitForLoadState('domcontentloaded');

    // Then: URL이 /login으로 리다이렉트되었는지 확인
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });

    console.log('✓ 비인증 사용자 → Admin 라우트 차단 성공');
  });

  test('시나리오 4: Public 라우트는 인증 없이 접근 가능', async ({ page }) => {
    const publicRoutes = ['/', '/register'];

    for (const route of publicRoutes) {
      // Given: Public 라우트 접근
      await page.goto(route);

      // When: 페이지 로드 완료 대기
      await page.waitForLoadState('domcontentloaded');

      // Then: 로그인 페이지로 리다이렉트되지 않았는지 확인
      const url = page.url();
      expect(url).not.toContain('/login');

      console.log(`✓ Public 라우트 접근 가능: ${route}`);
    }
  });

  test.skip('시나리오 5: API 라우트는 Middleware에서 패스', async ({ page }) => {
    // TODO: API 구현 완료 후 활성화
    // Given: API 엔드포인트 접근
    const response = await page.request.get('/api/stats/public', { timeout: 10000 });

    // Then: 200 또는 401 응답 (인증 체크는 API 자체에서)
    expect([200, 401, 500]).toContain(response.status());

    console.log(`✓ API 라우트 Middleware 패스 확인: ${response.status()}`);
  });
});

test.describe('인증 플로우 테스트 (Supabase 연결 후 활성화)', () => {
  test.skip('시나리오 6: 로그인 성공 후 대시보드 이동', async ({ page }) => {
    // TODO: Supabase 실제 연결 후 구현
    // 1. /login 접근
    // 2. 이메일/비밀번호 입력
    // 3. 로그인 버튼 클릭
    // 4. /dashboard로 리다이렉트 확인
    // 5. 사용자 정보 표시 확인
  });

  test.skip('시나리오 7: 인증된 사용자가 로그인 페이지 접근 시 대시보드로 리다이렉트', async ({
    page,
  }) => {
    // TODO: Supabase 실제 연결 후 구현
    // 1. 로그인 상태
    // 2. /login 접근 시도
    // 3. /dashboard로 자동 리다이렉트 확인
  });

  test.skip('시나리오 8: 로그아웃 플로우', async ({ page }) => {
    // TODO: Supabase 실제 연결 후 구현
    // 1. 로그인 상태
    // 2. 로그아웃 버튼 클릭
    // 3. 쿠키 삭제 확인
    // 4. /login으로 리다이렉트 확인
  });

  test.skip('시나리오 9: Trainer 역할 사용자 Admin 라우트 접근', async ({ page }) => {
    // TODO: Supabase 실제 연결 후 구현
    // 1. Trainer 계정으로 로그인
    // 2. /dashboard/admin/lessons 접근
    // 3. 정상 접근 확인
  });

  test.skip('시나리오 10: Trainee 역할 사용자 Admin 라우트 차단', async ({ page }) => {
    // TODO: Supabase 실제 연결 후 구현
    // 1. Trainee 계정으로 로그인
    // 2. /dashboard/admin/lessons 접근 시도
    // 3. /dashboard로 리다이렉트 확인
  });
});

test.describe('세션 관리 테스트 (Supabase 연결 후 활성화)', () => {
  test.skip('시나리오 11: 세션 만료 시 자동 로그아웃', async ({ page }) => {
    // TODO: Supabase 실제 연결 후 구현
    // 1. 로그인 상태
    // 2. 세션 쿠키 만료 시뮬레이션
    // 3. 보호된 라우트 접근 시도
    // 4. /login으로 리다이렉트 확인
  });

  test.skip('시나리오 12: 세션 갱신 테스트', async ({ page }) => {
    // TODO: Supabase 실제 연결 후 구현
    // 1. 로그인 상태
    // 2. 일정 시간 대기
    // 3. 페이지 리로드
    // 4. 여전히 로그인 상태 유지 확인
  });
});
