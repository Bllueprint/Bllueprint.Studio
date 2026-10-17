import * as monaco from 'monaco-editor';

// ---------------------------------------------------------------------------
// Color palette reference
//
//  keyword.structural   #6AB0C8  — enum | value | aggregate | dto | controller | at | uses | process
//  keyword.type         #b84580  — guid | text | date | number | bool
//  keyword.set          #e06c75  — Set | To | ToBluePrintDefault
//  keyword.requires     #e5c07b  — Requires | EqualsTo | DifferentThan | LowerThan | HigherThan
//  keyword.error        #FFB86C  — ErrorMessage
//  keyword.http         #ae6bbc  — get | post | put | delete | patch
//  keyword.modifier     #a6a04d  — key | required | input | output | map | default | now
//  type.name            #A08FD4  — PascalCase user-defined identifiers
//  identifier           #98C9A3  — camelCase identifiers
//  keyword.architecture #db7b98  — saga | cqrs | outputbox
//  string               #CE9178  - camelCase identifiers
//  comment              #6A9955
//  number               #B5CEA8
//  delimiter.curly      #FFB86C
//  delimiter.paren      #88C8A8
// ---------------------------------------------------------------------------

monaco.languages.register({ id: 'bllueprint' });

monaco.languages.setLanguageConfiguration('bllueprint', {
  brackets: [
    ['{', '}'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
  ],
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
});

monaco.languages.setMonarchTokensProvider('bllueprint', {
  defaultToken: 'identifier',
  tokenPostfix: '.bllueprint',
  tokenizer: {
    root: [
      // Comments
      [/\/\/.*$/, 'comment'],
      [/\/\*/, 'comment', '@blockComment'],

      // Strings
      [/\$"/, 'string.interpolated', '@interpolatedString'],
      [/"/, 'string', '@string'],

      // Structural keywords
      [
        /\b(uses|enum|value|aggregate|dto|controller|process|api|handler|command|notification)\b/,
        'keyword.structural',
      ],

      // Set / To flow — transition assignment (ToBluePrintDefault must come before To)
      [/\bToBluePrintDefault\b/, 'keyword.set'],
      [/\b(Set|To)\b/, 'keyword.set'],

      // Requires flow — transition guards
      [/\b(Requires|EqualsTo|DifferentThan|LowerThan|HigherThan)\b/, 'keyword.requires'],

      // ErrorMessage
      [/\bErrorMessage\b/, 'keyword.error'],

      // HTTP verbs — controller methods
      [/\b(get|post|put|delete|patch)\b/, 'keyword.http'],

      // Field / endpoint modifiers
      [
        /\b(key|required|input|output|at|maps|default|now|use|list|of|basepath|on|invoke|fetch|save|emit|notify|with|create)\b/,
        'keyword.modifier',
      ],

      // Architectural keywords
      [/\b(saga|cqrs|outbox)\b/, 'keyword.architecture'],

      // Primitive types (all lowercase, renamed as per spec)
      [/\b(text|guid|date|number|bool)\b/, 'keyword.type'],

      // Constraints / validators
      [/\b(max|min|notEmpty|isEmail)\b/, 'keyword.constraint'],

      // Literals
      [/\b(true|false)\b/, 'keyword.literal'],

      // Operators
      [/<->/, 'operator.map'],
      [/=>/, 'operator.lambda'],
      [/=/, 'operator.equals'],

      // Delimiters
      [/[{}]/, 'delimiter.curly'],
      [/[()]/, 'delimiter.paren'],
      [/[<>]/, 'delimiter.angle'],
      [/[;]/, 'delimiter.semi'],
      [/,/, 'delimiter.comma'],

      // Identifiers — PascalCase = user-defined type, camelCase = variable/field
      [/[A-Z][a-zA-Z0-9]*/, 'type.name'],
      [/[a-zA-Z_]\w*/, 'identifier'],

      [/\d+\.\d+/, 'number.float'],
      [/\d+/, 'number'],
      [/[ \t\r\n]+/, 'white'],
    ],

    blockComment: [
      [/[^/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[/*]/, 'comment'],
    ],

    string: [
      [/[^"\\]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, 'string', '@pop'],
    ],

    interpolatedString: [
      [/\{/, 'string.interpolated.delimiter', '@interpolatedExpr'],
      [/[^"{]+/, 'string.interpolated'],
      [/"/, 'string.interpolated', '@pop'],
    ],

    interpolatedExpr: [
      [/[a-zA-Z_]\w*/, 'identifier.interpolated'],
      [/\}/, 'string.interpolated.delimiter', '@pop'],
    ],
  },
});

// ---------------------------------------------------------------------------
// Token colors — dark palette (used by 'bllueprint-dark' and the dark sketch themes)
// ---------------------------------------------------------------------------
const DARK_RULES: monaco.editor.ITokenThemeRule[] = [
  { token: '', foreground: 'D4D4D4', background: '1C1B1F' },

  // Structure
  { token: 'keyword.structural', foreground: '6AB0C8', fontStyle: 'bold' },

  // Primitive types
  { token: 'keyword.type', foreground: 'b84580' },

  // Transition assignment: Set / To
  { token: 'keyword.set', foreground: 'e06c75', fontStyle: 'bold' },

  // Transition guards: Requires / EqualsTo / DifferentThan etc.
  { token: 'keyword.requires', foreground: 'e5c07b', fontStyle: 'bold' },

  // ErrorMessage
  { token: 'keyword.error', foreground: 'FFB86C', fontStyle: 'italic' },

  // Controller HTTP verbs
  { token: 'keyword.http', foreground: 'ae6bbc', fontStyle: 'bold' },

  // Modifiers
  { token: 'keyword.modifier', foreground: 'a6a04d' },

  // Constraints / validators
  { token: 'keyword.constraint', foreground: 'BD8DE9' },

  // Keyword architecture
  { token: 'keyword.architecture', foreground: 'db7b98' },

  // Literals
  { token: 'keyword.literal', foreground: '569CD6' },

  // User-defined types (PascalCase)
  { token: 'type.name', foreground: 'A08FD4' },

  // Variables / fields (camelCase)
  { token: 'identifier', foreground: '98C9A3' },
  { token: 'identifier.interpolated', foreground: '6FCEBC', fontStyle: 'italic' },

  // Strings
  { token: 'string', foreground: 'CE9178', fontStyle: 'italic' },
  { token: 'string.interpolated', foreground: 'CE9178', fontStyle: 'italic' },
  { token: 'string.interpolated.delimiter', foreground: 'BD8DE9', fontStyle: 'bold' },
  { token: 'string.escape', foreground: 'D7BA7D' },

  // Comments
  { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },

  // Numbers
  { token: 'number', foreground: 'B5CEA8' },
  { token: 'number.float', foreground: 'B5CEA8' },

  // Operators
  { token: 'operator.map', foreground: 'E9C639', fontStyle: 'bold' },
  { token: 'operator.lambda', foreground: 'E9C639', fontStyle: 'bold' },
  { token: 'operator.equals', foreground: 'E9C639' },

  // Delimiters
  { token: 'delimiter.curly', foreground: 'FFB86C' },
  { token: 'delimiter.paren', foreground: '88C8A8' },
  { token: 'delimiter.angle', foreground: 'ABB2BF' },
  { token: 'delimiter.semi', foreground: '808080' },
  { token: 'delimiter.comma', foreground: '808080' },
];

// ---------------------------------------------------------------------------
// Token colors — light palette (same roles, darker inks for the paper theme)
// ---------------------------------------------------------------------------
const LIGHT_RULES: monaco.editor.ITokenThemeRule[] = [
  { token: '', foreground: '222935' },

  { token: 'keyword.structural', foreground: '1f7a99', fontStyle: 'bold' },
  { token: 'keyword.type', foreground: 'a3306b' },
  { token: 'keyword.set', foreground: 'c23b46', fontStyle: 'bold' },
  { token: 'keyword.requires', foreground: 'a07510', fontStyle: 'bold' },
  { token: 'keyword.error', foreground: 'a0455a', fontStyle: 'italic' },
  { token: 'keyword.http', foreground: '7e3f8f', fontStyle: 'bold' },
  { token: 'keyword.modifier', foreground: '6f6a18' },
  { token: 'keyword.constraint', foreground: '7b4fc4' },
  { token: 'keyword.architecture', foreground: 'b23a62' },
  { token: 'keyword.literal', foreground: '1c66b0' },

  { token: 'type.name', foreground: '5a46a8' },
  { token: 'identifier', foreground: '2f7a45' },
  { token: 'identifier.interpolated', foreground: '1f8a78', fontStyle: 'italic' },

  { token: 'string', foreground: 'a0522d', fontStyle: 'italic' },
  { token: 'string.interpolated', foreground: 'a0522d', fontStyle: 'italic' },
  { token: 'string.interpolated.delimiter', foreground: '7b4fc4', fontStyle: 'bold' },
  { token: 'string.escape', foreground: '8a6a1a' },

  { token: 'comment', foreground: '5f8a4a', fontStyle: 'italic' },

  { token: 'number', foreground: '3f7a2f' },
  { token: 'number.float', foreground: '3f7a2f' },

  { token: 'operator.map', foreground: '9a7a00', fontStyle: 'bold' },
  { token: 'operator.lambda', foreground: '9a7a00', fontStyle: 'bold' },
  { token: 'operator.equals', foreground: '9a7a00' },

  { token: 'delimiter.curly', foreground: '8a6a1a' },
  { token: 'delimiter.paren', foreground: '2f8a60' },
  { token: 'delimiter.angle', foreground: '5c6370' },
  { token: 'delimiter.semi', foreground: '8a8f99' },
  { token: 'delimiter.comma', foreground: '8a8f99' },
];

// ---------------------------------------------------------------------------
// Themes
//
// 'bllueprint-dark' is the original VS Code-like theme (kept as is).
// 'bllueprint-blueprint' / 'bllueprint-navy' / 'bllueprint-paper' follow the sketch-ui themes
// (src/sketch-ui/styles/themes). Their editor background is TRANSPARENT so the
// paper pattern of the theme shows through; the hex values mirror the oklch
// colors of the corresponding theme file.
// ---------------------------------------------------------------------------
monaco.editor.defineTheme('bllueprint-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: DARK_RULES,
  colors: {
    'editor.background': '#1C1B1F',
    'editor.foreground': '#D4D4D4',
    'editorLineNumber.foreground': '#4A4A5A',
    'editorLineNumber.activeForeground': '#6AB0C8',
    'editor.selectionBackground': '#264F78',
    'editor.lineHighlightBackground': '#2A2A3E',
    'editorCursor.foreground': '#A08FD4',
    'editorBracketHighlight.foreground1': '#FFB86C',
    'editorBracketHighlight.foreground2': '#BD8DE9',
    'editorBracketHighlight.foreground3': '#4EC9B0',
    'editorBracketHighlight.foreground4': '#E9C639',
    'editorBracketHighlight.foreground5': '#6AB0C8',
    'editorBracketHighlight.foreground6': '#CE9178',
    'editorBracketHighlight.unexpectedBracket.foreground': '#E24B4A',
  },
});

/** Accent hex pair per sketch theme (mirrors --sketch-accent / --sketch-accent-fill). */
export interface SketchEditorAccent {
  ink: string;
  fill: string;
}

export interface SketchEditorAccents {
  paper: SketchEditorAccent;
  blueprint: SketchEditorAccent;
  navy: SketchEditorAccent;
}

/** Default accent ("orange"); ThemeService re-registers when the user changes it. */
export const DEFAULT_SKETCH_EDITOR_ACCENTS: SketchEditorAccents = {
  paper: { ink: '#b94a00', fill: '#f67f2f' },
  blueprint: { ink: '#ff9b50', fill: '#ff9b50' },
  navy: { ink: '#ff9b50', fill: '#ff9b50' },
};

/**
 * Opaque surfaces a dark sketch theme needs for the widgets that float over
 * the (transparent) code area. Hex mirrors of the theme's oklch colors.
 */
interface DarkSketchSurfaces {
  /** `--background`: inputs, sticky scroll */
  paper: string;
  /** `--card`: suggest / hover widgets */
  card: string;
  /** `--secondary`: selected suggestion */
  raised: string;
}

const BLUEPRINT_SURFACES: DarkSketchSurfaces = {
  paper: '#132e50',
  card: '#1a3658',
  raised: '#324e73',
};
const NAVY_SURFACES: DarkSketchSurfaces = { paper: '#0b223e', card: '#132946', raised: '#1f3654' };

// Blueprint reuses the dark palette, except the two orange tokens (ErrorMessage
// and curly braces): orange is now reserved for the accent.
const BLUEPRINT_RULES: monaco.editor.ITokenThemeRule[] = DARK_RULES.map((rule) => {
  switch (rule.token) {
    case '':
      return { token: '', foreground: 'f1eee6' };
    case 'keyword.error':
      return { ...rule, foreground: 'E8A0B4' };
    case 'delimiter.curly':
      return { ...rule, foreground: 'D7C27A' };
    default:
      return rule;
  }
});

/**
 * (Re)registers the sketch Monaco themes with the given accent. Calling it
 * again with the same names updates the themes; `setTheme` must follow to
 * repaint an open editor.
 */
export function registerSketchEditorThemes(accents: SketchEditorAccents): void {
  const pp = accents.paper;

  defineDarkSketchTheme('bllueprint-blueprint', accents.blueprint, BLUEPRINT_SURFACES);
  defineDarkSketchTheme('bllueprint-navy', accents.navy, NAVY_SURFACES);

  monaco.editor.defineTheme('bllueprint-paper', {
    base: 'vs',
    inherit: true,
    rules: LIGHT_RULES,
    colors: {
      'editor.background': '#00000000',
      'editorGutter.background': '#00000000',
      'minimap.background': '#00000000',
      'editor.foreground': '#222935',
      'editorLineNumber.foreground': '#a3a8b1',
      'editorLineNumber.activeForeground': pp.ink,
      'editor.selectionBackground': `${pp.fill}33`,
      'editor.inactiveSelectionBackground': `${pp.fill}1a`,
      'editor.selectionHighlightBackground': `${pp.fill}22`,
      'editor.wordHighlightBackground': `${pp.fill}22`,
      'editor.findMatchBackground': `${pp.fill}55`,
      'editor.findMatchHighlightBackground': `${pp.fill}2a`,
      'editor.lineHighlightBackground': '#2229350d',
      'editor.lineHighlightBorder': '#00000000',
      'editorCursor.foreground': pp.ink,
      'editorIndentGuide.background1': '#22293522',
      'editorIndentGuide.activeBackground1': '#22293555',
      'editorWhitespace.foreground': '#2229352e',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#22293533',
      'scrollbarSlider.hoverBackground': '#22293555',
      'scrollbarSlider.activeBackground': '#22293577',
      'minimapSlider.background': '#22293522',
      'editorWidget.background': '#fcfaf4',
      'editorWidget.border': '#22293566',
      'editorSuggestWidget.background': '#fcfaf4',
      'editorSuggestWidget.border': '#22293566',
      'editorSuggestWidget.selectedBackground': '#eee4cf',
      'editorHoverWidget.background': '#fcfaf4',
      'editorHoverWidget.border': '#22293566',
      'input.background': '#fcfaf4',
      'input.border': '#22293566',
      'editorStickyScroll.background': '#fcfaf4',
      'editorStickyScrollGutter.background': '#fcfaf4',
      'editorStickyScrollHover.background': '#f6f3eb',
      'editorStickyScroll.border': '#22293540',
      'editorStickyScroll.shadow': '#00000000',
      focusBorder: pp.ink,
      'editorBracketHighlight.foreground1': '#8a6a1a',
      'editorBracketHighlight.foreground2': '#7b4fc4',
      'editorBracketHighlight.foreground3': '#1f8a78',
      'editorBracketHighlight.foreground4': '#9a7a00',
      'editorBracketHighlight.foreground5': '#1f7a99',
      'editorBracketHighlight.foreground6': '#a0522d',
      'editorBracketHighlight.unexpectedBracket.foreground': '#c23b46',
    },
  });
}

/** Chalk-on-blue editor theme shared by the dark sketch themes (blueprint, navy). */
function defineDarkSketchTheme(
  name: string,
  accent: SketchEditorAccent,
  surfaces: DarkSketchSurfaces,
): void {
  monaco.editor.defineTheme(name, {
    base: 'vs-dark',
    inherit: true,
    rules: BLUEPRINT_RULES,
    colors: {
      'editor.background': '#00000000',
      'editorGutter.background': '#00000000',
      'minimap.background': '#00000000',
      'editor.foreground': '#f1eee6',
      'editorLineNumber.foreground': '#7f8ea8',
      'editorLineNumber.activeForeground': accent.ink,
      'editor.selectionBackground': `${accent.fill}33`,
      'editor.inactiveSelectionBackground': `${accent.fill}1f`,
      'editor.selectionHighlightBackground': `${accent.fill}22`,
      'editor.wordHighlightBackground': `${accent.fill}22`,
      'editor.findMatchBackground': `${accent.fill}55`,
      'editor.findMatchHighlightBackground': `${accent.fill}2a`,
      'editor.lineHighlightBackground': '#f1eee612',
      'editor.lineHighlightBorder': '#00000000',
      'editorCursor.foreground': accent.ink,
      'editorIndentGuide.background1': '#f1eee626',
      'editorIndentGuide.activeBackground1': '#f1eee659',
      'editorWhitespace.foreground': '#f1eee633',
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': '#f1eee633',
      'scrollbarSlider.hoverBackground': '#f1eee655',
      'scrollbarSlider.activeBackground': '#f1eee677',
      'minimapSlider.background': '#f1eee622',
      'editorWidget.background': surfaces.card,
      'editorWidget.border': '#f1eee659',
      'editorSuggestWidget.background': surfaces.card,
      'editorSuggestWidget.border': '#f1eee659',
      'editorSuggestWidget.selectedBackground': surfaces.raised,
      'editorHoverWidget.background': surfaces.card,
      'editorHoverWidget.border': '#f1eee659',
      'input.background': surfaces.paper,
      'input.border': '#f1eee659',
      // Sticky scroll (scope header pinned at the top) must NOT be transparent,
      // otherwise the pinned lines overlap the code scrolling underneath.
      'editorStickyScroll.background': surfaces.paper,
      'editorStickyScrollGutter.background': surfaces.paper,
      'editorStickyScrollHover.background': surfaces.card,
      'editorStickyScroll.border': '#f1eee640',
      'editorStickyScroll.shadow': '#00000000',
      focusBorder: accent.ink,
      'editorBracketHighlight.foreground1': '#D7C27A',
      'editorBracketHighlight.foreground2': '#BD8DE9',
      'editorBracketHighlight.foreground3': '#4EC9B0',
      'editorBracketHighlight.foreground4': '#E9C639',
      'editorBracketHighlight.foreground5': '#6AB0C8',
      'editorBracketHighlight.foreground6': '#CE9178',
      'editorBracketHighlight.unexpectedBracket.foreground': '#E24B4A',
    },
  });
}

registerSketchEditorThemes(DEFAULT_SKETCH_EDITOR_ACCENTS);
