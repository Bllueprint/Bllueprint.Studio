# bllueprint-electron

Electron host for the `bllueprint-frontend` Angular application.

## Project structure

```
bllueprint-electron/
├── main/
│   └── index.ts          # Main process entry point (Node / Electron APIs)
├── preload/
│   └── index.ts          # Preload script – secure IPC bridge to renderer
├── shared/
│   └── constants.ts      # Constants shared between main + preload
├── dist-electron/        # Compiled output (git-ignored)
│   ├── main/
│   └── preload/
├── dist-frontend/        # Angular build output (git-ignored, populated by build script)
├── tsconfig.electron.json
└── package.json
```

## Prerequisites

- Node.js 20+
- `bllueprint-frontend` sibling folder (Angular app)

## Development

```bash
# Install dependencies
npm install

# Start Angular dev server AND Electron simultaneously
npm run dev
```

The Angular app is served by `ng serve` on `http://localhost:4200`.
Electron loads that URL in a `BrowserWindow`.
Hot-module replacement (HMR) works exactly as it does in the browser.

## Production build

```bash
# 1. Compile TypeScript + build Angular
npm run build

# 2. Package into a distributable
npm run dist          # current platform
npm run dist:win      # Windows NSIS installer
npm run dist:mac      # macOS DMG
npm run dist:linux    # Linux AppImage
```

The packaged output is placed in `release/`.

Releases are produced by `.github/workflows/release.yml`. Before cutting one,
go through `../docs/release-checklist.md` (code signing, auto-update,
versioning and the other items still open).

## IPC communication

The preload script exposes a `window.bllueprintApi` object to the Angular renderer:

```typescript
// In any Angular component / service:
const version = await window.bllueprintApi.getAppVersion();
const isDesktop = window.bllueprintApi.isElectron; // true
```

To consume this cleanly from TypeScript, add the following declaration to
`bllueprint-frontend/src/electron.d.ts`:

```typescript
interface Window {
  bllueprintApi?: {
    getAppVersion(): Promise<string>;
    isElectron: true;
  };
}
```

## Security model

| Setting | Value | Reason |
|---|---|---|
| `contextIsolation` | `true` | Renderer cannot access Node globals |
| `nodeIntegration` | `false` | No accidental Node exposure in Angular |
| `sandbox` | `true` | OS sandbox on; the preload only uses `contextBridge`/`ipcRenderer` and requires no project files |
| `webSecurity` | `true` | Same-origin policy on in dev and prod; the `app://` scheme is a standard origin |
| scheme `bypassCSP` | `false` | The renderer CSP (meta tag in the frontend `index.html`) applies to `app://` too |
| `will-navigate` | blocked | The window never leaves the dev server / `app://` |
| `setWindowOpenHandler` | deny + `shell.openExternal` for http(s) | No child windows |

Only APIs explicitly bridged in `preload/index.ts` are reachable from the renderer.
The IPC channel names are duplicated in the preload (a sandboxed preload cannot
`require` `shared/constants`); keep them in sync. The frontend's security rules
are in `../bllueprint-frontend/docs/frontend-guidelines.md` §10.
