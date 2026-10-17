import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SketchMenuDirective } from './sketch-menu.directive';

@Component({
  imports: [SketchMenuDirective],
  template: `
    <details class="sk-menu" skMenu id="first">
      <summary>First</summary>
      <p class="sk-menu__label">Section</p>
      <button type="button" class="sk-menu__item">Item</button>
    </details>
    <details class="sk-menu" skMenu id="second">
      <summary>Second</summary>
    </details>
    <p id="outside">outside</p>
  `,
})
class HostComponent {}

describe('SketchMenuDirective', () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const first = root.querySelector<HTMLDetailsElement>('#first')!;
    const second = root.querySelector<HTMLDetailsElement>('#second')!;

    return { root, first, second };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  it('closes an open menu when the click lands outside', () => {
    const { root, first } = setup();
    first.open = true;

    root.querySelector('#outside')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(first.open).toBe(false);
  });

  it('keeps the menu open on a click inside that is not an item', () => {
    const { first } = setup();
    first.open = true;

    // (the <summary> itself toggles natively, so click a plain label instead)
    first
      .querySelector('.sk-menu__label')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(first.open).toBe(true);
  });

  it('closes the menu when one of its items is activated', () => {
    const { first } = setup();
    first.open = true;

    first
      .querySelector('.sk-menu__item')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(first.open).toBe(false);
  });

  it('closes the other menu when a second one is clicked', () => {
    const { first, second } = setup();
    first.open = true;

    second.querySelector('summary')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(first.open).toBe(false);
  });

  it('closes on Escape', () => {
    const { first } = setup();
    first.open = true;

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(first.open).toBe(false);
  });
});
