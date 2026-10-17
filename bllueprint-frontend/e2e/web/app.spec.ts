import { expect, test } from '@playwright/test';
import { openApp, sidebarButton, watchConsole } from './helpers';

test.describe('app shell (smoke)', () => {
  test('boots on the home tab with the stored theme and a clean console', async ({ page }) => {
    const problems = watchConsole(page);

    await openApp(page, 'navy');

    await expect(page).toHaveTitle('Bllueprint');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'navy');
    await expect(page.locator('html')).toHaveAttribute('data-scheme', 'dark');
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);
    await expect(page.getByRole('tab', { name: 'Home' })).toHaveAttribute('aria-selected', 'true');
    expect(problems()).toEqual([]);
  });

  test('opens the editor with the welcome file in Monaco', async ({ page }) => {
    const problems = watchConsole(page);
    await openApp(page);

    await sidebarButton(page, 'Editor').click();

    await expect(page.getByRole('tab', { name: 'Editor' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('tab', { name: 'main.ts' })).toBeVisible();
    await expect(page.locator('.monaco-editor .view-line').first()).toBeVisible();
    expect(await page.locator('.monaco-editor .view-line').count()).toBeGreaterThan(10);
    expect(problems()).toEqual([]);
  });

  test('workspace tabs open once, switch and close', async ({ page }) => {
    await openApp(page);

    await sidebarButton(page, 'Playground').click();
    await sidebarButton(page, 'Playground').click();
    await expect(page.getByRole('tab', { name: 'Playground' })).toHaveCount(1);

    await sidebarButton(page, 'Editor').click();
    await expect(page.getByRole('tab', { name: 'Editor' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await page
      .getByRole('tab', { name: 'Editor' })
      .getByRole('button', { name: 'Close tab' })
      .click();
    await expect(page.getByRole('tab', { name: 'Editor' })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Playground' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Home is fixed: it has no close button.
    await expect(page.getByRole('tab', { name: 'Home' }).getByRole('button')).toHaveCount(0);
  });

  test('workspace tabs are keyboard operable (Enter and Space)', async ({ page }) => {
    await openApp(page);
    await sidebarButton(page, 'Playground').click();

    await page.getByRole('tab', { name: 'Home' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tab', { name: 'Home' })).toHaveAttribute('aria-selected', 'true');

    await page.getByRole('tab', { name: 'Playground' }).focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('tab', { name: 'Playground' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
