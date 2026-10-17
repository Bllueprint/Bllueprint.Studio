import { TestBed } from '@angular/core/testing';
import {
  PlaygroundPageComponent,
  compareRows,
  makeRows,
  nextSort,
  sortRows,
} from './playground-page';

describe('playground datagrid sorting', () => {
  const rows = makeRows(12);

  it('compares numbers numerically and text with locale rules', () => {
    expect(compareRows(rows[0], rows[1], 'id')).toBeLessThan(0);
    expect(compareRows(rows[1], rows[0], 'progress')).toBeGreaterThan(0);
    expect(compareRows(rows[0], rows[0], 'owner')).toBe(0);
  });

  it('cycles a header through ascending, descending and unsorted', () => {
    const asc = nextSort(null, 'owner');
    const desc = nextSort(asc, 'owner');

    expect(asc).toEqual({ key: 'owner', direction: 'asc' });
    expect(desc).toEqual({ key: 'owner', direction: 'desc' });
    expect(nextSort(desc, 'owner')).toBeNull();
    expect(nextSort(desc, 'status')).toEqual({ key: 'status', direction: 'asc' });
  });

  it('sorts without mutating the source rows', () => {
    const sorted = sortRows(rows, { key: 'progress', direction: 'desc' });

    expect(sorted.map((row) => row.progress)).toEqual(
      [...rows.map((row) => row.progress)].sort((a, b) => b - a),
    );
    expect(rows[0].id).toBe(1);
    expect(sortRows(rows, null).map((row) => row.id)).toEqual(rows.map((row) => row.id));
  });
});

describe('PlaygroundPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaygroundPageComponent],
    }).compileComponents();
  });

  it('exposes aria-sort states that follow the current sort', () => {
    const component = TestBed.createComponent(PlaygroundPageComponent).componentInstance;

    expect(component.gridSortStates().owner).toBeNull();

    component.sortGrid('owner');
    expect(component.gridSortStates().owner).toBe('ascending');
    expect(component.gridSortStates().name).toBeNull();
    expect(component.sortedGridRows()[0].owner).toBe('Ana');

    component.sortGrid('owner');
    expect(component.gridSortStates().owner).toBe('descending');
    expect(component.sortedGridRows()[0].owner).toBe('Fabio');
  });

  it('renders a sortable header button per column', () => {
    const fixture = TestBed.createComponent(PlaygroundPageComponent);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.sk-table__sort');

    expect(buttons.length).toBe(5);
  });
});
