import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  DataTable,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type ColumnDef
} from '../../src/components/table';
import { SortableTableHeader } from '../../src/components/table';
import { Button } from '../../src/components/button';

const meta = {
  component: DataTable,
  title: 'Components/Table',
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Shared data ──────────────────────────────────────────────────────────────

interface Invoice {
  invoice: string;
  status: 'Paid' | 'Pending' | 'Unpaid';
  method: string;
  amount: number;
}

const invoices: Invoice[] = [
  { invoice: 'INV-001', status: 'Paid', method: 'Credit Card', amount: 250 },
  { invoice: 'INV-002', status: 'Pending', method: 'PayPal', amount: 150 },
  { invoice: 'INV-003', status: 'Unpaid', method: 'Bank Transfer', amount: 350 },
  { invoice: 'INV-004', status: 'Paid', method: 'Credit Card', amount: 450 },
  { invoice: 'INV-005', status: 'Pending', method: 'PayPal', amount: 550 },
  { invoice: 'INV-006', status: 'Paid', method: 'Credit Card', amount: 200 }
];

const statusColors: Record<Invoice['status'], string> = {
  Paid: 'text-sea dark:text-accent-blue',
  Pending: 'text-sunset dark:text-accent-gold',
  Unpaid: 'text-terracotta'
};

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// ─── DataTable stories ────────────────────────────────────────────────────────

/** Minimal — pass columns + data, sorting works out of the box */
export const Default: Story = {
  render: () => {
    const columns: ColumnDef<Invoice>[] = [
      { key: 'invoice', header: 'Invoice', cell: (r) => <span className='font-medium'>{r.invoice}</span> },
      { key: 'status', header: 'Status', cell: (r) => <span className={statusColors[r.status]}>{r.status}</span> },
      { key: 'method', header: 'Method', cell: (r) => <span className='text-text-secondary dark:text-text-secondary'>{r.method}</span> },
      { key: 'amount', header: 'Amount', align: 'right', cell: (r) => fmt(r.amount) }
    ];
    return <DataTable data={invoices} columns={columns} getRowKey={(r) => r.invoice} />;
  }
};

/** Lift sort state to parent for URL persistence etc. */
export const ControlledSort: Story = {
  render: () => {
    const [sort, setSort] = React.useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'amount', order: 'desc' });
    const columns: ColumnDef<Invoice>[] = [
      { key: 'invoice', header: 'Invoice', cell: (r) => <span className='font-medium'>{r.invoice}</span> },
      { key: 'status', header: 'Status', cell: (r) => <span className={statusColors[r.status]}>{r.status}</span> },
      { key: 'method', header: 'Method' },
      { key: 'amount', header: 'Amount', align: 'right', cell: (r) => fmt(r.amount) }
    ];
    return (
      <div className='flex flex-col gap-2'>
        <DataTable data={invoices} columns={columns} getRowKey={(r) => r.invoice} sort={sort} onSortChange={setSort} />
        <p className='text-xs text-text-secondary dark:text-text-secondary'>
          Sorted by <strong>{sort.field || '—'}</strong> ({sort.order})
        </p>
      </div>
    );
  }
};

/** Built-in checkbox column with indeterminate header state */
export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const columns: ColumnDef<Invoice>[] = [
      { key: 'invoice', header: 'Invoice', cell: (r) => <span className='font-medium'>{r.invoice}</span> },
      { key: 'status', header: 'Status', cell: (r) => <span className={statusColors[r.status]}>{r.status}</span> },
      { key: 'method', header: 'Method' },
      { key: 'amount', header: 'Amount', align: 'right', cell: (r) => fmt(r.amount) }
    ];
    return (
      <div className='flex flex-col gap-3'>
        <DataTable data={invoices} columns={columns} getRowKey={(r) => r.invoice} selectable selectedKeys={selected} onSelectionChange={setSelected} />
        <div className='flex items-center justify-between text-xs text-text-secondary dark:text-text-secondary'>
          <span>
            {selected.size} of {invoices.length} rows selected
          </span>
          {selected.size > 0 && (
            <Button size='sm' variant='destructive' onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          )}
        </div>
      </div>
    );
  }
};

/** Footer row with a running total */
export const WithFooter: Story = {
  render: () => {
    const columns: ColumnDef<Invoice>[] = [
      { key: 'invoice', header: 'Invoice', cell: (r) => <span className='font-medium'>{r.invoice}</span> },
      { key: 'status', header: 'Status', cell: (r) => <span className={statusColors[r.status]}>{r.status}</span> },
      { key: 'method', header: 'Method' },
      { key: 'amount', header: 'Amount', align: 'right', cell: (r) => fmt(r.amount) }
    ];
    return (
      <DataTable
        data={invoices}
        columns={columns}
        getRowKey={(r) => r.invoice}
        footer={(rows) => (
          <TableRow>
            <TableCell colSpan={3} className='font-semibold text-text-primary dark:text-text-primary'>
              Total
            </TableCell>
            <TableCell className='text-right font-semibold text-text-primary dark:text-text-primary'>{fmt(rows.reduce((s, r) => s + r.amount, 0))}</TableCell>
          </TableRow>
        )}
      />
    );
  }
};

/** Zero-data renders the emptyMessage cell */
export const Empty: Story = {
  render: () => {
    const columns: ColumnDef<Invoice>[] = [
      { key: 'invoice', header: 'Invoice' },
      { key: 'status', header: 'Status' },
      { key: 'method', header: 'Method' },
      { key: 'amount', header: 'Amount', align: 'right' }
    ];
    return <DataTable data={[]} columns={columns} getRowKey={(r) => r.invoice} emptyMessage='No invoices found. Try adjusting your filters.' />;
  }
};

/** Sort + selection + footer + badge-style status chips */
export const KitchenSink: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const columns: ColumnDef<Invoice>[] = [
      { key: 'invoice', header: 'Invoice', cell: (r) => <span className='font-mono font-medium'>{r.invoice}</span> },
      {
        key: 'status',
        header: 'Status',
        sortable: false,
        cell: (r) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              r.status === 'Paid'
                ? 'bg-sea/10 text-sea dark:bg-accent-blue/15 dark:text-accent-blue'
                : r.status === 'Pending'
                  ? 'bg-sand/20 text-sunset dark:text-accent-gold'
                  : 'bg-terracotta/10 text-terracotta'
            }`}
          >
            {r.status}
          </span>
        )
      },
      { key: 'method', header: 'Method', cell: (r) => <span className='text-text-secondary dark:text-text-secondary'>{r.method}</span> },
      { key: 'amount', header: 'Amount', align: 'right', cell: (r) => <span className='font-mono'>{fmt(r.amount)}</span> }
    ];
    const selectedTotal = invoices.filter((r) => selected.has(r.invoice)).reduce((s, r) => s + r.amount, 0);
    return (
      <div className='flex flex-col gap-3'>
        <DataTable
          data={invoices}
          columns={columns}
          getRowKey={(r) => r.invoice}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
          footer={(rows) => (
            <TableRow>
              <TableCell />
              <TableCell colSpan={3} className='font-semibold text-text-primary dark:text-text-primary'>
                Total
              </TableCell>
              <TableCell className='text-right font-mono font-semibold text-text-primary dark:text-text-primary'>
                {fmt(rows.reduce((s, r) => s + r.amount, 0))}
              </TableCell>
            </TableRow>
          )}
        />
        {selected.size > 0 && (
          <p className='text-xs text-text-secondary dark:text-text-secondary'>
            {selected.size} row{selected.size > 1 ? 's' : ''} selected — subtotal{' '}
            <span className='font-semibold text-text-primary dark:text-text-primary'>{fmt(selectedTotal)}</span>
          </p>
        )}
      </div>
    );
  }
};

// ─── Raw primitives ───────────────────────────────────────────────────────────

/** Manual composition with low-level Table + SortableTableHeader primitives */
export const Primitives: Story = {
  render: () => {
    const [sort, setSort] = React.useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'invoice', order: 'asc' });
    return (
      <div className='overflow-hidden rounded-xl border border-sand/10 bg-white dark:border-sand/20 dark:bg-dark-sand'>
        <Table>
          <TableCaption>Composed manually with Table primitives.</TableCaption>
          <TableHeader>
            <TableRow>
              <SortableTableHeader label='Invoice' field='invoice' currentSort={sort} onSort={setSort} />
              <SortableTableHeader label='Status' field='status' currentSort={sort} onSort={setSort} />
              <SortableTableHeader label='Method' field='method' currentSort={sort} onSort={setSort} />
              <SortableTableHeader label='Amount' field='amount' currentSort={sort} onSort={setSort} align='right' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.invoice}>
                <TableCell className='font-medium'>{inv.invoice}</TableCell>
                <TableCell className={statusColors[inv.status]}>{inv.status}</TableCell>
                <TableCell className='text-text-secondary dark:text-text-secondary'>{inv.method}</TableCell>
                <TableCell className='text-right'>{fmt(inv.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className='text-right'>{fmt(invoices.reduce((s, r) => s + r.amount, 0))}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }
};
