export type WorkspaceTabKind = 'home' | 'editor' | 'playground';

export interface WorkspaceTab {
  id: string;
  title: string;
  kind: WorkspaceTabKind;
  closable: boolean;
}
