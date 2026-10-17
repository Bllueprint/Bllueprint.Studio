import { TestBed } from '@angular/core/testing';
import { Tab } from './models/tab';
import { TabsStore } from './tabs.store';

function makeTab(id: string): Tab {
  return { id, title: `${id}.bp`, content: '', language: 'bllueprint', isDirty: false };
}

describe('TabsStore', () => {
  let store: TabsStore;

  beforeEach(() => {
    store = TestBed.inject(TabsStore);
  });

  it('starts empty', () => {
    expect(store.tabs()).toEqual([]);
    expect(store.activeTab()).toBeNull();
  });

  it('opens and activates tabs, reusing an already open id', () => {
    store.openTab(makeTab('a'));
    store.openTab(makeTab('b'));
    store.openTab(makeTab('a'));

    expect(store.tabs().map((tab) => tab.id)).toEqual(['a', 'b']);
    expect(store.activeTabId()).toBe('a');
  });

  it('marks content changes as dirty and clears them on save', () => {
    store.openTab(makeTab('a'));

    store.updateTabContent('a', 'changed');
    expect(store.activeTab()?.isDirty).toBe(true);
    expect(store.activeTab()?.content).toBe('changed');

    store.markTabSaved('a');
    expect(store.activeTab()?.isDirty).toBe(false);
  });

  it('picks the neighbour when closing the active tab and null when none is left', () => {
    store.openTab(makeTab('a'));
    store.openTab(makeTab('b'));
    store.openTab(makeTab('c'));
    store.setActiveTab('b');

    store.closeTab('b');
    expect(store.activeTabId()).toBe('c');

    store.closeAllTabs();
    expect(store.activeTabId()).toBeNull();
  });
});
