# Theme contract

Every theme is one CSS file in this folder, scoped by an attribute selector:

```css
[data-theme='<id>'] {
  color-scheme: light | dark;
  /* all variables below */
}
```

The `ThemeService` (`src/sketch-ui/core/theme.service.ts`) sets `data-theme`,
`data-scheme`, `.dark` and `data-accent` on `<html>`. A new theme = one file
that fills this contract + one entry in `SKETCH_THEMES` (full step-by-step in
[`../../README.md`](../../README.md), section 9).

**Golden rule:** components never use literal colors (`#hex`, `oklch(...)`,
`bg-white`, `text-zinc-900`). Only these variables and the `--sketch-*` tokens.

## Spartan semantic variables (required)

| Variable                                                                                                                                                                          | Used for                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `--radius`                                                                                                                                                                        | base radius consumed by the Spartan helms (sketch helms ignore it)            |
| `--background` / `--foreground`                                                                                                                                                   | paper / ink                                                                   |
| `--card` / `--card-foreground`                                                                                                                                                    | cards                                                                         |
| `--popover` / `--popover-foreground`                                                                                                                                              | popovers, dialogs, tooltips, menus                                            |
| `--primary` / `--primary-foreground`                                                                                                                                              | primary actions (Spartan helms)                                               |
| `--secondary` / `--secondary-foreground`                                                                                                                                          | secondary actions                                                             |
| `--muted` / `--muted-foreground`                                                                                                                                                  | subtle surfaces / secondary text                                              |
| `--accent` / `--accent-foreground`                                                                                                                                                | neutral hover/highlight surface (NOT the brand accent, see `--sketch-accent`) |
| `--destructive`                                                                                                                                                                   | errors and destructive actions (cool carmine, kept far from the orange)       |
| `--border` / `--input` / `--ring`                                                                                                                                                 | borders, form borders, focus ring (`--ring: var(--sketch-accent)`)            |
| `--chart-1` … `--chart-5`                                                                                                                                                         | categorical chart palette                                                     |
| `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring` | Spartan sidebar helm (`--sidebar-ring: var(--sketch-accent)`)                 |

## Sketch variables (required)

| Variable                      | Used for                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `--sketch-paper-pattern`      | `background-image` of paper surfaces (`none` allowed)                                         |
| `--sketch-paper-pattern-size` | `background-size` of the pattern                                                              |
| `--sketch-accent`             | accent ink, text-safe: focus, links, marks (check/radio), editor cursor, solid primary button |
| `--sketch-accent-fill`        | vivid accent: tint of active states, hover hatch, progress, switch                            |

Optional: `--sketch-accent-soft` (tint of active states; default 22% of the
fill, blueprint uses 30%) and `--sketch-accent-contrast` (text on a solid
accent block; default `--background`).

Accent usage is fixed app-wide (decided 2026-10-15): active/selected = soft
tint, hover = light hatch, primary button = solid accent. An alternative
accent is one entry in `SKETCH_ACCENTS` (`core/theme.service.ts`, with the hex
mirrors Monaco needs) plus the CSS under
`[data-theme="<id>"][data-accent="<accent>"], [data-accent="<accent>"] [data-theme="<id>"]`.

Shape tokens (`--sketch-width`, `--sketch-radius`, `--sketch-font`, …) live in
`../tokens.css` and are shared. A theme MAY override them.
