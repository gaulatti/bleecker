import React, { act } from 'react';
import { describe, expect, test, vi } from 'vitest';

import {
  DataTable,
  SortableTableHeader,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type ColumnDef,
  type SortState
} from '../../src/components/table';
import { click, eventually, render } from './helpers';

const hover = (element: Element) => act(async () => { element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); });
const wait = (ms: number) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });

describe('table primitives', () => {
  test('forward refs and class names to the right elements', async () => {
    const refs: Record<string, unknown> = {};
    await render(
      <Table ref={node => { refs.table = node; }} containerClassName='wrap' className='tbl'>
        <TableCaption ref={node => { refs.caption = node; }}>Cap</TableCaption>
        <TableHeader ref={node => { refs.thead = node; }}>
          <TableRow><TableHead ref={node => { refs.th = node; }}>H</TableHead></TableRow>
        </TableHeader>
        <TableBody ref={node => { refs.tbody = node; }}>
          <TableRow><TableCell ref={node => { refs.td = node; }}>C</TableCell></TableRow>
        </TableBody>
        <TableFooter ref={node => { refs.tfoot = node; }}><TableRow><TableCell>F</TableCell></TableRow></TableFooter>
      </Table>
    );
    expect(Object.fromEntries(Object.entries(refs).map(([key, node]) => [key, (node as HTMLElement).tagName]))).toEqual({
      table: 'TABLE', caption: 'CAPTION', thead: 'THEAD', th: 'TH', tbody: 'TBODY', td: 'TD', tfoot: 'TFOOT'
    });
    expect(document.querySelector('.wrap')).not.toBeNull();
  });

  test('TableRow forwards callback and object refs and handles hover transitions', async () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();
    const objectRef = React.createRef<HTMLTableRowElement>();
    await render(
      <table>
        <tbody>
          <TableRow ref={objectRef} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}><TableCell>a</TableCell></TableRow>
          <TableRow><TableCell>b</TableCell></TableRow>
          <TableRow ref={vi.fn()}><TableCell>c</TableCell></TableRow>
        </tbody>
      </table>
    );
    const rows = Array.from(document.querySelectorAll('tr'));
    expect(objectRef.current).toBe(rows[0]);
    await hover(rows[0]);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
    await hover(rows[0]);
    expect(rows[0].style.transition).toBe('');
    await hover(rows[1]);
    expect(rows[1].style.transition).toBe('none');
    await eventually(() => expect(rows[1].style.transition).toBe(''));
    await act(async () => { rows[1].dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })); });
    expect(onMouseLeave).not.toHaveBeenCalled();
    await act(async () => { rows[0].dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })); });
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });
});

describe('SortableTableHeader', () => {
  const header = (props: Partial<React.ComponentProps<typeof SortableTableHeader>>) => (
    <table><thead><tr><SortableTableHeader field='name' label='Name' currentSort={{ field: '', order: 'asc' }} onSort={() => undefined} {...props} /></tr></thead></table>
  );

  test('non-sortable headers are plain cells with alignment', async () => {
    await render(header({ sortable: false, align: 'right' }));
    expect(document.querySelector('button')).toBeNull();
    expect(document.querySelector('th')!.className).toContain('text-right');
    await render(header({ sortable: false }));
    expect(document.querySelectorAll('th')[1].className).toContain('text-left');
  });

  test('clicking requests asc first, then toggles to desc only for the active ascending column', async () => {
    const onSort = vi.fn();
    const view = await render(header({ onSort, align: 'right' }));
    expect(document.querySelector('th')!.className).toContain('text-right');
    await click(document.querySelector('button')!);
    expect(onSort).toHaveBeenLastCalledWith('name', 'asc');
    await view.rerender(header({ onSort, currentSort: { field: 'name', order: 'asc' } }));
    await click(document.querySelector('button')!);
    expect(onSort).toHaveBeenLastCalledWith('name', 'desc');
    await view.rerender(header({ onSort, currentSort: { field: 'name', order: 'desc' } }));
    await click(document.querySelector('button')!);
    expect(onSort).toHaveBeenLastCalledWith('name', 'asc');
  });
});

interface Row { id: string; name: string; qty: number | null; note?: string }
const rows: Row[] = [
  { id: 'r1', name: 'banana', qty: 3, note: 'n' },
  { id: 'r2', name: 'apple', qty: 10 },
  { id: 'r3', name: 'cherry', qty: 1 }
];
const columns: ColumnDef<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'qty', header: 'Qty', align: 'right', className: 'q', headerClassName: 'hq' },
  { key: 'note', header: 'Note', align: 'center', sortable: false },
  { key: 'custom', header: 'Custom', cell: (row, index) => `${index}:${row.id}`, sortFn: (a, b) => b.name.localeCompare(a.name) }
];
const getRowKey = (row: Row) => row.id;
const bodyNames = () => Array.from(document.querySelectorAll('tbody tr')).map(row => row.querySelector('td')!.textContent);

describe('DataTable', () => {
  test('renders cells, default and custom cell renderers, caption and footer', async () => {
    await render(<DataTable data={rows} columns={columns} getRowKey={getRowKey} caption='Fruit' footer={data => <tr><td>{data.length} items</td></tr>} className='t' containerClassName='c' />);
    expect(document.querySelector('caption')!.textContent).toBe('Fruit');
    expect(bodyNames()).toEqual(['banana', 'apple', 'cherry']);
    expect(document.querySelector('tbody tr')!.textContent).toBe('banana3n0:r1');
    expect(document.querySelector('tfoot')!.textContent).toBe('3 items');
    expect(document.querySelector('td.q')!.className).toContain('text-right');
    expect(document.querySelectorAll('td')[2].className).toContain('text-center');
  });

  test('sorts internally with default, numeric, null-safe and custom comparisons', async () => {
    const sortChanges: SortState[] = [];
    await render(<DataTable data={[...rows, { id: 'r4', name: 'durian', qty: null }]} columns={columns} getRowKey={getRowKey} onSortChange={s => sortChanges.push(s)} />);
    const headerButton = (label: string) => Array.from(document.querySelectorAll('thead button')).find(button => button.textContent === label)!;
    await click(headerButton('Name'));
    expect(bodyNames()).toEqual(['apple', 'banana', 'cherry', 'durian']);
    await click(headerButton('Name'));
    expect(bodyNames()).toEqual(['durian', 'cherry', 'banana', 'apple']);
    await click(headerButton('Qty'));
    expect(bodyNames()).toEqual(['durian', 'cherry', 'banana', 'apple']);
    await click(headerButton('Custom'));
    expect(bodyNames()).toEqual(['apple', 'banana', 'cherry', 'durian'].reverse());
    expect(sortChanges.at(-1)).toEqual({ field: 'custom', order: 'asc' });
  });

  test('a controlled sort wins over internal state and unknown sort fields use default comparison', async () => {
    const onSortChange = vi.fn();
    const view = await render(<DataTable data={rows} columns={columns} getRowKey={getRowKey} sort={{ field: 'qty', order: 'desc' }} onSortChange={onSortChange} />);
    expect(bodyNames()).toEqual(['apple', 'banana', 'cherry']);
    await click(document.querySelector('thead button')!);
    expect(onSortChange).toHaveBeenCalledWith({ field: 'name', order: 'asc' });
    expect(bodyNames()).toEqual(['apple', 'banana', 'cherry']);
    await view.rerender(<DataTable data={rows} columns={columns} getRowKey={getRowKey} sort={{ field: 'missing', order: 'asc' }} />);
    expect(bodyNames()).toEqual(['banana', 'apple', 'cherry']);
  });

  test('shows the empty message with the right colspan', async () => {
    await render(<DataTable data={[]} columns={columns} getRowKey={getRowKey} selectable emptyMessage='Nothing' />);
    const cell = document.querySelector('tbody td')!;
    expect(cell.textContent).toBe('Nothing');
    expect(cell.getAttribute('colspan')).toBe('5');
    await render(<DataTable data={[]} columns={columns} getRowKey={getRowKey} />);
    const cells = document.querySelectorAll('tbody td');
    expect(cells[1].textContent).toBe('No results.');
    expect(cells[1].getAttribute('colspan')).toBe('4');
  });

  test('selection: internal state, select all, indeterminate, and clear', async () => {
    const onSelectionChange = vi.fn();
    await render(<DataTable data={rows} columns={columns} getRowKey={getRowKey} selectable onSelectionChange={onSelectionChange} />);
    const all = () => document.querySelector<HTMLInputElement>('input[aria-label="Select all"]')!;
    const row = (key: string) => document.querySelector<HTMLInputElement>(`input[aria-label="Select row ${key}"]`)!;
    await click(row('r1'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['r1']));
    expect(all().indeterminate).toBe(true);
    expect(document.querySelector('tbody tr')!.getAttribute('data-selected')).toBe('true');
    await click(all());
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['r1', 'r2', 'r3']));
    expect(all().checked).toBe(true);
    expect(all().indeterminate).toBe(false);
    await click(row('r2'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['r1', 'r3']));
    await click(row('r2'));
    await click(all());
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set());
    expect(all().checked).toBe(false);
  });

  test('controlled selection is displayed as given', async () => {
    await render(<DataTable data={rows} columns={columns} getRowKey={getRowKey} selectable selectedKeys={new Set(['r2'])} />);
    expect(document.querySelector<HTMLInputElement>('input[aria-label="Select row r2"]')!.checked).toBe(true);
    expect(document.querySelector<HTMLInputElement>('input[aria-label="Select row r1"]')!.checked).toBe(false);
  });

  test('without selection there are no checkboxes, and an empty table is never fully selected', async () => {
    await render(<DataTable data={rows} columns={columns} getRowKey={getRowKey} />);
    expect(document.querySelector('input[type=checkbox]')).toBeNull();
    await render(<DataTable data={[]} columns={columns} getRowKey={getRowKey} selectable />);
    expect(document.querySelectorAll<HTMLInputElement>('input[aria-label="Select all"]')[0].checked).toBe(false);
  });
});
