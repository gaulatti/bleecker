import React from 'react';

import { cn } from '../utils/cn';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  className?: string;
  content: React.ReactNode;
  side?: TooltipSide;
}

const sideClasses: Record<TooltipSide, { container: string; arrow: string }> = {
  top: {
    container: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    arrow: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-dark-sand dark:border-t-sand/80'
  },
  bottom: {
    container: 'top-full left-1/2 mt-2 -translate-x-1/2',
    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-dark-sand dark:border-b-sand/80'
  },
  left: {
    container: 'right-full top-1/2 mr-2 -translate-y-1/2',
    arrow: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-dark-sand dark:border-l-sand/80'
  },
  right: {
    container: 'left-full top-1/2 ml-2 -translate-y-1/2',
    arrow: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-dark-sand dark:border-r-sand/80'
  }
};

export function Tooltip({ children, className, content, side = 'top' }: TooltipProps) {
  const { container, arrow } = sideClasses[side];

  return (
    <span className={cn('group/tooltip relative inline-flex items-center', className)}>
      {children}
      <span
        role='tooltip'
        className={cn(
          'pointer-events-none absolute z-[180] w-max max-w-[220px] rounded-lg bg-dark-sand px-3 py-1.5 text-xs leading-relaxed text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 dark:bg-sand/80',
          container
        )}
      >
        {content}
        <span className={cn('absolute h-0 w-0 border-4', arrow)} aria-hidden='true' />
      </span>
    </span>
  );
}
