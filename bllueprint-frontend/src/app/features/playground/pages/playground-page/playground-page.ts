import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SketchConfigService, ThemeService } from '@sketch-ui/core';
import { SketchMenuDirective, SketchSliderComponent } from '@sketch-ui/elements';

interface PlaygroundSection {
  id: string;
  label: string;
}

export interface DemoRow {
  id: number;
  name: string;
  owner: string;
  status: 'Todo' | 'In progress' | 'Complete';
  progress: number;
}

export type GridColumnKey = keyof DemoRow;
export type SortDirection = 'asc' | 'desc';
type AriaSort = 'ascending' | 'descending' | null;

interface GridColumn {
  key: GridColumnKey;
  label: string;
}

export interface GridSort {
  key: GridColumnKey;
  direction: SortDirection;
}

interface CalendarCell {
  day: number;
  outside: boolean;
}

const OWNERS = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fabio'];
const STATUSES: DemoRow['status'][] = ['Todo', 'In progress', 'Complete'];

const GRID_COLUMNS: GridColumn[] = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'Task' },
  { key: 'owner', label: 'Owner' },
  { key: 'status', label: 'Status' },
  { key: 'progress', label: 'Progress' },
];

export function makeRows(count: number): DemoRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Task ${String(index + 1).padStart(3, '0')}`,
    owner: OWNERS[index % OWNERS.length],
    status: STATUSES[(index * 7) % STATUSES.length],
    progress: (index * 37) % 101,
  }));
}

function makeCalendar(): CalendarCell[] {
  const cells: CalendarCell[] = [];

  for (const day of [29, 30]) {
    cells.push({ day, outside: true });
  }

  for (let day = 1; day <= 31; day++) {
    cells.push({ day, outside: false });
  }

  for (let day = 1; cells.length < 35; day++) {
    cells.push({ day, outside: true });
  }

  return cells;
}

/** Numeric columns compare as numbers, everything else as locale-aware text. */
export function compareRows(a: DemoRow, b: DemoRow, key: GridColumnKey): number {
  const left = a[key];
  const right = b[key];

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, { numeric: true });
}

/** Header click cycle: unsorted → ascending → descending → unsorted. */
export function nextSort(current: GridSort | null, key: GridColumnKey): GridSort | null {
  if (current?.key !== key) {
    return { key, direction: 'asc' };
  }

  return current.direction === 'asc' ? { key, direction: 'desc' } : null;
}

export function sortRows(rows: readonly DemoRow[], sort: GridSort | null): DemoRow[] {
  if (!sort) {
    return [...rows];
  }

  const sign = sort.direction === 'asc' ? 1 : -1;

  return [...rows].sort((a, b) => sign * compareRows(a, b, sort.key));
}

/**
 * Sketch UI playground (plano-sketch-ui.md §5): every component rendered once,
 * hardcoded, with the global toolbar (theme, side-by-side, stroke width,
 * handwriting font, code font).
 *
 * This page is a catalogue and is allowed to exceed the usual size limits
 * (docs/frontend-guidelines.md §4); it shrinks as helms replace the `.sk-*` blocks.
 */
@Component({
  selector: 'app-playground-page',
  imports: [NgTemplateOutlet, SketchMenuDirective, SketchSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './playground-page.html',
  styleUrl: './playground-page.scss',
})
export class PlaygroundPageComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly config = inject(SketchConfigService);

  protected readonly sideBySide = signal(false);
  protected readonly activeTab = signal('overview');

  protected readonly sections: PlaygroundSection[] = [
    { id: 'basics', label: 'Basics' },
    { id: 'forms', label: 'Forms' },
    { id: 'overlays', label: 'Overlays' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'data', label: 'Data' },
    { id: 'composed', label: 'Composed screen' },
  ];

  protected readonly tableRows = makeRows(50);
  protected readonly composedRows = this.tableRows.slice(0, 6);
  protected readonly gridRows = makeRows(1000);
  protected readonly calendar = makeCalendar();
  protected readonly weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  /** Datagrid: columns, current sort and the rows in display order. */
  protected readonly gridColumns = GRID_COLUMNS;
  readonly gridSort = signal<GridSort | null>(null);
  readonly sortedGridRows = computed(() => sortRows(this.gridRows, this.gridSort()));
  /** `aria-sort` value per column key, recomputed only when the sort changes. */
  readonly gridSortStates = computed<Record<GridColumnKey, AriaSort>>(() => {
    const sort = this.gridSort();
    const states = {} as Record<GridColumnKey, AriaSort>;

    for (const column of GRID_COLUMNS) {
      states[column.key] =
        sort?.key !== column.key ? null : sort.direction === 'asc' ? 'ascending' : 'descending';
    }

    return states;
  });

  /** Day of the hardcoded month (October 2026) shown as selected in the calendar / date picker. */
  protected readonly selectedDay = signal(15);
  protected readonly dueDate = computed(
    () => `2026-10-${String(this.selectedDay()).padStart(2, '0')}`,
  );

  /** Demo value of the standalone slider in the Forms section. */
  protected readonly demoSlider = signal(40);

  protected pickDay(cell: CalendarCell): void {
    if (!cell.outside) {
      this.selectedDay.set(cell.day);
    }
  }

  sortGrid(key: GridColumnKey): void {
    this.gridSort.update((current) => nextSort(current, key));
  }

  protected onThemeChange(event: Event): void {
    this.theme.setTheme((event.target as HTMLSelectElement).value);
  }

  protected onSideBySide(event: Event): void {
    this.sideBySide.set((event.target as HTMLInputElement).checked);
  }

  protected onHandwriting(event: Event): void {
    this.config.setHandwriting((event.target as HTMLInputElement).checked);
  }

  protected onEditorFont(event: Event): void {
    this.config.setEditorFont((event.target as HTMLInputElement).checked ? 'sketch' : 'mono');
  }

  protected selectTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  /** Scrolls to a section inside the same canvas (works with side-by-side panes). */
  protected scrollTo(event: Event, sectionId: string): void {
    const canvas = (event.target as HTMLElement).closest('.pg__canvas');
    const target = canvas?.querySelector(`[data-section="${sectionId}"]`);

    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
