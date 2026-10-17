import { Page, expect } from '@playwright/test';

/** Collects console errors and page exceptions so a test can assert the run was clean. */
export function watchConsole(page: Page): () => string[] {
  const problems: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(`[console.${message.type()}] ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => problems.push(`[pageerror] ${error.message}`));

  return () => problems;
}

/** Opens the app with a given theme already stored, as a returning user would see it. */
export async function openApp(page: Page, theme: 'paper' | 'blueprint' | 'navy' = 'paper') {
  // Init scripts run again on every navigation; seed the theme only once per
  // tab so a test that changes it and reloads sees its own change persisted.
  await page.addInitScript((storedTheme) => {
    if (!sessionStorage.getItem('e2e.theme-seeded')) {
      localStorage.setItem('sketch-ui.theme', storedTheme);
      sessionStorage.setItem('e2e.theme-seeded', '1');
    }
  }, theme);
  await page.goto('/');
  await expect(page.locator('app-root')).toBeVisible();
}

/** Sidebar navigation (the Spartan sidebar menu buttons). */
export function sidebarButton(page: Page, label: 'Home' | 'Editor' | 'Playground') {
  return page.locator('hlm-sidebar').getByRole('button', { name: label, exact: true });
}

/** Opens the playground tab and waits for its toolbar. */
export async function openPlayground(page: Page) {
  await sidebarButton(page, 'Playground').click();
  await expect(page.locator('.pg__toolbar')).toBeVisible();
}
