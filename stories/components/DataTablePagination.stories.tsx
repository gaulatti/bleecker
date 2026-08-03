import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { ColumnDef, useReactTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/react-table';

import { DataTablePagination } from '../../src/components/data-table-pagination';

const meta = {
  component: DataTablePagination,
  title: 'Components/DataTablePagination',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DataTablePagination>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Row {
  name: string;
}

const data: Row[] = Array.from({ length: 45 }, (_, i) => ({ name: `Item ${i + 1}` }));

const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }];

function PaginationDemo({ pageSize = 10 }: { pageSize?: number }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize, pageIndex: 0 } }
  });

  return <DataTablePagination table={table} />;
}

export const Default: Story = {
  render: () => <PaginationDemo />
};

export const LargePageSize: Story = {
  render: () => <PaginationDemo pageSize={25} />
};
