import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CodingPageComponent } from '@app/features/coding/pages/coding-page/coding-page';
import { HomePageComponent } from '@app/features/home/pages/home-page/home-page';
import { PlaygroundPageComponent } from '@app/features/playground/pages/playground-page/playground-page';
import { WorkspaceTabsStore } from '@app/state/workspace/workspace-tabs.store';
import { WorkspaceTabStripComponent } from '../../components/workspace-tab-strip/workspace-tab-strip';

/**
 * Hosts the top-level workspace tabs. Every open tab stays mounted (hidden with
 * CSS when inactive) so the Monaco editor keeps its state when switching tabs.
 *
 * This is the one place that composes other features' pages (§2.2 of
 * docs/frontend-guidelines.md): it is the workspace, not a feature of its own.
 */
@Component({
  selector: 'app-workspace-page',
  imports: [
    WorkspaceTabStripComponent,
    HomePageComponent,
    CodingPageComponent,
    PlaygroundPageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workspace-page.html',
  styleUrl: './workspace-page.scss',
})
export class WorkspacePageComponent {
  protected readonly workspaceTabs = inject(WorkspaceTabsStore);
}
