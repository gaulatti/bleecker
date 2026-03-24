import React from 'react';

import { cn } from '../utils/cn';

export interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  content: React.ReactNode;
  side?: 'top' | 'bottom';
}

/**
 * A card that appears on hover over a trigger element.
 * Pure CSS approach — no portal needed.
 */
export function HoverCard({ children, className, content, side = 'bottom' }: HoverCardProps) {
  return (
    <span className='group relative inline-flex'>
      {children}
      <span
        className={cn(
          'pointer-events-none absolute z-50 w-72 rounded-2xl border border-sand/10 bg-white p-4 shadow-xl opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 dark:border-sand/20 dark:bg-dark-sand',
          side === 'bottom' ? 'top-full left-1/2 mt-2 -translate-x-1/2 group-hover:translate-y-0' : 'bottom-full left-1/2 mb-2 -translate-x-1/2',
          className
        )}
        role='tooltip'
      >
        {content}
      </span>
    </span>
  );
}
