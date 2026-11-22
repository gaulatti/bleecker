import React from 'react';
import { describe, expect, test } from 'vitest';

import { Drawer } from '../../src/components/drawer';
import { DataTable, type ColumnDef } from '../../src/components/table';
import { render } from './helpers';

// gaulatti/bleecker#552 (bleecker#549 phase 1): Drawer variant="detail" and
// DataTable density="dense" are opt-in. These snapshots were recorded from the
// components before either variant existed, so a default render that changes by
// one byte fails here.

interface Song {
  id: string;
  title: string;
  length: number;
}
const songs: Song[] = [
  { id: 'a', title: 'Harbor Lights', length: 214 },
  { id: 'b', title: 'Copper Season', length: 241 }
];
const columns: ColumnDef<Song>[] = [
  { key: 'title', header: 'Name' },
  { key: 'length', header: 'Length', align: 'right', cell: (row) => `${Math.floor(row.length / 60)}:${String(row.length % 60).padStart(2, '0')}` },
  { key: 'state', header: 'State', sortable: false, align: 'center', cell: () => 'Measured' }
];

describe('default renders are unchanged', () => {
  test('DataTable with caption, selection and a footer', async () => {
    const view = await render(
      <DataTable
        caption='Songs'
        columns={columns}
        data={songs}
        getRowKey={(row) => row.id}
        selectable
        selectedKeys={new Set(['b'])}
        footer={(rows) => (
          <tr>
            <td>{rows.length} songs</td>
          </tr>
        )}
      />
    );
    expect(view.container.innerHTML).toMatchSnapshot();
  });

  test('DataTable with no rows', async () => {
    const view = await render(<DataTable columns={columns} data={[]} getRowKey={(row) => row.id} emptyMessage='Nothing here' />);
    expect(view.container.innerHTML).toMatchSnapshot();
  });

  test('Drawer, open, with a title and a description', async () => {
    const view = await render(
      <Drawer isOpen onClose={() => undefined} title='90s' description='Songs released 1990–1999' className='extra'>
        38 assets
      </Drawer>
    );
    const portal = Array.from(document.body.children).find((node) => node !== view.container && node.querySelector('[role="dialog"]'));
    expect(portal?.outerHTML).toMatchSnapshot();
  });
});

describe('DataTable density="dense"', () => {
  test('draws 40px rows with tabular numerics and tighter cells', async () => {
    const view = await render(<DataTable density='dense' columns={columns} data={songs} getRowKey={(row) => row.id} />);
    const table = view.container.querySelector('table')!;
    expect(table.className).toContain('tabular-nums');
    const rows = view.container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    for (const row of Array.from(rows)) expect(row.className).toContain('h-10');
    expect(view.container.querySelector('tbody td')!.className).toContain('py-0');
    expect(view.container.querySelector('thead')!.className).toContain('[&_th]:h-9');
    // A plain dense table is not clickable.
    expect(rows[0].getAttribute('tabindex')).toBeNull();
  });

  test('tints the selected row and calls onRowClick on a click, Enter or Space, but not from a checkbox', async () => {
    const clicked: string[] = [];
    const view = await render(
      <DataTable
        density='dense'
        columns={columns}
        data={songs}
        getRowKey={(row) => row.id}
        selectable
        selectedKey='b'
        onRowClick={(row, index) => clicked.push(`${row.id}:${index}`)}
      />
    );
    const rows = Array.from(view.container.querySelectorAll<HTMLTableRowElement>('tbody tr'));
    expect(rows.map((row) => row.dataset.selected)).toEqual(['false', 'true']);
    expect(rows.map((row) => row.getAttribute('aria-selected'))).toEqual(['false', 'true']);
    expect(rows[0].tabIndex).toBe(0);
    expect(rows[0].className).toContain('cursor-pointer');
    const { act } = await import('react');
    await act(async () => rows[0].click());
    await act(async () => {
      rows[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      rows[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      rows[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    });
    // A key pressed inside the row (on its checkbox) is the checkbox's.
    const checkbox = rows[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    await act(async () => {
      checkbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      checkbox.click();
    });
    expect(clicked).toEqual(['a:0', 'b:1', 'b:1']);
  });

  test('selectedKey only tints a row and never checks or locks its selection checkbox', async () => {
    const changes: string[][] = [];
    const view = await render(
      <DataTable
        columns={columns}
        data={songs}
        getRowKey={(row) => row.id}
        selectable
        selectedKey='b'
        onSelectionChange={(keys) => changes.push([...keys])}
      />
    );
    const rows = Array.from(view.container.querySelectorAll<HTMLTableRowElement>('tbody tr'));
    expect(rows.map((row) => row.dataset.selected)).toEqual(['false', 'true']);
    const boxes = rows.map((row) => row.querySelector<HTMLInputElement>('input[type="checkbox"]')!);
    expect(boxes.map((box) => box.checked)).toEqual([false, false]);
    const all = view.container.querySelector<HTMLInputElement>('thead input[type="checkbox"]')!;
    expect(all.checked).toBe(false);
    expect(all.indeterminate).toBe(false);
    const { act } = await import('react');
    await act(async () => boxes[1].click());
    expect(changes).toEqual([['b']]);
    expect(boxes[1].checked).toBe(true);
    await act(async () => boxes[1].click());
    expect(changes).toEqual([['b'], []]);
    expect(boxes[1].checked).toBe(false);
    // The tint stays on the highlighted row either way.
    expect(rows[1].dataset.selected).toBe('true');
  });

  test('clickable rows with no selected key carry no aria-selected', async () => {
    const clicked: string[] = [];
    const view = await render(
      <DataTable columns={columns} data={songs} getRowKey={(row) => row.id} onRowClick={(row) => clicked.push(row.id)} />
    );
    const rows = Array.from(view.container.querySelectorAll<HTMLTableRowElement>('tbody tr'));
    expect(rows.map((row) => row.hasAttribute('aria-selected'))).toEqual([false, false]);
    expect(rows.map((row) => row.dataset.selected)).toEqual(['false', 'false']);
    const { act } = await import('react');
    await act(async () => rows[1].click());
    expect(clicked).toEqual(['b']);
  });

  test('a selected key works without onRowClick, at the default density', async () => {
    const view = await render(<DataTable columns={columns} data={songs} getRowKey={(row) => row.id} selectedKey='a' />);
    const rows = Array.from(view.container.querySelectorAll<HTMLTableRowElement>('tbody tr'));
    expect(rows.map((row) => row.dataset.selected)).toEqual(['true', 'false']);
    expect(rows[0].getAttribute('aria-selected')).toBeNull();
    expect(rows[0].className).not.toContain('h-10');
  });

  test('a sticky header scrolls the rows in the bounded container', async () => {
    const view = await render(
      <DataTable stickyHeader containerClassName='max-h-40' columns={columns} data={songs} getRowKey={(row) => row.id} />
    );
    const outer = view.container.firstElementChild as HTMLElement;
    expect(outer.className).toContain('overflow-auto');
    expect(outer.className).toContain('max-h-40');
    expect(outer.className).not.toContain('overflow-hidden');
    expect(view.container.querySelector('table')!.parentElement!.className).toContain('overflow-visible');
    expect(view.container.querySelector('thead')!.className).toContain('sticky');
  });
});

describe('Drawer variant="detail"', () => {
  test('docks in place with no overlay or modal layer, at 22rem, and leaves focus in the list', async () => {
    const list = document.createElement('button');
    list.textContent = 'Row';
    document.body.append(list);
    list.focus();
    const closed: string[] = [];
    const view = await render(
      <div>
        <Drawer variant='detail' open onClose={() => closed.push('x')} title='90s' description='Songs released 1990–1999'>
          38 assets
        </Drawer>
      </div>
    );
    const panel = view.container.querySelector<HTMLElement>('aside[data-bleecker-drawer="detail"]')!;
    expect(panel).not.toBeNull();
    expect(panel.style.width).toBe('22rem');
    expect(document.querySelector('[data-bleecker-modal-overlay]')).toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(list);
    const heading = panel.querySelector('h2')!;
    expect(panel.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(panel.getAttribute('aria-describedby')).toBe(panel.querySelector('p')!.id);
    expect(panel.textContent).toContain('38 assets');
    const { act } = await import('react');
    await act(async () => panel.querySelector<HTMLButtonElement>('button[aria-label="Close details"]')!.click());
    expect(closed).toEqual(['x']);
    list.remove();
  });

  test('takes a width, accepts isOpen, names itself without a title, and renders nothing when closed', async () => {
    const view = await render(
      <Drawer variant='detail' isOpen width='18rem' className='extra' onClose={() => undefined}>
        body
      </Drawer>
    );
    const panel = view.container.querySelector<HTMLElement>('aside')!;
    expect(panel.style.width).toBe('18rem');
    expect(panel.className).toContain('extra');
    expect(panel.getAttribute('aria-label')).toBe('Details');
    expect(panel.querySelector('h2')).toBeNull();
    await view.rerender(
      <Drawer variant='detail' open={false} isOpen onClose={() => undefined}>
        body
      </Drawer>
    );
    expect(view.container.querySelector('aside')).toBeNull();
    await view.rerender(
      <Drawer variant='detail' onClose={() => undefined}>
        body
      </Drawer>
    );
    expect(view.container.querySelector('aside')).toBeNull();
  });
});
