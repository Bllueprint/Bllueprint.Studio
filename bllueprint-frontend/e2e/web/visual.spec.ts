import { expect, test } from '@playwright/test';
import { openApp, openPlayground } from './helpers';

/**
 * Visual regression of the sketch look, one screenshot per theme.
 *
 * Screenshots depend on the OS font rendering, so Playwright stores them per
 * platform (`*-linux.png`, `*-win32.png`). Baselines are generated with
 * `npm run test:e2e:visual -- --update-snapshots` on the platform that will
 * run them (CI = Linux) and committed next to this file. The suite is its own
 * Playwright project (`visual`) so a machine without baselines does not fail
 * the functional `web` project.
 */
test.describe('visual regression', () => {
  for (const theme of ['paper', 'blueprint', 'navy'] as const) {
    test(`playground basics in the ${theme} theme`, async ({ page }) => {
      await openApp(page, theme);
      await openPlayground(page);
      await page.locator('.pg__anchor', { hasText: 'Basics' }).click();
      await page.waitForTimeout(300);

      await expect(page.locator('.pg__canvas')).toHaveScreenshot(`playground-basics-${theme}.png`, {
        animations: 'disabled',
      });
    });
  }
});
