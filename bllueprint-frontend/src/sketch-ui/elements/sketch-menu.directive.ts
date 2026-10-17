import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Light-weight dropdown behaviour for `<details class="sk-menu">`.
 *
 * The native element only toggles on its own `<summary>`; this directive adds
 * what a menu needs: it closes on a click anywhere outside, on Escape, and when
 * one of its items (`.sk-menu__item`) is activated. Opening another menu closes
 * this one because that click lands outside.
 *
 * Usage: `<details class="sk-menu" skMenu>…</details>`.
 */
@Directive({
  selector: 'details[skMenu]',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class SketchMenuDirective {
  private readonly host = inject<ElementRef<HTMLDetailsElement>>(ElementRef);

  protected onDocumentClick(event: Event): void {
    const element = this.host.nativeElement;

    if (!element.open) {
      return;
    }

    const target = event.target instanceof Node ? event.target : null;
    const clickedInside = target !== null && element.contains(target);
    const activatedItem = target instanceof Element && target.closest('.sk-menu__item') !== null;

    if (!clickedInside || activatedItem) {
      this.close();
    }
  }

  protected close(): void {
    this.host.nativeElement.open = false;
  }
}
