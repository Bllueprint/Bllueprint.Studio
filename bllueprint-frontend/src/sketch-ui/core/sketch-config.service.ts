import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

/**
 * Code editor font:
 *  - `mono`   → regular monospace stack (Fira Code / Cascadia / Consolas)
 *  - `sketch` → Comic Mono (self-hosted in public/fonts/comic-mono, MIT)
 */
export type EditorFont = 'mono' | 'sketch';

export const CODE_FONT_MONO = "'Fira Code', 'Cascadia Code', 'Consolas', 'Courier New', monospace";
export const CODE_FONT_SKETCH = `'Comic Mono', ${CODE_FONT_MONO}`;

export const EDITOR_FONT_STORAGE_KEY = 'sketch-ui.editor-font';

/**
 * Global sketch configuration. Applied as CSS custom properties / classes on
 * `<html>` so every sketch surface (sidebar, playground, …) updates live.
 *
 * `editorFont` is persisted (localStorage) because it is meant to become an
 * end-user preference; the other knobs are playground-only for now.
 */
@Injectable({ providedIn: 'root' })
export class SketchConfigService {
  private readonly document = inject(DOCUMENT);

  readonly strokeWidth = signal(2);
  readonly handwriting = signal(true);
  readonly editorFont = signal<EditorFont>(this.readStoredEditorFont());

  /** Font-family string to hand to Monaco for the current `editorFont`. */
  readonly codeFontFamily = computed(() =>
    this.editorFont() === 'sketch' ? CODE_FONT_SKETCH : CODE_FONT_MONO,
  );

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      const width = this.strokeWidth();

      root.style.setProperty('--sketch-width', `${width}px`);
      root.style.setProperty('--sketch-width-inner', `${Math.max(1, width * 0.75)}px`);
      root.classList.toggle('sketch-font-off', !this.handwriting());
    });

    effect(() => {
      const font = this.editorFont();

      try {
        this.document.defaultView?.localStorage.setItem(EDITOR_FONT_STORAGE_KEY, font);
      } catch {
        // storage unavailable — preference lives for this session only
      }
    });
  }

  setStrokeWidth(value: number): void {
    this.strokeWidth.set(clamp(value, 1, 5));
  }

  setHandwriting(enabled: boolean): void {
    this.handwriting.set(enabled);
  }

  setEditorFont(font: EditorFont): void {
    this.editorFont.set(font);
  }

  private readStoredEditorFont(): EditorFont {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(EDITOR_FONT_STORAGE_KEY);
      return stored === 'sketch' ? 'sketch' : 'mono';
    } catch {
      return 'mono';
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}
