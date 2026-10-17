#!/usr/bin/env node
/**
 * Rasterizes assets/icon.svg with Electron (no native image deps) and writes:
 *   assets/icon.png   1024x1024 (Linux / electron-builder)
 *   assets/icon.ico   multi-size (Windows)
 *   assets/icon.icns  multi-size (macOS)
 *   ../bllueprint-frontend/public/favicon.ico
 *
 * Run from bllueprint-desktop:  npm run build:icons
 */
const path = require('path');
const fs = require('fs');

// Bootstrap: when started with plain Node (or inside a terminal that sets
// ELECTRON_RUN_AS_NODE, like VS Code's), re-run this file inside Electron.
if (!process.versions.electron || process.env.ELECTRON_RUN_AS_NODE) {
  const { spawnSync } = require('child_process');
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  const electronBin = require('electron');
  const result = spawnSync(electronBin, [__filename], { stdio: 'inherit', env });
  process.exit(result.status ?? 1);
}

const { app, BrowserWindow } = require('electron');
const png2icons = require('png2icons');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'assets');
const svgPath = path.join(assetsDir, 'icon.svg');
const frontendPublic = path.resolve(root, '..', 'bllueprint-frontend', 'public');
const SIZE = 1024;

async function render(size) {
  const win = new BrowserWindow({
    width: size,
    height: size,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: { offscreen: true },
  });
  const svg = fs.readFileSync(svgPath, 'utf8');
  const html = `<!doctype html><html><head><style>
      html,body{margin:0;background:transparent;width:${size}px;height:${size}px;overflow:hidden}
      svg{display:block;width:${size}px;height:${size}px}
    </style></head><body>${svg}</body></html>`;
  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  await new Promise((r) => setTimeout(r, 300));
  // capturePage returns device pixels (HiDPI displays give 1.5x/2x); normalize.
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: size, height: size });
  win.destroy();
  return image.resize({ width: size, height: size, quality: 'best' }).toPNG();
}

app.whenReady().then(async () => {
  try {
    const png = await render(SIZE);
    fs.mkdirSync(assetsDir, { recursive: true });
    fs.writeFileSync(path.join(assetsDir, 'icon.png'), png);

    const ico = png2icons.createICO(png, png2icons.BICUBIC, 0, false, true);
    const icns = png2icons.createICNS(png, png2icons.BICUBIC, 0);
    if (!ico || !icns) throw new Error('png2icons failed to convert the PNG');
    fs.writeFileSync(path.join(assetsDir, 'icon.ico'), ico);
    fs.writeFileSync(path.join(assetsDir, 'icon.icns'), icns);

    if (fs.existsSync(frontendPublic)) {
      fs.writeFileSync(path.join(frontendPublic, 'favicon.ico'), ico);
    }
    console.log('Icons written to', assetsDir, 'and', frontendPublic);
  } catch (err) {
    console.error('build-icons failed:', err);
    process.exitCode = 1;
  } finally {
    app.quit();
  }
});
