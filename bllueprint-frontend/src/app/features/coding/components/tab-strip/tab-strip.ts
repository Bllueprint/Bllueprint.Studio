import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TabsStore } from '@app/state/tabs/tabs.store';

/** Strip of the files open in the editor (one tab per `TabsStore` entry). */
@Component({
  selector: 'app-tab-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tab-strip.html',
  styleUrl: './tab-strip.scss',
})
export class TabStripComponent {
  protected readonly tabsStore = inject(TabsStore);

  protected activate(tabId: string): void {
    this.tabsStore.setActiveTab(tabId);
  }

  /** Keyboard activation (Enter / Space); Space must not scroll the page. */
  protected activateFromKeyboard(event: Event, tabId: string): void {
    event.preventDefault();
    this.activate(tabId);
  }

  protected close(event: Event, tabId: string): void {
    event.stopPropagation();
    this.tabsStore.closeTab(tabId);
  }
}
