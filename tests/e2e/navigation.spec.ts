import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth for protected routes
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        user: { id: 'test-user', email: 'test@example.com' }
      }));
    });
  });

  test('should navigate to all main routes successfully', async ({ page }) => {
    const routes = [
      { path: '/', title: /RemiXense/i, heading: 'Dashboard' },
      { path: '/studio', title: /RemiXense/i, heading: 'Estúdio de Mixagem' },
      { path: '/tracks', title: /RemiXense/i, heading: 'Biblioteca' },
      { path: '/explorer', title: /RemiXense/i, heading: 'Explorar' },
      { path: '/vault', title: /RemiXense/i, heading: 'Vault' },
      { path: '/trends', title: /RemiXense/i, heading: 'Tendências' },
      { path: '/ai-studio', title: /RemiXense/i, heading: 'AI Studio' },
      { path: '/profile', title: /RemiXense/i, heading: 'Perfil' },
    ];

    for (const route of routes) {
      await test.step(`Navigate to ${route.path}`, async () => {
        await page.goto(route.path);
        
        // Verify page loads correctly
        await expect(page).toHaveTitle(route.title);
        
        // Verify main heading is present
        await expect(page.locator('h1')).toContainText(route.heading);
        
        // Verify no console errors
        const consoleMessages: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleMessages.push(msg.text());
          }
        });
        
        // Wait a bit for potential errors
        await page.waitForTimeout(1000);
        expect(consoleMessages.length).toBe(0);
      });
    }
  });

  test('should handle route transitions smoothly', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation via bottom nav
    await page.click('[data-testid="nav-studio"]');
    await expect(page).toHaveURL('/studio');
    await expect(page.locator('h1')).toContainText('Estúdio de Mixagem');
    
    await page.click('[data-testid="nav-tracks"]');
    await expect(page).toHaveURL('/tracks');
    await expect(page.locator('h1')).toContainText('Biblioteca');
    
    await page.click('[data-testid="nav-explorer"]');
    await expect(page).toHaveURL('/explorer');
    await expect(page.locator('h1')).toContainText('Explorar');
  });

  test('should display 404 for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route');
    await expect(page.locator('h1')).toContainText('404');
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Clear auth
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    await page.goto('/studio');
    await expect(page).toHaveURL('/login');
  });

  test('should preserve state during navigation', async ({ page }) => {
    await page.goto('/tracks');
    
    // Add some filter or search state
    await page.fill('input[placeholder*="Buscar"]', 'test search');
    
    // Navigate away and back
    await page.goto('/studio');
    await page.goto('/tracks');
    
    // State should be preserved (this depends on implementation)
    const searchValue = await page.inputValue('input[placeholder*="Buscar"]');
    expect(searchValue).toBe('test search');
  });
});