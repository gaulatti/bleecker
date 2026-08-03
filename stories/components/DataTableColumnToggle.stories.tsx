import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { ColumnDef, useReactTable, getCoreRowModel } from '@tanstack/react-table';

import { DataTableColumnToggle } from '../../src/components/data-table-column-toggle';

const meta = {
  component: DataTableColumnToggle,
  title: 'Components/DataTableColumnToggle',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DataTableColumnToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Row {
  name: string;
  role: string;
  status: string;
}

const data: Row[] = [
  { name: 'Alice', role: 'Admin', status: 'Active' },
  { name: 'Bob', role: 'Editor', status: 'Inactive' }
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' }
];

function ToggleDemo({ hideStatus = false }: { hideStatus?: boolean }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: { columnVisibility: hideStatus ? { status: false } : {} }
  });

  return <DataTableColumnToggle table={table} />;
}

export const Default: Story = {
  render: () => <ToggleDemo />
};

export const WithHiddenColumn: Story = {
  render: () => <ToggleDemo hideStatus />
};
