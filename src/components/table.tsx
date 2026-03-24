import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';

// ─── SortState ────────────────────────────────────────────────────────────────

export interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

// ─── SortableTableHeader ─────────────────────────────────────────────────────

export interface SortableTableHeaderProps {
  align?: 'left' | 'right';
  className?: string;
  currentSort: SortState;
  field: string;
  label: string;
  onSort: (field: string, order: 'asc' | 'desc') => void;
  sortable?: boolean;
}

export function SortableTableHeader({ align = 'left', className, currentSort, field, label, onSort, sortable = true }: SortableTableHeaderProps) {
  const isSorted = currentSort.field === field;

  if (!sortable) {
    return (
      <th
        className={cn(
          align === 'right' ? 'text-right' : 'text-left',
          'h-11 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-text-secondary',
          className
        )}
      >
        {label}
      </th>
    );
  }

  const SortIcon = isSorted ? (currentSort.order === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <th className={cn(align === 'right' ? 'text-right' : 'text-left', 'h-11 px-4', className)}>
      <button
        type='button'
        onClick={() => onSort(field, isSorted && currentSort.order === 'asc' ? 'desc' : 'asc')}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 focus:outline-none focus-visible:underline',
          isSorted ? 'text-sea dark:text-accent-blue' : 'text-text-secondary hover:text-text-primary dark:text-text-secondary dark:hover:text-text-primary'
        )}
      >
        {label}
        <SortIcon size={12} className={cn('flex-shrink-0 transition-opacity duration-150', isSorted ? 'opacity-100' : 'opacity-40')} />
      </button>
    </th>
  );
}

// ─── Table (root wrapper) ─────────────────────────────────────────────────────

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Wraps the table in a horizontally-scrollable container */
  containerClassName?: string;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table({ className, containerClassName, ...props }, ref) {
  return (
    <div className={cn('w-full overflow-x-auto', containerClassName)}>
      <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
});

// ─── TableHeader ──────────────────────────────────────────────────────────────

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableHeader(
  { className, ...props },
  ref
) {
  return (
    <thead
      ref={ref}
      className={cn('border-b border-sand/10 bg-sand/5 dark:border-sand/20 dark:bg-sand/10', '[&_tr]:hover:bg-transparent', className)}
      {...props}
    />
  );
});

// ─── TableBody ────────────────────────────────────────────────────────────────

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableBody(
  { className, ...props },
  ref
) {
  return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
});

// ─── TableFooter ──────────────────────────────────────────────────────────────

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(function TableFooter(
  { className, ...props },
  ref
) {
  return <tfoot ref={ref} className={cn('border-t border-sand/10 bg-sand/5 font-medium dark:border-sand/20 dark:bg-sand/10', className)} {...props} />;
});

// ─── TableRow ─────────────────────────────────────────────────────────────────

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(function TableRow({ className, ...props }, ref) {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b border-sand/10 transition-colors duration-150 data-[selected=true]:bg-sea/5 dark:border-sand/20 dark:data-[selected=true]:bg-accent-blue/10',
        'hover:bg-sand/5 dark:hover:bg-sand/10',
        className
      )}
      {...props}
    />
  );
});

// ─── TableHead (<th>) ─────────────────────────────────────────────────────────

export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(function TableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      className={cn(
        'h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-text-secondary',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
});

// ─── TableCell (<td>) ─────────────────────────────────────────────────────────

export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(function TableCell({ className, ...props }, ref) {
  return (
    <td
      ref={ref}
      className={cn(
        'px-4 py-3 align-middle text-sm text-text-primary dark:text-text-primary',
        '[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
      {...props}
    />
  );
});

// ─── TableCaption ─────────────────────────────────────────────────────────────

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(function TableCaption(
  { className, ...props },
  ref
) {
  return <caption ref={ref} className={cn('mt-4 text-sm text-text-secondary dark:text-text-secondary', className)} {...props} />;
});

// ─── DataTable ───────────────────────────────────────────────────────────────

export interface ColumnDef<TData> {
  /** Unique key matching a property of TData, or an arbitrary id for computed columns */
  key: string;
  header: string;
  /** Render the cell value. Defaults to `String(row[key])`. */
  cell?: (row: TData, index: number) => React.ReactNode;
  sortable?: boolean;
  /** Custom compare when sort is uncontrolled. Defaults to string/number comparison. */
  sortFn?: (a: TData, b: TData) => number;
  align?: 'left' | 'right' | 'center';
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<TData> {
  caption?: string;
  className?: string;
  columns: ColumnDef<TData>[];
  containerClassName?: string;
  data: TData[];
  emptyMessage?: string;
  /** Required so selection and keying work correctly */
  getRowKey: (row: TData, index: number) => string;
  /** Footer row — receives the current (sorted) data */
  footer?: (data: TData[]) => React.ReactNode;
  /** Controlled sort. If omitted, sort is managed internally. */
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /** Enable checkbox selection */
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
}

function defaultCompare<TData>(key: string, a: TData, b: TData): number {
  const av = (a as Record<string, unknown>)[key];
  const bv = (b as Record<string, unknown>)[key];
  if (typeof av === 'number' && typeof bv === 'number') return av - bv;
  return String(av ?? '').localeCompare(String(bv ?? ''));
}

export function DataTable<TData>({
  caption,
  className,
  columns,
  containerClassName,
  data,
  emptyMessage = 'No results.',
  getRowKey,
  footer,
  sort: controlledSort,
  onSortChange,
  selectable = false,
  selectedKeys: controlledSelected,
  onSelectionChange
}: DataTableProps<TData>) {
  const [internalSort, setInternalSort] = React.useState<SortState>({ field: '', order: 'asc' });
  const [internalSelected, setInternalSelected] = React.useState<Set<string>>(new Set());

  const sort = controlledSort ?? internalSort;
  const selectedKeys = controlledSelected ?? internalSelected;

  const setSort = (next: SortState) => {
    setInternalSort(next);
    onSortChange?.(next);
  };

  const setSelectedKeys = (next: Set<string>) => {
    setInternalSelected(next);
    onSelectionChange?.(next);
  };

  const handleSort = (field: string, order: 'asc' | 'desc') => setSort({ field, order });

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sort.field) return data;
    const col = columns.find((c) => c.key === sort.field);
    const compare = col?.sortFn ?? ((a: TData, b: TData) => defaultCompare(sort.field, a, b));
    return [...data].sort((a, b) => (sort.order === 'asc' ? compare(a, b) : -compare(a, b)));
  }, [data, sort, columns]);

  const rowKeys = sortedData.map(getRowKey);
  const allSelected = rowKeys.length > 0 && rowKeys.every((k) => selectedKeys.has(k));
  const someSelected = rowKeys.some((k) => selectedKeys.has(k)) && !allSelected;

  const toggleAll = (checked: boolean) => {
    setSelectedKeys(checked ? new Set(rowKeys) : new Set());
  };

  const toggleRow = (key: string, checked: boolean) => {
    const next = new Set(selectedKeys);
    checked ? next.add(key) : next.delete(key);
    setSelectedKeys(next);
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border border-sand/10 bg-white dark:border-sand/20 dark:bg-dark-sand', containerClassName)}>
      <Table className={className}>
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className='w-10'>
                <input
                  type='checkbox'
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => toggleAll(e.target.checked)}
                  className='h-4 w-4 rounded border-sand/30 accent-sea dark:accent-accent-blue'
                  aria-label='Select all'
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <SortableTableHeader
                key={col.key}
                field={col.key}
                label={col.header}
                currentSort={sort}
                onSort={handleSort}
                sortable={col.sortable !== false}
                align={col.align === 'right' ? 'right' : 'left'}
                className={col.headerClassName}
              />
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className='h-24 text-center text-text-secondary dark:text-text-secondary'>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row, i) => {
              const key = rowKeys[i];
              const isSelected = selectedKeys.has(key);
              return (
                <TableRow key={key} data-selected={isSelected}>
                  {selectable && (
                    <TableCell>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={(e) => toggleRow(key, e.target.checked)}
                        className='h-4 w-4 rounded border-sand/30 accent-sea dark:accent-accent-blue'
                        aria-label={`Select row ${key}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn(col.align === 'right' && 'text-right', col.align === 'center' && 'text-center', col.className)}>
                      {col.cell ? col.cell(row, i) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>

        {footer && <TableFooter>{footer(sortedData)}</TableFooter>}
      </Table>
    </div>
  );
}

// (SortState and SortableTableHeader are defined earlier in this file and exported directly)
