import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

import { cn } from '../utils/cn';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn\'t load this data. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
  icon
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-terracotta/30 bg-terracotta/5 px-6 py-12 text-center dark:bg-terracotta/10',
        className
      )}
    >
      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/10 text-terracotta dark:bg-terracotta/20'>
        {icon ?? <AlertCircle size={28} />}
      </div>
      <div className='space-y-1'>
        <h3 className='text-base font-semibold text-text-primary dark:text-text-primary'>{title}</h3>
        {description && <p className='max-w-xs text-sm text-text-secondary dark:text-text-secondary'>{description}</p>}
      </div>
      {onRetry && (
        <Button variant='secondary' size='sm' onClick={onRetry}>
          <RefreshCw size={14} />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
