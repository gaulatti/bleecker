import React from 'react';
import { type ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { describe, expect, test } from 'vitest';

import { DataTable } from '../../src/components/data-table';
import { DataTableColumnToggle } from '../../src/components/data-table-column-toggle';
import { DataTableSelectFilter } from '../../src/components/data-table-filters';
import { DataTablePagination } from '../../src/components/data-table-pagination';
import { DataTableToolbar } from '../../src/components/data-table-toolbar';
import { click, pickSelectOption, render, type } from './helpers';

interface Person { id: number; name: string; team: string }
const people: Person[] = Array.from({ length: 25 }, (_, index) => ({ id: index + 1, name: `Person ${index + 1}`, team: index % 2 ? 'red' : 'blue' }));

const columns: ColumnDef<Person>[] = [
  {
    id: 'select',
    header: ({ table }) => <input type='checkbox' aria-label='all' onChange={table.getToggleAllRowsSelectedHandler()} />,
    cell: ({ row }) => <input type='checkbox' aria-label={`row-${row.original.id}`} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
    enableHiding: false
  },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'team', header: () => <span>Team</span> }
];

describe('DataTable (tanstack)', () => {
  test('renders rows, paginates and shows the selected-row summary', async () => {
    await render(<DataTable columns={columns} data={people} />);
    expect(document.querySelectorAll('tbody tr')).toHaveLength(10);
    const [previous, next] = Array.from(document.querySelectorAll<HTMLButtonElement>('button'));
    expect(previous.disabled).toBe(true);
    await click(next);
    expect(document.querySelector('tbody tr td:nth-child(2)')!.textContent).toBe('Person 11');
    await click(previous);
    expect(document.querySelector('tbody tr td:nth-child(2)')!.textContent).toBe('Person 1');
    expect(document.body.textContent).not.toContain('row(s) selected');
    await click(document.querySelector('input[aria-label=row-2]')!);
    expect(document.body.textContent).toContain('1 of 25 row(s) selected.');
    expect(document.querySelectorAll('tbody tr')[1].getAttribute('data-state')).toBe('selected');
    expect(document.querySelectorAll('tbody tr')[0].getAttribute('data-state')).toBe('false');
  });

  test('filters by the search key and shows an empty state', async () => {
    await render(<DataTable columns={columns} data={people} searchKey='name' />);
    const search = document.querySelector<HTMLInputElement>('input[placeholder="Search name..."]')!;
    await type(search, 'Person 2');
    expect(search.value).toBe('Person 2');
    expect(document.querySelectorAll('tbody tr')).toHaveLength(7);
    await type(search, 'nobody');
    expect(document.querySelector('tbody')!.textContent).toBe('No results.');
  });

  test('renders placeholder headers for grouped columns', async () => {
    const grouped: ColumnDef<Person>[] = [
      { header: 'Group', columns: [{ accessorKey: 'name', header: 'Name' }] },
      { accessorKey: 'team', header: 'Team' }
    ];
    await render(<DataTable columns={grouped} data={people.slice(0, 2)} />);
    const headerRows = document.querySelectorAll('thead tr');
    expect(headerRows).toHaveLength(2);
    expect(headerRows[0].textContent).toContain('Group');
    expect(headerRows[1].textContent).toContain('Name');
  });
});

function Harness({ children, data = people }: { children: (table: ReturnType<typeof useReactTable<Person>>) => React.ReactNode; data?: Person[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } }
  });
  return <>{children(table)}</>;
}

describe('DataTablePagination', () => {
  test('navigates pages, resizes pages and reports selection', async () => {
    await render(<Harness>{table => <><DataTablePagination table={table} pageSizeOptions={[10, 20]} className='x' /><p id='info'>{table.getState().pagination.pageIndex}:{table.getState().pagination.pageSize}</p></>}</Harness>);
    const info = () => document.getElementById('info')!.textContent;
    const nav = () => Array.from(document.querySelectorAll<HTMLButtonElement>('button:not([role=combobox])'));
    expect(document.body.textContent).toContain('Page 1 of 3');
    expect(nav()[0].disabled).toBe(true);
    await click(nav()[2]);
    expect(info()).toBe('1:10');
    await click(nav()[3]);
    expect(info()).toBe('2:10');
    expect(nav()[2].disabled).toBe(true);
    await click(nav()[0]);
    expect(info()).toBe('0:10');
    await click(nav()[3]);
    await click(nav()[1]);
    expect(info()).toBe('1:10');
    await pickSelectOption(document.querySelector('button[role=combobox]')!, '20');
    expect(info()).toMatch(/:20$/);
  });

  test('summarises selected rows', async () => {
    function WithSelection() {
      const table = useReactTable({ data: people, columns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { rowSelection: { 0: true } } });
      return <DataTablePagination table={table} />;
    }
    await render(<WithSelection />);
    expect(document.body.textContent).toContain('1 of 25 row(s) selected.');
  });
});

describe('DataTableSelectFilter', () => {
  test('renders nothing for an unknown column', async () => {
    const view = await render(<Harness>{table => <DataTableSelectFilter table={table} columnId='missing' options={[]} />}</Harness>);
    expect(view.container.querySelector('button')).toBeNull();
  });

  test('sets and clears the column filter through the select', async () => {
    await render(
      <Harness>
        {table => (
          <>
            <DataTableSelectFilter table={table} columnId='team' options={[{ label: 'Red', value: 'red' }]} placeholder='Any team' className='f' />
            <p id='filter'>{String(table.getColumn('team')!.getFilterValue())}</p>
          </>
        )}
      </Harness>
    );
    await pickSelectOption(document.querySelector('button[role=combobox]')!, 'Red');
    expect(document.getElementById('filter')!.textContent).toBe('red');
    await pickSelectOption(document.querySelector('button[role=combobox]')!, 'Any team');
    expect(document.getElementById('filter')!.textContent).toBe('undefined');
  });
});

describe('DataTableToolbar', () => {
  test('searches a column, shows reset only when filtered and renders extras', async () => {
    await render(
      <Harness>
        {table => <DataTableToolbar table={table} searchColumn='name' searchPlaceholder='Find' filterRenderers={<i id='filters' />} actions={<b id='actions' />} className='tb' />}
      </Harness>
    );
    expect(Array.from(document.querySelectorAll('button')).some(button => button.textContent === 'Reset')).toBe(false);
    await type(document.querySelector('input[placeholder=Find]')!, 'x');
    expect(document.querySelector<HTMLInputElement>('input[placeholder=Find]')!.value).toBe('x');
    const reset = Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Reset')!;
    await click(reset);
    expect(document.querySelector<HTMLInputElement>('input[placeholder=Find]')!.value).toBe('');
    expect(document.getElementById('filters')).not.toBeNull();
    expect(document.getElementById('actions')).not.toBeNull();
  });

  test('works without a search column and with a global filter', async () => {
    function Global() {
      const table = useReactTable({ data: people, columns, getCoreRowModel: getCoreRowModel(), initialState: { globalFilter: 'abc' } });
      return <DataTableToolbar table={table} />;
    }
    await render(<Global />);
    expect(document.querySelector('input')).toBeNull();
    expect(Array.from(document.querySelectorAll('button')).some(button => button.textContent === 'Reset')).toBe(true);
  });
});

describe('DataTableColumnToggle', () => {
  test('lists hideable columns and toggles their visibility', async () => {
    await render(<Harness>{table => <><DataTableColumnToggle table={table} label='Cols' className='t' /><p id='hidden'>{table.getColumn('name')!.getIsVisible() ? 'shown' : 'hidden'}</p></>}</Harness>);
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Cols')!);
    await vi_waitFor(() => document.querySelector('[role=dialog]') !== null);
    const labels = Array.from(document.querySelectorAll('[role=dialog] label')).map(label => label.textContent);
    expect(labels).toEqual(['Name', 'team']);
    await click(document.querySelector<HTMLInputElement>('[role=dialog] label input')!);
    expect(document.getElementById('hidden')!.textContent).toBe('hidden');
  });
});

async function vi_waitFor(check: () => boolean) {
  const { vi } = await import('vitest');
  await vi.waitFor(() => expect(check()).toBe(true));
}
