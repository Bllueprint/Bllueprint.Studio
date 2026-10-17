import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemeScheme = 'light' | 'dark';

export interface ThemeDefinition {
  id: string;
  label: string;
  scheme: ThemeScheme;
  /** Monaco theme name registered for this sketch theme (see core/monaco/bllueprint-language.ts). */
  editorTheme: string;
}

/** Accent colors the code editor needs as hex (Monaco cannot read CSS variables). */
export interface EditorAccent {
  /** text-safe tone: cursor, active line number */
  ink: string;
  /** vivid tone: selection / highlights (alpha is added by the editor theme) */
  fill: string;
}

export interface AccentDefinition {
  id: string;
  label: string;
  /** hex mirrors of `--sketch-accent` / `--sketch-accent-fill`, keyed by theme id */
  editor: Record<string, EditorAccent>;
}

/**
 * Theme registry. Adding a theme = one CSS file in `styles/themes/` that fills
 * the contract (`styles/themes/_contract.md`) + one entry here.
 *
 * Keep in sync with the inline script in `src/index.html`, which applies the
 * stored theme before Angular bootstraps (avoids a flash of the wrong theme).
 */
export const SKETCH_THEMES: readonly ThemeDefinition[] = [
  { id: 'paper', label: 'Paper (light)', scheme: 'light', editorTheme: 'bllueprint-paper' },
  {
    id: 'blueprint',
    label: 'Blueprint (dark)',
    scheme: 'dark',
    editorTheme: 'bllueprint-blueprint',
  },
  { id: 'navy', label: 'Navy (dark, dots)', scheme: 'dark', editorTheme: 'bllueprint-navy' },
];

/**
 * Accent registry ("marker" color used for focus, active/selected states,
 * links, primary actions and the editor cursor). Orange was chosen on
 * 2026-10-15. To add an alternative: one entry here + the matching CSS in
 * each theme file under `[data-accent="<id>"]`.
 */
export const SKETCH_ACCENTS: readonly AccentDefinition[] = [
  {
    id: 'orange',
    label: 'Orange',
    editor: {
      paper: { ink: '#b94a00', fill: '#f67f2f' },
      blueprint: { ink: '#ff9b50', fill: '#ff9b50' },
      navy: { ink: '#ff9b50', fill: '#ff9b50' },
    },
  },
];

export const THEME_STORAGE_KEY = 'sketch-ui.theme';
export const ACCENT_STORAGE_KEY = 'sketch-ui.accent';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly themes = SKETCH_THEMES;
  readonly accents = SKETCH_ACCENTS;

  private readonly _theme = signal<ThemeDefinition>(this.resolveInitialTheme());
  private readonly _accent = signal<AccentDefinition>(this.resolveInitialAccent());

  readonly theme = this._theme.asReadonly();
  readonly accent = this._accent.asReadonly();
  readonly scheme = computed(() => this._theme().scheme);

  /** Accent hex pair for the current theme (for Monaco). */
  readonly editorAccent = computed<EditorAccent>(
    () => this._accent().editor[this._theme().id] ?? this.accents[0].editor['paper'],
  );

  constructor() {
    effect(() => this.applyTheme(this._theme()));
    effect(() => this.applyAccent(this._accent()));
  }

  setTheme(themeId: string): void {
    const theme = this.themes.find((candidate) => candidate.id === themeId);

    if (theme) {
      this._theme.set(theme);
    }
  }

  setAccent(accentId: string): void {
    const accent = this.accents.find((candidate) => candidate.id === accentId);

    if (accent) {
      this._accent.set(accent);
    }
  }

  defaultThemeFor(scheme: ThemeScheme): ThemeDefinition {
    return this.themes.find((candidate) => candidate.scheme === scheme) ?? this.themes[0];
  }

  private resolveInitialTheme(): ThemeDefinition {
    const stored = this.readStored(THEME_STORAGE_KEY);
    const storedTheme = stored
      ? this.themes.find((candidate) => candidate.id === stored)
      : undefined;

    if (storedTheme) {
      return storedTheme;
    }

    const prefersDark =
      this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

    return this.defaultThemeFor(prefersDark ? 'dark' : 'light');
  }

  private resolveInitialAccent(): AccentDefinition {
    const stored = this.readStored(ACCENT_STORAGE_KEY);

    return this.accents.find((candidate) => candidate.id === stored) ?? this.accents[0];
  }

  private readStored(key: string): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private writeStored(key: string, value: string): void {
    try {
      this.document.defaultView?.localStorage.setItem(key, value);
    } catch {
      // storage unavailable (private mode, blocked, …) — setting still applies for this session
    }
  }

  private applyTheme(theme: ThemeDefinition): void {
    const root = this.document.documentElement;

    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-scheme', theme.scheme);
    // Spartan's Tailwind preset defines `dark:` as `.dark *`
    root.classList.toggle('dark', theme.scheme === 'dark');
    root.style.colorScheme = theme.scheme;

    this.writeStored(THEME_STORAGE_KEY, theme.id);
  }

  private applyAccent(accent: AccentDefinition): void {
    this.document.documentElement.setAttribute('data-accent', accent.id);
    this.writeStored(ACCENT_STORAGE_KEY, accent.id);
  }
}
