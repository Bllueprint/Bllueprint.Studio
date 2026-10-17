# Release checklist

Read this before cutting a release of the desktop app. It lists what is still
**open** (decided on 2026-10-16 to be done at release time, not before), the
secrets the pipeline expects, and the steps to ship a version.

The pipeline itself is `.github/workflows/release.yml`
(verify → e2e-web → package per OS → draft release). Frontend rules and the
review log live in `bllueprint-frontend/docs/frontend-guidelines.md`.

---

## 1. Open items (must be resolved before the first public release)

| #   | Item                                                                                                                                                                                                                                                             | Owner / decision                          | Done |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---- |
| R1  | **Code signing.** No certificate exists locally; signing happens only in the pipeline through a certificate service integrated with GitHub Actions. Pick the service (Azure Trusted Signing, SignPath, DigiCert KeyLocker, …), create the secrets in §2.         | Ulisses — service not chosen yet          | [ ]  |
| R2  | **Windows signing step.** `release.yml` uses electron-builder's `WIN_CSC_LINK` / `WIN_CSC_KEY_PASSWORD` (PFX). If the chosen service is Azure Trusted Signing, replace it with electron-builder's `azureSignOptions` / the `azure/trusted-signing-action`.       | depends on R1                             | [ ]  |
| R3  | **macOS notarization.** Needs a Developer ID Application certificate (`CSC_LINK`), `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`. Without them the DMG is produced unsigned and Gatekeeper blocks it.                                               | depends on R1                             | [ ]  |
| R4  | **Auto-update.** `electron-updater` is a dependency but is not wired: no `publish` block in `bllueprint-desktop/package.json`, no `autoUpdater` call in `main/index.ts`. Decide the channel (GitHub Releases is the default fit) and wire it after R1.           | after R1; updates require signed packages | [ ]  |
| R5  | **Versioning and changelog.** Versions are `0.0.0` (frontend) and `0.0.1` (desktop) and nothing bumps them. Decide: tag `vX.Y.Z` drives `bllueprint-desktop/package.json` version (manual bump or `npm version`), release notes from `generate_release_notes`.   | process decision                          | [ ]  |
| R6  | **Visual regression baselines.** `npm run test:e2e:visual` has no committed screenshots. Generate them on Linux (`npx playwright test --project=visual --update-snapshots` in CI or the Playwright Docker image) and commit `e2e/web/visual.spec.ts-snapshots/`. | frontend                                  | [ ]  |
| R7  | **Packaged smoke on macOS.** The Playwright `electron` smoke test ran locally on Windows only. The pipeline runs it on macOS too (`release/mac-arm64/...`); check the path matches the first macOS build (`mac` vs `mac-arm64`).                                 | first pipeline run                        | [ ]  |
| R8  | **Linux package.** The AppImage is built but not smoke-tested and not signed; only SHA-256 checksums are published. Decide whether Linux is a supported target.                                                                                                  | product decision                          | [ ]  |
| R9  | **Tooling advisories.** `npm audit` still reports dev-only advisories (frontend 13, desktop 7 moderate in electron-builder). They do not ship, but review the Dependabot PRs before a release.                                                                   | each release                              | [ ]  |
| R10 | **UI migration.** The sketch UI is mid-migration (plan in `bllueprint-frontend/plano-sketch-ui.md`): themes are provisional and the playground still uses hardcoded `.sk-*` blocks. Not a blocker for an internal/preview release; is one for a public release.  | product decision                          | [ ]  |

Items R1 to R4 are the hard blockers: an unsigned package means SmartScreen /
Gatekeeper warnings and no working auto-update.

---

## 2. Secrets the pipeline reads (repository → Settings → Secrets → Actions)

| Secret                        | Used by                  | Notes                                                                 |
| ----------------------------- | ------------------------ | --------------------------------------------------------------------- |
| `WIN_CSC_LINK`                | package (windows)        | base64 PFX or URL; replace with the service's action if not PFX-based |
| `WIN_CSC_KEY_PASSWORD`        | package (windows)        |                                                                       |
| `CSC_LINK`                    | package (macos)          | Developer ID Application `.p12`, base64                               |
| `CSC_KEY_PASSWORD`            | package (macos)          |                                                                       |
| `APPLE_ID`                    | package (macos) notarize |                                                                       |
| `APPLE_APP_SPECIFIC_PASSWORD` | package (macos) notarize |                                                                       |
| `APPLE_TEAM_ID`               | package (macos) notarize |                                                                       |

When a secret is empty the step still runs and the package is produced
**unsigned**; the job does not fail. That is intentional until R1 is done, and
it means a green pipeline is not proof of a signed build: check the package
job log for "signing" lines.

---

## 3. Cutting a release

1. Confirm `main` is green in CI (`frontend`, `desktop`, `backend` jobs).
2. Walk through §1; every unchecked item is either resolved or explicitly
   accepted for this release in the PR description.
3. Bump `bllueprint-desktop/package.json` version (R5) and merge.
4. Run the pipeline manually first (`Actions → Release → Run workflow`):
   artifacts only, no GitHub Release. Download and smoke-test the installer
   on a clean machine (SmartScreen / Gatekeeper behaviour, first launch,
   editor, playground, console empty in DevTools).
5. Tag: `git tag vX.Y.Z && git push origin vX.Y.Z`. The pipeline creates a
   **draft** release with the artifacts, checksums and generated notes.
6. Edit the draft notes, publish.
7. If auto-update is wired (R4), confirm an installed previous version picks
   the update up.

---

## 4. After the release

- Record the release in `bllueprint-frontend/docs/frontend-guidelines.md` §14
  if anything in this checklist changed.
- Close the R-items that got resolved here (edit the table), add new ones.
