import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleHelp,
  lucideCode,
  lucideHouse,
  lucideInfo,
  lucidePalette,
} from '@ng-icons/lucide';
import { HlmSidebarImports } from '@sketch-ui/sidebar';
import { WorkspaceTabKind } from '@app/state/workspace/models/workspace-tab';
import { WorkspaceNavigatorService } from '@app/state/workspace/workspace-navigator.service';
import { WorkspaceTabsStore } from '@app/state/workspace/workspace-tabs.store';

interface SidebarNavItem {
  kind: WorkspaceTabKind;
  label: string;
  icon: string;
  action: () => void;
}

/**
 * Application sidebar built on the Spartan sidebar helm (`@sketch-ui/sidebar`),
 * with the sketch look applied through `sketch-ui/styles/spartan-sketch.css`.
 */
@Component({
  selector: 'app-sidebar',
  imports: [HlmSidebarImports, NgIcon],
  providers: [
    provideIcons({ lucideHouse, lucideCode, lucidePalette, lucideInfo, lucideCircleHelp }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private readonly workspaceTabs = inject(WorkspaceTabsStore);
  private readonly navigator = inject(WorkspaceNavigatorService);

  protected readonly activeKind = computed(() => this.workspaceTabs.activeTab().kind);

  protected readonly navItems: SidebarNavItem[] = [
    { kind: 'home', label: 'Home', icon: 'lucideHouse', action: () => this.navigator.openHome() },
    {
      kind: 'editor',
      label: 'Editor',
      icon: 'lucideCode',
      action: () => this.navigator.openEditor(),
    },
    {
      kind: 'playground',
      label: 'Playground',
      icon: 'lucidePalette',
      action: () => this.navigator.openPlayground(),
    },
  ];
}
