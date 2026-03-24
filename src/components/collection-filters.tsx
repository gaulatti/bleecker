import { ArrowUpDown, Filter, X } from 'lucide-react';
import React from 'react';

import { Select } from './select';
import type { SortState } from './table';
import { cn } from '../utils/cn';

export interface CollectionFilterOption {
  field: string;
  label: string;
  options?: Array<{ label: string; value: string }>;
  type: 'select' | 'boolean' | 'date';
}

export interface CollectionSortOption {
  field: string;
  label: string;
}

export interface CollectionFiltersProps {
  className?: string;
  currentFilters: Record<string, boolean | string>;
  currentSort: SortState;
  filterOptions: CollectionFilterOption[];
  onFilterChange: (filters: Record<string, boolean | string>) => void;
  onSortChange: (sort: SortState) => void;
  sortOptions: CollectionSortOption[];
}

export function CollectionFilters({
  className,
  currentFilters,
  currentSort,
  filterOptions,
  onFilterChange,
  onSortChange,
  sortOptions
}: CollectionFiltersProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const activeFilterCount = Object.keys(currentFilters).length;

  const handleFilterChange = (field: string, value: boolean | string | null | undefined) => {
    const nextFilters = { ...currentFilters };

    if (value === '' || value === null || value === undefined) {
      delete nextFilters[field];
    } else {
      nextFilters[field] = value;
    }

    onFilterChange(nextFilters);
  };

  return (
    <div className={cn('mb-6 space-y-4', className)}>
      <div className='flex flex-wrap items-center gap-3'>
        <button
          type='button'
          onClick={() => setShowFilters((open) => !open)}
          className='inline-flex items-center gap-2 rounded-lg border border-sand/30 bg-white px-4 py-2 text-text-primary transition-colors hover:bg-sand/5 dark:border-sand/50 dark:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/20'
        >
          <Filter size={18} />
          Filters
          {activeFilterCount > 0 ? (
            <span className='ml-1 rounded-full bg-sea px-2 py-0.5 text-xs text-white dark:bg-accent-blue'>{activeFilterCount}</span>
          ) : null}
        </button>

        <div className='flex items-center gap-2'>
          <Select
            value={currentSort.field}
            onChange={(value) => onSortChange({ field: value, order: currentSort.order })}
            options={sortOptions.map((option) => ({ label: option.label, value: option.field }))}
          />
          <button
            type='button'
            onClick={() => onSortChange({ field: currentSort.field, order: currentSort.order === 'asc' ? 'desc' : 'asc' })}
            className='rounded-lg border border-sand/30 bg-white p-2 text-text-primary transition-colors hover:bg-sand/5 dark:border-sand/50 dark:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/20'
            title={`Sort ${currentSort.order === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            <ArrowUpDown size={18} className={currentSort.order === 'desc' ? 'rotate-180' : ''} />
          </button>
        </div>

        {activeFilterCount > 0 ? (
          <button
            type='button'
            onClick={() => onFilterChange({})}
            className='inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-terracotta transition-colors hover:bg-sand/5 dark:hover:bg-sand/10'
          >
            <X size={16} />
            Clear all
          </button>
        ) : null}
      </div>

      {showFilters ? (
        <div className='rounded-lg border border-sand/30 bg-white p-4 dark:border-sand/50 dark:bg-sand/10'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filterOptions.map((option) => (
              <div key={option.field} className='space-y-2'>
                <label className='block text-sm font-medium text-text-primary dark:text-text-primary'>{option.label}</label>

                {option.type === 'select' && option.options ? (
                  <Select
                    value={(currentFilters[option.field] as string) || ''}
                    onChange={(value) => handleFilterChange(option.field, value)}
                    options={[{ label: 'All', value: '' }, ...option.options]}
                  />
                ) : null}

                {option.type === 'boolean' ? (
                  <Select
                    value={currentFilters[option.field] === undefined ? '' : String(currentFilters[option.field])}
                    onChange={(value) => handleFilterChange(option.field, value === '' ? null : value === 'true')}
                    options={[
                      { label: 'All', value: '' },
                      { label: 'Yes', value: 'true' },
                      { label: 'No', value: 'false' }
                    ]}
                  />
                ) : null}

                {option.type === 'date' ? (
                  <input
                    type='date'
                    value={(currentFilters[option.field] as string) || ''}
                    onChange={(event) => handleFilterChange(option.field, event.target.value)}
                    className='w-full rounded-lg border border-sand/30 bg-white px-3 py-2 text-text-primary outline-none focus:ring-2 focus:ring-sea dark:border-sand/50 dark:bg-sand/5 dark:text-text-primary dark:focus:ring-accent-blue'
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
