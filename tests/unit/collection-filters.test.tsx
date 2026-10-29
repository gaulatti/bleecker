import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { CollectionFilters, type CollectionFilterOption, type CollectionSortOption } from '../../src/components/collection-filters';
import type { SortState } from '../../src/components/table';
import { click, pickSelectOption, render } from './helpers';

const filterOptions: CollectionFilterOption[] = [
  { field: 'status', label: 'Status', type: 'select', options: [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }] },
  { field: 'flag', label: 'Flagged', type: 'boolean' },
  { field: 'due', label: 'Due date', type: 'date' },
  { field: 'broken', label: 'Broken', type: 'select' }
];
const sortOptions: CollectionSortOption[] = [{ field: 'name', label: 'Name' }, { field: 'age', label: 'Age' }];
const sort: SortState = { field: 'name', order: 'asc' };

const byText = (text: string) => Array.from(document.querySelectorAll<HTMLElement>('button')).find(node => node.textContent?.includes(text))!;
const chips = () => Array.from(document.querySelectorAll<HTMLElement>('button[aria-label^="Remove"]'));
const control = (label: string) => document.querySelector<HTMLElement>(`[aria-label="${label}"]`)!;

async function renderFilters(overrides: Partial<React.ComponentProps<typeof CollectionFilters>> = {}) {
  const props = { onFilterChange: vi.fn(), onSortChange: vi.fn() };
  const view = await render(
    <CollectionFilters currentFilters={{}} currentSort={sort} filterOptions={filterOptions} sortOptions={sortOptions} {...props} {...overrides} />
  );
  return { ...props, view };
}

describe('CollectionFilters', () => {
  test('renders nothing without filter or sort options', async () => {
    const { view } = await renderFilters({ filterOptions: [], sortOptions: [] });
    expect(view.container.innerHTML).toBe('');
  });

  test('renders with only filters or only sorting', async () => {
    await renderFilters({ sortOptions: [] });
    expect(document.body.textContent).toContain('Filters');
    expect(document.querySelector('[aria-label="Sort collection by"]')).toBeNull();
    await renderFilters({ filterOptions: [] });
    expect(document.querySelectorAll('[aria-label="Sort collection by"]')).toHaveLength(1);
  });

  test('toggles the filter panel and renders a control for every filter type', async () => {
    await renderFilters({ currentFilters: { flag: true }, className: 'extra' });
    expect(byText('Filters').getAttribute('aria-expanded')).toBe('false');
    expect(document.body.textContent).not.toContain('Refine results');
    await click(byText('Filters'));
    expect(byText('Filters').getAttribute('aria-expanded')).toBe('true');
    expect(document.body.textContent).toContain('Refine results');
    expect(control('Status')).not.toBeNull();
    expect(control('Flagged')).not.toBeNull();
    expect(control('Due date')).not.toBeNull();
    expect(document.body.textContent).toContain('Choose due date');
    await click(byText('Filters'));
    expect(document.body.textContent).not.toContain('Refine results');
  });

  test('starts expanded when requested', async () => {
    await renderFilters({ defaultExpanded: true });
    expect(document.body.textContent).toContain('Refine results');
  });

  test('summarises active filters as removable chips with readable values', async () => {
    await renderFilters({
      currentFilters: { status: 'open', flag: false, due: '2024-03-05', other: 'raw', bad: 'nope', mystery: 'x', gone: 'zzz', yes: true },
      filterOptions: [
        ...filterOptions,
        { field: 'mystery', label: 'Mystery', type: 'select', options: [{ label: 'Y', value: 'y' }] },
        { field: 'bad', label: 'Bad date', type: 'date' },
        { field: 'yes', label: 'Yes flag', type: 'boolean' }
      ]
    });
    const text = chips().map(chip => chip.textContent);
    expect(text[0]).toBe('StatusOpen');
    expect(text[1]).toBe('FlaggedNo');
    expect(text[2]).toMatch(/^Due date.*Mar.*5.*2024$/);
    expect(text.slice(3)).toEqual(['otherraw', 'Bad datenope', 'Mysteryx', 'gonezzz', 'Yes flagYes']);
    expect(byText('Filters').textContent).toContain('8');
  });

  test('removing a chip and clearing everything notify the parent', async () => {
    const { onFilterChange } = await renderFilters({ currentFilters: { status: 'open', flag: true } });
    await click(chips()[0]);
    expect(onFilterChange).toHaveBeenLastCalledWith({ flag: true });
    await click(byText('Clear all'));
    expect(onFilterChange).toHaveBeenLastCalledWith({});
  });

  test('has no chips, badge or clear button when nothing is filtered', async () => {
    await renderFilters();
    expect(chips()).toHaveLength(0);
    expect(byText('Clear all')).toBeUndefined();
  });

  test('sort controls change the field and flip the order', async () => {
    const { onSortChange, view } = await renderFilters();
    await pickSelectOption(control('Sort collection by'), 'Age');
    expect(onSortChange).toHaveBeenLastCalledWith({ field: 'age', order: 'asc' });
    await click(control('Sort descending'));
    expect(onSortChange).toHaveBeenLastCalledWith({ field: 'name', order: 'desc' });
    expect(control('Sort descending').title).toBe('Sort Descending');
    await view.rerender(<CollectionFilters currentFilters={{}} currentSort={{ field: 'name', order: 'desc' }} filterOptions={filterOptions} sortOptions={sortOptions} onFilterChange={() => undefined} onSortChange={onSortChange} />);
    expect(control('Sort ascending').title).toBe('Sort Ascending');
    await click(control('Sort ascending'));
    expect(onSortChange).toHaveBeenLastCalledWith({ field: 'name', order: 'asc' });
  });

  test('select and boolean filters set and clear their values', async () => {
    const { onFilterChange, view } = await renderFilters({ defaultExpanded: true });
    await pickSelectOption(control('Status'), 'Closed');
    expect(onFilterChange).toHaveBeenLastCalledWith({ status: 'closed' });
    await pickSelectOption(control('Flagged'), 'Yes');
    expect(onFilterChange).toHaveBeenLastCalledWith({ flag: true });
    await pickSelectOption(control('Flagged'), 'No');
    expect(onFilterChange).toHaveBeenLastCalledWith({ flag: false });
    await view.rerender(
      <CollectionFilters currentFilters={{ status: 'open', flag: true, due: '2024-03-05' }} currentSort={sort} filterOptions={filterOptions} sortOptions={sortOptions} onFilterChange={onFilterChange} onSortChange={() => undefined} defaultExpanded />
    );
    await pickSelectOption(control('Status'), 'All');
    expect(onFilterChange).toHaveBeenLastCalledWith({ flag: true, due: '2024-03-05' });
    await pickSelectOption(control('Flagged'), 'All');
    expect(onFilterChange).toHaveBeenLastCalledWith({ status: 'open', due: '2024-03-05' });
  });

  test('date filters parse existing values, set a chosen day and clear it', async () => {
    const { onFilterChange, view } = await renderFilters({ defaultExpanded: true, currentFilters: { due: '2024-03-05' } });
    const trigger = control('Due date');
    expect(trigger.textContent).toContain('Mar 5, 2024');
    await click(trigger);
    await vi.waitFor(() => expect(document.querySelector('button[aria-label="Tue Mar 05 2024"]')).not.toBeNull());
    await click(document.querySelector('button[aria-label="Fri Mar 08 2024"]')!);
    expect(onFilterChange).toHaveBeenLastCalledWith({ due: '2024-03-08' });
    await click(trigger);
    await vi.waitFor(() => expect(byText('Clear date')).not.toBeUndefined());
    await click(byText('Clear date'));
    expect(onFilterChange).toHaveBeenLastCalledWith({});
    await view.rerender(
      <CollectionFilters currentFilters={{ due: 'garbage' }} currentSort={sort} filterOptions={filterOptions} sortOptions={sortOptions} onFilterChange={onFilterChange} onSortChange={() => undefined} defaultExpanded />
    );
    expect(control('Due date').textContent).toContain('Choose due date');
    await view.rerender(
      <CollectionFilters currentFilters={{ due: '2024-13-' }} currentSort={sort} filterOptions={filterOptions} sortOptions={sortOptions} onFilterChange={onFilterChange} onSortChange={() => undefined} defaultExpanded />
    );
    expect(control('Due date').textContent).toContain('Choose due date');
  });
});
