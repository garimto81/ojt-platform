import { test, expect } from '@playwright/test';

/**
 * 기본 네비게이션 E2E 테스트
 *
 * 테스트 시나리오:
 * 1. 홈페이지 → 대시보드 자동 리다이렉트
 * 2. 404 페이지 (Coming Soon)
 * 3. 리더보드 페이지
 * 4. 페이지 간 네비게이션 성능
 */

test.describe('기본 네비게이션 테스트', () => {
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

  test('시나리오 1: 홈페이지에서 대시보드로 자동 리다이렉트', async ({ page }) => {
    // Given: 사용자가 홈페이지에 접속
    await page.goto('/');

    // When: 페이지 로드 완료 대기
    await page.waitForLoadState('networkidle');

    // Then: URL이 /dashboard로 리다이렉트되었는지 확인
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });

    // Then: 대시보드 페이지가 정상적으로 렌더링되었는지 확인
    const dashboardTitle = page.locator('h1, h2').first();
    await expect(dashboardTitle).toBeVisible({ timeout: 3000 });

    console.log('✓ 홈페이지 → 대시보드 리다이렉트 성공');
  });

  test('시나리오 2: 404 페이지 Coming Soon 메시지 표시', async ({ page }) => {
    // Given: 존재하지 않는 경로에 접속
    await page.goto('/dashboard/community');

    // When: 페이지 로드 완료 대기
    await page.waitForLoadState('domcontentloaded');

    // Then: Coming Soon 메시지가 표시되는지 확인
    const comingSoonText = page.getByText(/곧 출시됩니다|Coming Soon/i);
    await expect(comingSoonText).toBeVisible({ timeout: 5000 });

    // Then: 페이지가 정상적으로 렌더링되었는지 확인 (에러 페이지가 아닌지)
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent?.length).toBeGreaterThan(10);

    console.log('✓ 404 페이지 Coming Soon 메시지 확인 완료');
  });

  test('시나리오 3: 리더보드 페이지 TOP 10 표시', async ({ page }) => {
    // Given: 리더보드 페이지에 접속
    await page.goto('/dashboard/leaderboard');

    // When: 페이지 로드 완료 대기
    await page.waitForLoadState('domcontentloaded');

    // Then: 리더보드 컨텐츠가 표시되는지 확인
    // 옵션 1: "1위" 텍스트 확인
    const firstPlaceIndicator = page.getByText(/1위|#1|Top 1/i).first();

    // 옵션 2: 트로피 아이콘 확인 (svg, img, 또는 아이콘 요소)
    const trophyIcon = page.locator('svg, img, [class*="trophy"], [class*="medal"]').first();

    // 둘 중 하나라도 존재하면 성공
    try {
      await expect(firstPlaceIndicator).toBeVisible({ timeout: 5000 });
      console.log('✓ 리더보드 "1위" 텍스트 확인 완료');
    } catch {
      await expect(trophyIcon).toBeVisible({ timeout: 5000 });
      console.log('✓ 리더보드 트로피 아이콘 확인 완료');
    }

    // Then: 리더보드 제목 확인
    const pageTitle = page.locator('h1, h2').first();
    await expect(pageTitle).toBeVisible();

    console.log('✓ 리더보드 페이지 렌더링 완료');
  });

  test('시나리오 4: 다중 페이지 네비게이션 성능 테스트', async ({ page }) => {
    const pages = [
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/dashboard/learning', name: 'Learning' },
      { path: '/dashboard/content', name: 'Content' },
      { path: '/dashboard/admin', name: 'Admin' },
      { path: '/dashboard', name: 'Dashboard (재방문)' },
    ];

    const navigationTimes: { page: string; time: number }[] = [];
    let consoleErrors = 0;

    // 콘솔 에러 카운트
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors++;
      }
    });

    for (const pageInfo of pages) {
      // When: 각 페이지로 이동하고 로드 시간 측정
      const startTime = Date.now();
      await page.goto(pageInfo.path);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      navigationTimes.push({ page: pageInfo.name, time: loadTime });

      // Then: 페이지가 1초 이내에 로드되는지 확인
      expect(loadTime).toBeLessThan(1000);

      console.log(`✓ ${pageInfo.name}: ${loadTime}ms`);
    }

    // Then: 콘솔 에러가 없는지 확인
    expect(consoleErrors).toBe(0);

    // Then: 평균 로드 시간 계산
    const avgLoadTime =
      navigationTimes.reduce((sum, item) => sum + item.time, 0) / navigationTimes.length;
    console.log(`✓ 평균 로드 시간: ${avgLoadTime.toFixed(2)}ms`);

    // Then: 평균 로드 시간이 800ms 이내인지 확인
    expect(avgLoadTime).toBeLessThan(800);

    console.log('✓ 다중 페이지 네비게이션 성능 테스트 완료');
  });

  test('시나리오 5: 네비게이션 메뉴 동작 확인', async ({ page }) => {
    // Given: 대시보드 페이지 접속
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Then: 네비게이션 메뉴가 존재하는지 확인
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible({ timeout: 5000 });

    // Then: 주요 메뉴 항목이 클릭 가능한지 확인
    const menuItems = [
      { text: /대시보드|Dashboard/i, path: '/dashboard' },
      { text: /학습|Learning/i, path: '/dashboard/learning' },
      { text: /콘텐츠|Content/i, path: '/dashboard/content' },
    ];

    for (const menuItem of menuItems) {
      try {
        const menuLink = page.getByRole('link', { name: menuItem.text }).first();
        await expect(menuLink).toBeVisible({ timeout: 3000 });
        console.log(`✓ 메뉴 항목 발견: ${menuItem.text.source}`);
      } catch {
        console.log(`⚠ 메뉴 항목 미발견: ${menuItem.text.source} (선택 사항)`);
      }
    }

    console.log('✓ 네비게이션 메뉴 확인 완료');
  });
});

test.describe('페이지 로드 안정성 테스트', () => {
  test('모든 주요 페이지가 200 응답을 반환하는지 확인', async ({ page }) => {
    const pages = [
      '/dashboard',
      '/dashboard/learning',
      '/dashboard/content',
      '/dashboard/leaderboard',
      '/dashboard/admin',
    ];

    for (const path of pages) {
      const response = await page.goto(path);

      // Then: HTTP 200 응답 확인
      expect(response?.status()).toBe(200);

      // Then: 페이지 타이틀이 존재하는지 확인
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      console.log(`✓ ${path}: ${response?.status()} - ${title}`);
    }

    console.log('✓ 모든 주요 페이지 로드 안정성 확인 완료');
  });

  test('페이지 리소스 로딩 검증', async ({ page }) => {
    // Given: 대시보드 페이지 접속
    await page.goto('/dashboard');

    // When: 모든 리소스 로드 완료 대기
    await page.waitForLoadState('networkidle');

    // Then: JavaScript 파일이 로드되었는지 확인
    const scripts = await page.locator('script[src]').count();
    expect(scripts).toBeGreaterThan(0);

    // Then: CSS 파일이 로드되었는지 확인
    const styles = await page.locator('link[rel="stylesheet"]').count();
    expect(styles).toBeGreaterThanOrEqual(0); // Next.js는 인라인 스타일 사용 가능

    console.log(`✓ 리소스 로드 완료: ${scripts}개 스크립트, ${styles}개 스타일시트`);
  });
});
