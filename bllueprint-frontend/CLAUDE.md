# bllueprint-frontend

Angular 21 (standalone, signals) + Monaco. This app is packaged by the sibling
project `../bllueprint-desktop` (Electron): in dev it loads `localhost:4200`,
in prod it serves `dist-frontend/browser` through an `app://` protocol. Nothing
here may depend on the network at runtime or on deep links (the fallback is
`index.html`).

**Language: all code, comments, commit messages and documentation are written
in English.** Conversation with the maintainer may be in Portuguese, but
nothing in the repository is.

General Angular/TS conventions live in `.github/copilot-instructions.md`.

## Review loop (mandatory)

`docs/frontend-guidelines.md` is the senior-reviewer checklist for this
project. **Read §1, §2 and §4 of it before writing any code here** (and §10
when touching `index.html`, Electron, IPC or dependencies), and before
reporting a change as done run its §13 checklist against `git diff` and the
tooling gate (`npm run lint`, `npx ng test --watch=false`, `npx ng build`,
`npx prettier --check src docs e2e playwright.config.ts eslint.config.js`,
`npm audit --omit=dev --audit-level=high`, `npm run test:e2e`). The final message must include the
walk-through: what passed, what was consciously skipped and why. Record
notable findings in its §14 review log.

## Visual style (sketch-ui)

The UI follows a hand-drawn "wireframe" look described in `plano-sketch-ui.md`.
**Before touching any style, theme, color or font, read
`src/sketch-ui/README.md`** (how it works) and
`src/sketch-ui/styles/themes/_contract.md` (what every theme defines).
Step-by-step for new themes: README §9.

Rules that must not be broken:

- No literal colors outside `src/sketch-ui/styles/themes/` and the hex
  mirrors for Monaco in `src/app/core/monaco/bllueprint-language.ts`.
- Accent (orange): active = soft tint (`--sketch-accent-soft`), hover = light
  hatch (`--sketch-hatch-accent-light`), primary = solid (`--sketch-accent` +
  `--sketch-accent-contrast`). Never put text on top of a hatch.
- Tailwind v4 **without preflight**; the reset is scoped (`base.css`). New
  sketch surfaces get the `sketch-root` class.
- Spartan helms in `src/sketch-ui/components/` stay exactly as the CLI
  generated them (diff reference). The sketch look is applied in
  `spartan-sketch.css`.
- The legacy editor chrome (`core/layout/workbench`, `features/coding`) and
  Monaco receive no global reset.
- Theme styles never go into component SCSS (16 kB per-component budget).

Release-time items (signing, updater, versioning, visual baselines) are
tracked in `../docs/release-checklist.md`; read it before any release work.

## Tooling

- `npm start` runs `ng serve` (port 4200). Changes to `tsconfig.json` or
  `angular.json` require restarting the server; the VS Code "ng serve" launch
  leaves its background task alive after debugging, terminate it before
  starting another one.
- `npm run lint` runs angular-eslint (`eslint.config.js`; the Spartan helms are
  ignored on purpose). `npm test` runs Vitest. `npm run test:e2e` runs the
  Playwright regression suite against the production build (`e2e/`);
  `npm run test:e2e:electron` smoke-tests a packaged app given
  `BLLUEPRINT_APP_EXE`. All must be green.
- Import aliases: `@app/*` → `src/app/*`, `@sketch-ui/core`, `@sketch-ui/elements`
  and one `@sketch-ui/<helm>` per generated helm (`tsconfig.json`).
- New helms: `npx ng g @spartan-ng/cli:ui <name>` (config in `components.json`,
  alias `@sketch-ui/<name>`). The CLI only installed with `--legacy-peer-deps`.
  Angular 21 requires `@angular/cdk@^21` and `@ng-icons/*@^34`.
- Formatting: `npx prettier --write` (config in `.prettierrc`).
- The VS Code terminal sets `ELECTRON_RUN_AS_NODE=1`; to run Electron from it
  use `env -u ELECTRON_RUN_AS_NODE npx electron …` in the desktop project.
