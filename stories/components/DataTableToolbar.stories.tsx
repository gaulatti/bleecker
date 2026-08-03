import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel } from '@tanstack/react-table';

import { DataTableToolbar } from '../../src/components/data-table-toolbar';
import { Button } from '../../src/components/button';
import { Plus } from 'lucide-react';

const meta = {
  component: DataTableToolbar,
  title: 'Components/DataTableToolbar',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DataTableToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Row {
  name: string;
  role: string;
}

const data: Row[] = [
  { name: 'Alice', role: 'Admin' },
  { name: 'Bob', role: 'Editor' }
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' }
];

function ToolbarDemo({ showActions = true }: { showActions?: boolean }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <DataTableToolbar
      table={table}
      searchColumn='name'
      searchPlaceholder='Search by name...'
      actions={showActions ? (
        <Button size='sm'>
          <Plus size={14} /> Add
        </Button>
      ) : undefined}
    />
  );
}

export const Default: Story = {
  render: () => <ToolbarDemo />
};

export const SearchOnly: Story = {
  render: () => <ToolbarDemo showActions={false} />
};
