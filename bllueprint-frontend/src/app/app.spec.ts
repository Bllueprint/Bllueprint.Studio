import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('applies the sketch theme attributes on <html> at startup', () => {
    TestBed.createComponent(App).detectChanges();

    const root = document.documentElement;

    expect(root.getAttribute('data-theme')).toBeTruthy();
    expect(['light', 'dark']).toContain(root.getAttribute('data-scheme'));
  });
});
