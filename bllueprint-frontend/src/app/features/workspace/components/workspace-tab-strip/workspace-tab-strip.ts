import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCode, lucideHouse, lucidePalette, lucideX } from '@ng-icons/lucide';
import { HlmSidebarTrigger } from '@sketch-ui/sidebar';
import { WorkspaceTabKind } from '@app/state/workspace/models/workspace-tab';
import { WorkspaceTabsStore } from '@app/state/workspace/workspace-tabs.store';

const TAB_ICONS: Record<WorkspaceTabKind, string> = {
  home: 'lucideHouse',
  editor: 'lucideCode',
  playground: 'lucidePalette',
};

/** Top-level tab strip (Home / Editor / Playground) with the sidebar toggle. */
@Component({
  selector: 'app-workspace-tab-strip',
  imports: [NgIcon, HlmSidebarTrigger],
  providers: [provideIcons({ lucideHouse, lucideCode, lucidePalette, lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace-tab-strip.html',
  styleUrl: './workspace-tab-strip.scss',
})
export class WorkspaceTabStripComponent {
  protected readonly workspaceTabs = inject(WorkspaceTabsStore);
  protected readonly icons = TAB_ICONS;

  protected activate(tabId: string): void {
    this.workspaceTabs.setActiveTab(tabId);
  }

  /** Keyboard activation (Enter / Space); Space must not scroll the page. */
  protected activateFromKeyboard(event: Event, tabId: string): void {
    event.preventDefault();
    this.activate(tabId);
  }

  protected close(event: Event, tabId: string): void {
    event.stopPropagation();
    this.workspaceTabs.closeTab(tabId);
  }

  protected onMiddleClick(event: MouseEvent, tabId: string): void {
    if (event.button === 1) {
      event.preventDefault();
      this.workspaceTabs.closeTab(tabId);
    }
  }
}
