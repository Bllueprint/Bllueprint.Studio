import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell';
import { WorkspacePageComponent } from './features/workspace/pages/workspace-page/workspace-page';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'workspace',
        pathMatch: 'full',
      },
      {
        path: 'workspace',
        component: WorkspacePageComponent,
      },
      // Old entry point: the editor now lives in a workspace tab.
      {
        path: 'coding',
        redirectTo: 'workspace',
      },
    ],
  },
];
