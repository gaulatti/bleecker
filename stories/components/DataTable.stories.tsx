import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { DataTable } from '../../src/components/data-table';
import { Button } from '../../src/components/button';
import { Checkbox } from '../../src/components/checkbox';
import { ArrowUpDown } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

const columns: ColumnDef<Payment>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />,
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className='p-0 hover:bg-transparent h-auto font-medium'>
          Email
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('status')}</div>
  },
  {
    accessorKey: 'amount',
    header: () => <div className='text-right'>Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);

      return <div className='text-right font-medium'>{formatted}</div>;
    }
  }
];

const data: Payment[] = [
  { id: 'm5gr84i9', amount: 316, status: 'success', email: 'ken99@yahoo.com' },
  { id: '3u1reuv4', amount: 242, status: 'success', email: 'Abe45@gmail.com' },
  { id: 'derv1ws0', amount: 837, status: 'processing', email: 'Monserrat44@gmail.com' },
  { id: '5kma53ae', amount: 874, status: 'success', email: 'Silas22@gmail.com' },
  { id: 'bhqecj4p', amount: 721, status: 'failed', email: 'carmella@hotmail.com' },
  { id: 'qwe123rx', amount: 500, status: 'pending', email: 'foo@bar.com' },
  { id: 'asd456ty', amount: 124, status: 'processing', email: 'baz@qux.com' },
  { id: 'zxc789ui', amount: 999, status: 'success', email: 'omega@alpha.com' }
];

export const Default: Story = {
  args: {
    columns,
    data: data.slice(0, 3) // Show a smaller set without pagination focus
  }
};

export const WithInteractiveFeatures: Story = {
  args: {
    columns,
    data,
    searchKey: 'email'
  }
};
