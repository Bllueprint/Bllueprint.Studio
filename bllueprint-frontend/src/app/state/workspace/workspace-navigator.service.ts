import { Injectable, inject } from '@angular/core';
import { TabsStore } from '../tabs/tabs.store';
import { WorkspaceTabsStore } from './workspace-tabs.store';

/**
 * Entry points that open a workspace screen. The single place where opening a
 * screen may touch more than one store, so callers (sidebar, home page, menus)
 * never repeat that orchestration.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceNavigatorService {
  private readonly workspaceTabs = inject(WorkspaceTabsStore);
  private readonly fileTabs = inject(TabsStore);

  openHome(): void {
    this.workspaceTabs.openHome();
  }

  openPlayground(): void {
    this.workspaceTabs.openPlayground();
  }

  /** Opens the editor tab and, when no file is open yet, the welcome file so the editor is never empty. */
  openEditor(): void {
    this.workspaceTabs.openEditor();

    if (this.fileTabs.tabs().length === 0) {
      this.fileTabs.openHomeTab();
    }
  }
}
