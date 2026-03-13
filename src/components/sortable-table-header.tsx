import { ArrowUpDown } from 'lucide-react';
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

export function SortableTableHeader({
  align = 'left',
  className,
  currentSort,
  field,
  label,
  onSort,
  sortable = true
}: SortableTableHeaderProps) {
  const isSorted = currentSort.field === field;

  if (!sortable) {
    return (
      <th className={cn(align === 'right' ? 'text-right' : 'text-left', 'px-6 py-4 text-sm font-semibold text-text-primary dark:text-text-primary', className)}>
        {label}
      </th>
    );
  }

  return (
    <th className={cn(align === 'right' ? 'text-right' : 'text-left', 'px-6 py-4', className)}>
      <button
        type='button'
        onClick={() => onSort(field, isSorted && currentSort.order === 'asc' ? 'desc' : 'asc')}
        className='flex items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-sea dark:text-text-primary dark:hover:text-accent-blue'
      >
        {label}
        {isSorted ? <ArrowUpDown size={14} className={currentSort.order === 'desc' ? 'rotate-180' : ''} /> : null}
      </button>
    </th>
  );
}
