import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';

export interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

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
