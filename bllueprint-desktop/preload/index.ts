import { contextBridge, ipcRenderer } from 'electron';

/**
 * IPC channel names used by this bridge.
 *
 * Duplicated from `../shared/constants` on purpose: the preload runs with
 * `sandbox: true`, and a sandboxed preload cannot `require` project files,
 * only a subset of the Electron API. Keep both in sync.
 */
const IPC_CHANNELS = {
  GET_APP_VERSION: 'app:get-version',
} as const;

/**
 * The `bllueprintApi` object is exposed on `window.bllueprintApi` inside the
 * Angular renderer. Only the methods listed here are accessible — the full
 * Electron / Node API is never exposed.
 */
const bllueprintApi = {
  /** Returns the Electron app version string (e.g. "0.0.1"). */
  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),

  /** True when running inside Electron (useful for conditional UI). */
  isElectron: true as const,
};

contextBridge.exposeInMainWorld('bllueprintApi', bllueprintApi);

// Type augmentation for the preload type-check only. The Angular project keeps
// its own copy in `bllueprint-frontend/src/electron.d.ts`; keep both in sync.
export type BllueprintApi = typeof bllueprintApi;

declare global {
  interface Window {
    bllueprintApi: BllueprintApi;
  }
}
