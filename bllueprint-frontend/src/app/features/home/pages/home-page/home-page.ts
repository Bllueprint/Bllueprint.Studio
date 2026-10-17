import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCode, lucidePalette } from '@ng-icons/lucide';
import { WorkspaceNavigatorService } from '@app/state/workspace/workspace-navigator.service';

@Component({
  selector: 'app-home-page',
  imports: [NgIcon],
  providers: [provideIcons({ lucideCode, lucidePalette })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePageComponent {
  protected readonly navigator = inject(WorkspaceNavigatorService);
}
