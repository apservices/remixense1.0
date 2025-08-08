import { test, expect } from '@playwright/test';

// Basic smoke covering app load and PWA assets; saves artifacts on failure

test.describe('RemiXense production smoke', () => {
  test('home loads and manifest available with no unexpected console issues', async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (['warning', 'error'].includes(msg.type())) warnings.push(msg.text());
    });

    await page.goto('/');

    // Title contains brand
    await expect(page).toHaveTitle(/RemiXense/i);

    // Manifest reachable
    const res = await page.request.get('/manifest.json');
    expect(res.ok()).toBeTruthy();

    // Filter out known React Router v7 future flag warnings until we toggle flags
    const filtered = warnings.filter((w) => !/React Router Future Flag Warning/i.test(w));
    expect(filtered).toEqual([]);
  });
});
