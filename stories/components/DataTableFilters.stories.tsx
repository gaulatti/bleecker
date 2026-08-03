import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel } from '@tanstack/react-table';

import { DataTableSelectFilter } from '../../src/components/data-table-filters';

const meta = {
  component: DataTableSelectFilter,
  title: 'Components/DataTableFilters',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DataTableSelectFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Row {
  name: string;
  role: string;
}

const data: Row[] = [
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob', role: 'Editor' },
  { name: 'Charlie', role: 'Viewer' }
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' }
];

function FilterDemo({ initialRole }: { initialRole?: string }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { columnFilters: initialRole ? [{ id: 'role', value: initialRole }] : [] }
  });

  return (
    <DataTableSelectFilter
      table={table}
      columnId='role'
      placeholder='All roles'
      options={[
        { label: 'Admin', value: 'Admin' },
        { label: 'Editor', value: 'Editor' },
        { label: 'Viewer', value: 'Viewer' }
      ]}
    />
  );
}

export const Default: Story = {
  render: () => <FilterDemo />
};

export const WithActiveFilter: Story = {
  render: () => <FilterDemo initialRole='Editor' />
};
