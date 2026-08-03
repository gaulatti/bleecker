import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';

import { cn } from '../utils/cn';
import { Button } from './button';
import { Checkbox } from './checkbox';

export interface DataTableColumnToggleProps<TData> {
  table: Table<TData>;
  className?: string;
  label?: string;
}

export function DataTableColumnToggle<TData>({ table, className, label = 'Columns' }: DataTableColumnToggleProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Button variant='secondary' size='sm' onClick={() => setOpen((prev) => !prev)}>
        <Settings2 size={14} />
        {label}
      </Button>

      {open && (
        <div className='absolute right-0 top-full z-50 mt-2 w-48 rounded-[var(--radius-card)] border border-border bg-card p-2 shadow-lg'>
          <p className='px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary'>Toggle columns</p>
          <div className='max-h-60 overflow-y-auto'>
            {table
              .getAllColumns()
              .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
              .map((column) => {
                return (
                  <label
                    key={column.id}
                    className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/15'
                  >
                    <Checkbox
                      checked={column.getIsVisible()}
                      onChange={(event) => column.toggleVisibility(event.target.checked)}
                    />
                    <span className='truncate'>{typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}</span>
                  </label>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
