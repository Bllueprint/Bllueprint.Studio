import { TestBed } from '@angular/core/testing';
import { WorkspaceTabsStore } from './workspace-tabs.store';

describe('WorkspaceTabsStore', () => {
  let store: WorkspaceTabsStore;

  beforeEach(() => {
    store = TestBed.inject(WorkspaceTabsStore);
  });

  it('starts with the fixed home tab active', () => {
    expect(store.tabs().map((tab) => tab.kind)).toEqual(['home']);
    expect(store.activeTab().kind).toBe('home');
  });

  it('opens a screen once and activates it on every call', () => {
    store.openEditor();
    store.openPlayground();
    store.openEditor();

    expect(store.tabs().map((tab) => tab.kind)).toEqual(['home', 'editor', 'playground']);
    expect(store.activeTab().kind).toBe('editor');
  });

  it('never closes the home tab', () => {
    store.closeTab('home');

    expect(store.tabs().length).toBe(1);
  });

  it('activates the neighbour when the active tab is closed', () => {
    store.openEditor();
    store.openPlayground();

    store.closeTab('playground');

    expect(store.activeTab().kind).toBe('editor');
  });

  it('ignores unknown ids', () => {
    store.setActiveTab('nope');

    expect(store.activeTab().kind).toBe('home');
  });
});
