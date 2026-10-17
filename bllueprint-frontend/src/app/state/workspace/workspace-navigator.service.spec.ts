import { TestBed } from '@angular/core/testing';
import { TabsStore } from '../tabs/tabs.store';
import { WorkspaceNavigatorService } from './workspace-navigator.service';
import { WorkspaceTabsStore } from './workspace-tabs.store';

describe('WorkspaceNavigatorService', () => {
  let navigator: WorkspaceNavigatorService;
  let workspaceTabs: WorkspaceTabsStore;
  let fileTabs: TabsStore;

  beforeEach(() => {
    navigator = TestBed.inject(WorkspaceNavigatorService);
    workspaceTabs = TestBed.inject(WorkspaceTabsStore);
    fileTabs = TestBed.inject(TabsStore);
  });

  it('opens the editor tab together with the welcome file when nothing is open', () => {
    navigator.openEditor();

    expect(workspaceTabs.activeTab().kind).toBe('editor');
    expect(fileTabs.tabs().length).toBe(1);
  });

  it('does not add a second welcome file on repeated opens', () => {
    navigator.openEditor();
    navigator.openEditor();

    expect(fileTabs.tabs().length).toBe(1);
  });

  it('switches to the playground and back home without touching the file tabs', () => {
    navigator.openPlayground();
    expect(workspaceTabs.activeTab().kind).toBe('playground');

    navigator.openHome();
    expect(workspaceTabs.activeTab().kind).toBe('home');
    expect(fileTabs.tabs().length).toBe(0);
  });
});
