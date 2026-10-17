import { Injectable, computed, signal } from '@angular/core';
import { WorkspaceTab, WorkspaceTabKind } from './models/workspace-tab';

const HOME_TAB: WorkspaceTab = {
  id: 'home',
  title: 'Home',
  kind: 'home',
  closable: false,
};

const EDITOR_TAB: WorkspaceTab = {
  id: 'editor',
  title: 'Editor',
  kind: 'editor',
  closable: true,
};

const PLAYGROUND_TAB: WorkspaceTab = {
  id: 'playground',
  title: 'Playground',
  kind: 'playground',
  closable: true,
};

/**
 * Top-level workspace tabs (Home / Editor / Playground).
 *
 * This is independent from `TabsStore`, which tracks the *files* open inside
 * the code editor. The editor itself lives in one workspace tab.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceTabsStore {
  private readonly _tabs = signal<WorkspaceTab[]>([HOME_TAB]);
  private readonly _activeTabId = signal<string>(HOME_TAB.id);

  readonly tabs = this._tabs.asReadonly();
  readonly activeTabId = this._activeTabId.asReadonly();

  readonly activeTab = computed(() => {
    const activeTabId = this._activeTabId();
    return this._tabs().find((tab) => tab.id === activeTabId) ?? HOME_TAB;
  });

  openHome(): void {
    this._activeTabId.set(HOME_TAB.id);
  }

  openEditor(): void {
    this.openTab(EDITOR_TAB);
  }

  openPlayground(): void {
    this.openTab(PLAYGROUND_TAB);
  }

  isOpen(kind: WorkspaceTabKind): boolean {
    return this._tabs().some((tab) => tab.kind === kind);
  }

  setActiveTab(tabId: string): void {
    if (!this._tabs().some((tab) => tab.id === tabId)) {
      return;
    }

    this._activeTabId.set(tabId);
  }

  closeTab(tabId: string): void {
    const currentTabs = this._tabs();
    const closingIndex = currentTabs.findIndex((tab) => tab.id === tabId);

    if (closingIndex === -1 || !currentTabs[closingIndex].closable) {
      return;
    }

    const updatedTabs = currentTabs.filter((tab) => tab.id !== tabId);
    this._tabs.set(updatedTabs);

    if (this._activeTabId() !== tabId) {
      return;
    }

    const nextIndex = Math.min(closingIndex, updatedTabs.length - 1);
    this._activeTabId.set(updatedTabs[nextIndex].id);
  }

  private openTab(tab: WorkspaceTab): void {
    const alreadyOpen = this._tabs().some((existing) => existing.id === tab.id);

    if (!alreadyOpen) {
      this._tabs.update((currentTabs) => [...currentTabs, tab]);
    }

    this._activeTabId.set(tab.id);
  }
}
