import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { SketchConfigService, ThemeService } from '@sketch-ui/core';
import {
  DEFAULT_SKETCH_EDITOR_ACCENTS,
  registerSketchEditorThemes,
} from '@app/core/monaco/bllueprint-language';
import { TabsStore } from '@app/state/tabs/tabs.store';

/**
 * Hosts the single Monaco editor instance and keeps one text model per open
 * file tab, so switching tabs preserves undo history, cursor and scroll.
 */
@Component({
  selector: 'app-editor-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editor-host.html',
  styleUrl: './editor-host.scss',
})
export class EditorHostComponent {
  private readonly editorContainer =
    viewChild.required<ElementRef<HTMLDivElement>>('editorContainer');

  private readonly tabsStore = inject(TabsStore);
  private readonly themeService = inject(ThemeService);
  private readonly sketchConfig = inject(SketchConfigService);
  private readonly destroyRef = inject(DestroyRef);

  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private readonly models = new Map<string, monaco.editor.ITextModel>();
  private resizeObserver: ResizeObserver | null = null;
  private suppressContentSync = false;

  protected readonly hasTabs = computed(() => this.tabsStore.tabs().length > 0);

  constructor() {
    // Follow the sketch theme (paper / blueprint / navy) and accent with the matching
    // Monaco theme. Themes are re-registered with the accent hex pair because
    // Monaco cannot read CSS variables.
    effect(() => {
      const theme = this.themeService.theme();
      const accent = this.themeService.accent();

      registerSketchEditorThemes({
        paper: accent.editor['paper'] ?? DEFAULT_SKETCH_EDITOR_ACCENTS.paper,
        blueprint: accent.editor['blueprint'] ?? DEFAULT_SKETCH_EDITOR_ACCENTS.blueprint,
        navy: accent.editor['navy'] ?? DEFAULT_SKETCH_EDITOR_ACCENTS.navy,
      });
      monaco.editor.setTheme(theme.editorTheme);
    });

    // Code font preference (monospace vs Comic Mono). Monaco measures glyph
    // widths when the option changes, so wait for the font to be loaded and
    // remeasure, otherwise the cursor drifts from the text.
    effect(() => {
      const fontFamily = this.sketchConfig.codeFontFamily();

      this.editor?.updateOptions({ fontFamily });
      document.fonts.load(`14px ${fontFamily}`).then(
        () => monaco.editor.remeasureFonts(),
        () => monaco.editor.remeasureFonts(),
      );
    });

    effect(() => {
      const activeTab = this.tabsStore.activeTab();

      if (this.editor && activeTab) {
        this.switchToTab(activeTab.id);
      }
    });

    afterNextRender(() => this.createEditor());
    this.destroyRef.onDestroy(() => this.dispose());
  }

  private createEditor(): void {
    const container = this.editorContainer().nativeElement;

    this.editor = monaco.editor.create(container, {
      value: '',
      language: 'bllueprint',
      theme: this.themeService.theme().editorTheme,
      fontSize: 14,
      fontFamily: this.sketchConfig.codeFontFamily(),
      fontLigatures: true,
      lineHeight: 22,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: false,
      tabSize: 2,
      mouseWheelZoom: true,
      insertSpaces: true,
      renderWhitespace: 'selection',
      bracketPairColorization: {
        enabled: true,
        independentColorPoolPerBracketType: true,
      },
      guides: { bracketPairs: true },
      padding: { top: 12, bottom: 12 },
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      renderLineHighlight: 'all',
      scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    });

    this.editor.onDidChangeModelContent(() => {
      if (this.suppressContentSync || !this.editor) {
        return;
      }

      const activeTab = this.tabsStore.activeTab();
      const content = this.editor.getValue();

      if (activeTab && content !== activeTab.content) {
        this.tabsStore.updateTabContent(activeTab.id, content);
      }
    });

    const activeTab = this.tabsStore.activeTab();

    if (activeTab) {
      this.switchToTab(activeTab.id);
    }

    this.resizeObserver = new ResizeObserver(() => this.editor?.layout());
    this.resizeObserver.observe(container);
  }

  private switchToTab(tabId: string): void {
    const tab = this.tabsStore.tabs().find((candidate) => candidate.id === tabId);

    if (!tab || !this.editor) {
      return;
    }

    let model = this.models.get(tabId);

    if (!model) {
      model = monaco.editor.createModel(
        tab.content,
        tab.language,
        monaco.Uri.parse(`inmemory://model/${tabId}`),
      );
      this.models.set(tabId, model);
    } else if (model.getValue() !== tab.content) {
      this.suppressContentSync = true;
      model.setValue(tab.content);
      this.suppressContentSync = false;
    }

    this.editor.setModel(model);
    this.editor.focus();
  }

  private dispose(): void {
    this.resizeObserver?.disconnect();
    this.models.forEach((model) => model.dispose());
    this.models.clear();
    this.editor?.dispose();
    this.editor = null;
  }
}
