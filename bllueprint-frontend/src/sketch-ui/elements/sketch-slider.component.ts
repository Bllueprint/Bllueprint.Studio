import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/**
 * Hand-drawn range input.
 *
 * Wraps the native `<input type="range">` because the sketch track cannot be
 * painted on the input itself: in Chromium the thumb is a child of the track,
 * so a `mask` on the track would clip the thumb. The host (`.sk-slider-wrap`)
 * draws the line and the input only provides the thumb and the behaviour.
 *
 * Usage: `<sk-slider [(value)]="width" [min]="1" [max]="5" [step]="0.5" />`.
 */
@Component({
  selector: 'sk-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'sk-slider-wrap' },
  template: `
    <input
      type="range"
      class="sk-slider"
      [id]="inputId()"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [value]="value()"
      [attr.aria-label]="ariaLabel()"
      (input)="onInput($event)"
    />
  `,
})
export class SketchSliderComponent {
  /** Two-way bound current value (`[(value)]`). */
  readonly value = model(0);
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  /** Forwarded to the native input so an external `<label for>` keeps working. */
  readonly inputId = input<string | null>(null);
  /** Accessible name when there is no associated `<label>`. */
  readonly ariaLabel = input<string | null>(null);

  protected onInput(event: Event): void {
    this.value.set(Number((event.target as HTMLInputElement).value));
  }
}
