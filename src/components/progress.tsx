import React from 'react';

import { cn } from '../utils/cn';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100 */
  value?: number;
  max?: number;
  /** Show the numeric label inside/next to the bar */
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
};

const variantFill = {
  default: 'bg-sea dark:bg-accent-blue',
  success: 'bg-sea dark:bg-accent-blue',
  warning: 'bg-sunset dark:bg-accent-gold',
  destructive: 'bg-terracotta'
};

export function Progress({ className, max = 100, showLabel = false, size = 'md', value = 0, variant = 'default', ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <div
        role='progressbar'
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn('flex-1 overflow-hidden rounded-full bg-sand/15 dark:bg-sand/20', sizeClasses[size])}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', variantFill[variant])} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className='min-w-[2.5rem] text-right text-xs font-medium tabular-nums text-text-secondary dark:text-text-primary'>{Math.round(pct)}%</span>
      )}
    </div>
  );
}
