import * as React from 'react';

import { cn } from '../utils/cn';

export type TimelineStatus = 'completed' | 'active' | 'pending' | 'error';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: TimelineStatus;
  icon?: React.ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusClasses: Record<TimelineStatus, string> = {
  completed: 'bg-sea text-white ring-sea dark:bg-accent-blue dark:ring-accent-blue',
  active: 'bg-desert text-white ring-desert dark:bg-accent-gold dark:ring-accent-gold',
  pending: 'bg-sand/20 text-text-secondary ring-sand/40 dark:bg-sand/20 dark:text-text-secondary',
  error: 'bg-terracotta text-white ring-terracotta'
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('relative space-y-0', className)}>
      {items.map((item, index) => {
        const status = item.status ?? (index === 0 ? 'active' : 'pending');
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className='relative flex gap-4 pb-6 last:pb-0'>
            {!isLast && (
              <div className='absolute left-[17px] top-8 h-full w-px bg-sand/20 dark:bg-sand/20' />
            )}
            <div
              className={cn(
                'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background',
                statusClasses[status]
              )}
            >
              {item.icon ?? <span className='text-xs font-bold'>{index + 1}</span>}
            </div>
            <div className='flex-1 pt-1'>
              <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm font-semibold text-text-primary dark:text-text-primary'>{item.title}</p>
                {item.timestamp && (
                  <time className='text-xs text-text-secondary dark:text-text-secondary'>{item.timestamp}</time>
                )}
              </div>
              {item.description && (
                <p className='mt-0.5 text-sm text-text-secondary dark:text-text-secondary'>{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
