import { expect, test } from '@playwright/test';
import { openApp, openPlayground, watchConsole } from './helpers';

test.describe('playground (regression)', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page);
    await openPlayground(page);
  });

  test('theme selector switches the theme and persists it across reloads', async ({ page }) => {
    await page.locator('.pg__toolbar select').selectOption('navy');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'navy');
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'navy');
  });

  test('stroke slider is a real range input driving the stroke token', async ({ page }) => {
    const slider = page.locator('.pg__toolbar sk-slider input[type="range"]');
    const value = page.locator('.pg__toolbar .pg__control-value');

    await expect(value).toHaveText('2px');
    await slider.focus();
    await page.keyboard.press('ArrowRight');

    await expect(value).toHaveText('2.5px');
    await expect(page.locator('html')).toHaveCSS('--sketch-width', '2.5px');
  });

  test('dropdown menus close on outside click, on another menu and on Escape', async ({ page }) => {
    const options = page.locator('details.sk-menu').first();
    const fileMenu = page.locator('.sk-menubar details.sk-menu').first();

    await options.scrollIntoViewIfNeeded();
    await options.locator('summary').click();
    await expect(options).toHaveAttribute('open', '');

    await fileMenu.locator('summary').click();
    await expect(options).not.toHaveAttribute('open', '');
    await expect(fileMenu).toHaveAttribute('open', '');

    await page.locator('.pg__section-title', { hasText: 'Overlays' }).click();
    await expect(fileMenu).not.toHaveAttribute('open', '');

    await options.locator('summary').click();
    await page.keyboard.press('Escape');
    await expect(options).not.toHaveAttribute('open', '');
  });

  test('datagrid headers sort ascending, descending and back to unsorted', async ({ page }) => {
    const grid = page.locator('.sk-table-wrap--grid');
    const ownerHeader = grid.getByRole('button', { name: 'Owner' });
    const ownerColumn = grid.locator('th').filter({ hasText: 'Owner' });
    const firstOwner = grid.locator('tbody tr').first().locator('td').nth(2);
    const firstId = grid.locator('tbody tr').first().locator('td').nth(0);

    await grid.scrollIntoViewIfNeeded();
    await expect(firstId).toHaveText('1');

    await ownerHeader.click();
    await expect(ownerColumn).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstOwner).toHaveText('Ana');

    await ownerHeader.click();
    await expect(ownerColumn).toHaveAttribute('aria-sort', 'descending');
    await expect(firstOwner).toHaveText('Fabio');

    await ownerHeader.click();
    await expect(ownerColumn).not.toHaveAttribute('aria-sort', /.+/);
    await expect(firstId).toHaveText('1');
  });

  test('side by side renders every registered theme in its own pane', async ({ page }) => {
    await page.getByLabel('All themes side by side').check();

    const panes = page.locator('.pg__canvas--labelled');
    await expect(panes).toHaveCount(3);
    await expect(panes.nth(0)).toHaveAttribute('data-theme', 'paper');
    await expect(panes.nth(1)).toHaveAttribute('data-theme', 'blueprint');
    await expect(panes.nth(2)).toHaveAttribute('data-theme', 'navy');
  });

  test('runs with a clean console', async ({ page }) => {
    const problems = watchConsole(page);

    await page.locator('.pg__toolbar select').selectOption('blueprint');
    await page.getByLabel('All themes side by side').check();
    await page.locator('.pg__anchor', { hasText: 'Data' }).first().click();

    expect(problems()).toEqual([]);
  });
});
