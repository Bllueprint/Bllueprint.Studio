import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  protocol,
  net,
  Menu,
  session,
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { DEV_SERVER_URL, APP_SCHEME, IPC_CHANNELS } from '../shared/constants';

const isDev = !app.isPackaged;

// Sandbox every renderer the app may ever create, not only the main window.
app.enableSandbox();

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      // The renderer's CSP (meta tag in the frontend index.html) applies to
      // app:// resources too; nothing here needs to bypass it.
      bypassCSP: false,
    },
  },
]);

function getBrowserDir(): string {
  if (isDev) {
    return path.join(__dirname, '..', '..', 'dist-frontend', 'browser');
  }
  return path.join(process.resourcesPath, 'dist-frontend', 'browser');
}

function registerProtocolHandler(): void {
  const browserDir = getBrowserDir();

  protocol.handle(APP_SCHEME, (request) => {
    const { pathname } = new URL(request.url);

    // Prevent path traversal attacks
    const relative = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
    const filePath = path.resolve(browserDir, `.${path.sep}${relative}`);

    // Ensure the resolved path is still inside browserDir (the trailing
    // separator rejects sibling folders that merely share the prefix).
    const root = browserDir.endsWith(path.sep) ? browserDir : browserDir + path.sep;
    if (filePath !== browserDir && !filePath.startsWith(root)) {
      return new Response('Forbidden', { status: 403 });
    }

    // Serve the file if it exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return net.fetch(url.pathToFileURL(filePath).toString());
    }

    // Only fall back to index.html for navigation requests (HTML pages),
    // not for assets (JS, CSS, fonts, images, workers).
    // This supports Angular's client-side routing without swallowing
    // real 404s for missing assets.
    const ext = path.extname(filePath).toLowerCase();
    const isAsset = ['.js', '.css', '.ttf', '.woff', '.woff2', '.png',
                     '.jpg', '.svg', '.ico', '.json', '.map'].includes(ext);

    if (isAsset) {
      return new Response(`Not found: ${pathname}`, { status: 404 });
    }

    // Navigation request with no extension (Angular route) → serve index.html
    const indexPath = path.join(browserDir, 'index.html');
    return net.fetch(url.pathToFileURL(indexPath).toString());
  });
}

let mainWindow: BrowserWindow | null = null;

/**
 * Window/taskbar icon. The packaged .exe/.app/.AppImage already carries the
 * icon via electron-builder, but the BrowserWindow itself needs it for
 * dev runs (`electron .`) and for Linux. `assets/` is shipped inside the
 * asar (see package.json "build.files"), so app.getAppPath() works in both
 * dev and packaged mode.
 */
function getWindowIcon(): string {
  const file = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
  return path.join(app.getAppPath(), 'assets', file);
}

/**
 * Remove the default Electron menu (File/Edit/View/Window/Help).
 * On macOS the app menu is also where Cmd+Q / Cmd+C / Cmd+V live, so keep
 * a minimal one there instead of removing it entirely.
 */
function setupApplicationMenu(): void {
  if (process.platform !== 'darwin') {
    Menu.setApplicationMenu(null);
    return;
  }
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { role: 'appMenu' },
      { role: 'editMenu' },
      { role: 'windowMenu' },
    ]),
  );
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: getWindowIcon(),
    autoHideMenuBar: true,
    backgroundColor: '#1e1e1e',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    // Electron security checklist (https://www.electronjs.org/docs/latest/tutorial/security):
    // isolated context, no Node in the renderer, OS sandbox on, web security on
    // (same-origin policy; the app:// scheme is registered as a standard origin
    // so it needs no exception). The preload must stay sandbox-compatible.
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`${APP_SCHEME}://app/index.html`);
  }

  mainWindow.once('ready-to-show', () => mainWindow!.show());
  mainWindow.on('closed', () => { mainWindow = null; });

  mainWindow.webContents.on('did-fail-load', (_e, code, _desc, validatedURL) => {
    if (!isDev && validatedURL.startsWith(`${APP_SCHEME}://`)) {
      setTimeout(() => mainWindow?.loadURL(`${APP_SCHEME}://app/index.html`), 500);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: u }) => {
    if (u.startsWith('http')) shell.openExternal(u);
    return { action: 'deny' };
  });

  // The renderer never navigates away from the app (dev server or app://).
  mainWindow.webContents.on('will-navigate', (event, target) => {
    const allowed = isDev ? DEV_SERVER_URL : `${APP_SCHEME}://`;
    if (!target.startsWith(allowed)) event.preventDefault();
  });
}

/**
 * The app uses no device or browser permission (camera, microphone,
 * geolocation, notifications, …). Deny every request instead of letting
 * Chromium prompt or grant by default.
 */
function lockDownPermissions(): void {
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) =>
    callback(false),
  );
  session.defaultSession.setPermissionCheckHandler(() => false);
}

app.whenReady().then(() => {
  lockDownPermissions();
  setupApplicationMenu();
  if (!isDev) registerProtocolHandler();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => app.getVersion());
