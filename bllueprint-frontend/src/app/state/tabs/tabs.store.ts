import { Injectable, computed, signal } from '@angular/core';
import { Tab } from './models/tab';
import { WELCOME_TAB } from './constants/welcome-tab';

@Injectable({ providedIn: 'root' })
export class TabsStore {
  private readonly _tabs = signal<Tab[]>([]);
  private readonly _activeTabId = signal<string | null>(null);

  readonly tabs = this._tabs.asReadonly();
  readonly activeTabId = this._activeTabId.asReadonly();

  readonly activeTab = computed(() => {
    const activeTabId = this._activeTabId();
    return this._tabs().find((tab) => tab.id === activeTabId) ?? null;
  });

  openTab(tab: Tab): void {
    const existingTab = this._tabs().find((existing) => existing.id === tab.id);

    if (existingTab) {
      this._activeTabId.set(tab.id);
      return;
    }

    this._tabs.update((currentTabs) => [...currentTabs, tab]);
    this._activeTabId.set(tab.id);
  }

  openHomeTab(): void {
    this.openTab(WELCOME_TAB);
  }

  closeTab(tabId: string): void {
    const currentTabs = this._tabs();
    const closingIndex = currentTabs.findIndex((tab) => tab.id === tabId);

    if (closingIndex === -1) {
      return;
    }

    const updatedTabs = currentTabs.filter((tab) => tab.id !== tabId);
    this._tabs.set(updatedTabs);

    if (this._activeTabId() !== tabId) {
      return;
    }

    if (updatedTabs.length === 0) {
      this._activeTabId.set(null);
      return;
    }

    const nextIndex = Math.min(closingIndex, updatedTabs.length - 1);
    this._activeTabId.set(updatedTabs[nextIndex].id);
  }

  setActiveTab(tabId: string): void {
    const tabExists = this._tabs().some((tab) => tab.id === tabId);

    if (!tabExists) {
      return;
    }

    this._activeTabId.set(tabId);
  }

  updateTabContent(tabId: string, content: string): void {
    this._tabs.update((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              content,
              isDirty: true,
            }
          : tab,
      ),
    );
  }

  markTabSaved(tabId: string): void {
    this._tabs.update((currentTabs) =>
      currentTabs.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              isDirty: false,
            }
          : tab,
      ),
    );
  }

  closeAllTabs(): void {
    this._tabs.set([]);
    this._activeTabId.set(null);
  }
}
