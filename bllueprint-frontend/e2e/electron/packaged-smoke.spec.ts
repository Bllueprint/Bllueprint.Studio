import { _electron as electron, expect, test } from '@playwright/test';

/**
 * Smoke test of the PACKAGED desktop app (what a release ships): the window
 * loads over the `bllueprint://` scheme with the CSP, the sandboxed preload
 * bridge answers, Monaco renders and the console stays clean.
 *
 * Set BLLUEPRINT_APP_EXE to the executable produced by electron-builder, e.g.
 * `../bllueprint-desktop/release/win-unpacked/Bllueprint.exe`.
 */
const exe = process.env['BLLUEPRINT_APP_EXE'];

test.skip(!exe, 'BLLUEPRINT_APP_EXE is not set; package the desktop app first');

test('packaged app boots over app:// with the hardened renderer', async () => {
  // The VS Code terminal sets ELECTRON_RUN_AS_NODE=1, which would turn the
  // executable into a plain Node process.
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key !== 'ELECTRON_RUN_AS_NODE' && value !== undefined) env[key] = value;
  }

  const app = await electron.launch({ executablePath: exe, env });
  const problems: string[] = [];

  try {
    const page = await app.firstWindow();
    page.on('console', (message) => {
      if (
        (message.type() === 'error' || message.type() === 'warning') &&
        !message.text().includes('Electron Security Warning')
      ) {
        problems.push(`[console.${message.type()}] ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => problems.push(`[pageerror] ${error.message}`));

    await expect(page).toHaveURL(/^bllueprint:\/\/app\//);
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('data-theme', /paper|blueprint|navy/);

    const mainVersion = await app.evaluate(({ app: electronApp }) => electronApp.getVersion());
    const bridgeVersion = await page.evaluate(() =>
      (
        window as Window & { bllueprintApi?: { getAppVersion(): Promise<string> } }
      ).bllueprintApi?.getAppVersion(),
    );
    expect(bridgeVersion).toBe(mainVersion);

    const sandboxed = await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows().map((win) => win.webContents.getLastWebPreferences()),
    );
    expect(sandboxed.map((prefs) => prefs?.sandbox)).toEqual([true]);
    expect(sandboxed.map((prefs) => prefs?.contextIsolation)).toEqual([true]);
    expect(sandboxed.map((prefs) => prefs?.nodeIntegration)).toEqual([false]);

    await page.locator('hlm-sidebar').getByRole('button', { name: 'Editor', exact: true }).click();
    await expect(page.locator('.monaco-editor .view-line').first()).toBeVisible();

    const notifications = await page.evaluate(() =>
      navigator.permissions.query({ name: 'notifications' }).then((status) => status.state),
    );
    expect(notifications).toBe('denied');

    expect(problems).toEqual([]);
  } finally {
    await app.close();
  }
});
