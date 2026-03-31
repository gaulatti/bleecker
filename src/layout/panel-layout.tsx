import React from 'react';

import { cn } from '../utils/cn';

export interface PanelLayoutProps {
  children: React.ReactNode;
  className?: string;
  /**
   * `scroll` — panels have a fixed width and the container scrolls horizontally.
   * `expand` — panels flex-grow to fill the available width.
   * @default 'scroll'
   */
  mode?: 'scroll' | 'expand';
  /** Padding applied around the panel container */
  padding?: string;
}

export function PanelLayout({ children, className, mode = 'scroll', padding = 'p-6' }: PanelLayoutProps) {
  return (
    <div className={cn('flex flex-1 min-h-0', mode === 'scroll' ? 'overflow-x-auto' : 'overflow-x-visible', padding, className)}>
      <div className={cn('flex h-full min-h-0 gap-5', mode === 'scroll' ? 'flex-nowrap' : 'flex-wrap flex-1')}>
        {React.Children.map(children, (child) => (
          <div className={cn('flex flex-col h-full min-h-0', mode === 'expand' && 'flex-1 min-w-0')}>{child}</div>
        ))}
      </div>
    </div>
  );
}
