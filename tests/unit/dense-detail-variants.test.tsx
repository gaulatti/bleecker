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
