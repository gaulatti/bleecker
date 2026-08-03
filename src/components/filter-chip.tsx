import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '../utils/cn';

export interface FilterChipProps {
  label: string;
  value?: string;
  onRemove?: () => void;
  className?: string;
}

export function FilterChip({ label, value, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-text-primary dark:text-text-primary',
        className
      )}
    >
      <span className='text-text-secondary dark:text-text-secondary'>{label}</span>
      {value && <span className='font-semibold'>{value}</span>}
      {onRemove && (
        <button
          type='button'
          onClick={onRemove}
          className='rounded-full p-0.5 text-text-secondary transition-colors hover:bg-sand/20 hover:text-text-primary dark:hover:bg-sand/20'
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}

export interface FilterGroupProps {
  filters: FilterChipProps[];
  className?: string;
  onClearAll?: () => void;
}

export function FilterGroup({ filters, className, onClearAll }: FilterGroupProps) {
  if (filters.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((filter, index) => (
        <FilterChip key={`${filter.label}-${index}`} {...filter} />
      ))}
      {onClearAll && (
        <button
          type='button'
          onClick={onClearAll}
          className='text-xs font-medium text-sea hover:underline dark:text-accent-blue'
        >
          Clear all
        </button>
      )}
    </div>
  );
}
