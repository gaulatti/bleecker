import React from 'react';

import { cn } from '../utils/cn';

export interface PanelLayoutProps {
  children: React.ReactNode;
  className?: string;
  /**
   * `scroll` — panels have a fixed width and the container scrolls horizontally.
   * `expand` — panels flex-grow to fill the available width.
   * `monitor` — panels scroll horizontally, but gaps and padding are removed for seamless column snapping.
   * @default 'scroll'
   */
  mode?: 'scroll' | 'expand' | 'monitor';
  /** Padding applied around the panel container */
  padding?: string;
}

export function PanelLayout({ children, className, mode = 'scroll', padding }: PanelLayoutProps) {
  // Determine default padding based on mode if not explicitly provided
  const resolvedPadding = padding ?? (mode === 'monitor' ? 'p-0 gap-0' : 'p-6');

  return (
    <div className={cn('flex flex-1 min-h-0', mode === 'scroll' || mode === 'monitor' ? 'overflow-x-auto' : 'overflow-x-visible', resolvedPadding, className)}>
      <div className={cn('flex h-full min-h-0', mode === 'monitor' ? 'gap-0 flex-nowrap' : mode === 'scroll' ? 'gap-5 flex-nowrap' : 'gap-5 flex-wrap flex-1')}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;

          // If in monitor mode, auto-inject the monitor variant to Panel components
          const childProps = mode === 'monitor' && typeof child.type !== 'string' ? { variant: 'monitor' } : {};

          return (
            <div className={cn('flex flex-col h-full min-h-0', mode === 'expand' && 'flex-1 min-w-0')}>{React.cloneElement(child, childProps as any)}</div>
          );
        })}
      </div>
    </div>
  );
}
