import * as React from 'react';

import { cn } from '../utils/cn';

export interface DataListItem {
  id: string;
  label: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
}

export interface DataListProps {
  items: DataListItem[];
  className?: string;
  striped?: boolean;
}

export function DataList({ items, className, striped = false }: DataListProps) {
  return (
    <dl className={cn('divide-y divide-border', className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4',
            striped && index % 2 === 0 && 'bg-muted/30 px-3'
          )}
        >
          <dt className='text-sm font-medium text-text-secondary dark:text-text-secondary'>{item.label}</dt>
          <dd className='text-right text-sm font-semibold text-text-primary dark:text-text-primary sm:text-right'>
            {item.value}
            {item.description && (
              <p className='mt-0.5 text-xs font-normal text-text-secondary dark:text-text-secondary'>{item.description}</p>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
