import React from 'react';

import { cn } from '../utils/cn';

export interface PanelProps {
  /**
   * A CSS color value used as the left-border accent and LED dot color.
   * Defaults to the theme's `sea` color.
   * @example '#3b82f6'
   */
  accent?: string;
  children: React.ReactNode;
  className?: string;
  /** Item count displayed in the header badge */
  count?: number;
  /** Optional drag handle element rendered before the title (for DnD integration) */
  dragHandle?: React.ReactNode;
  /** Optional filter/search content rendered below the title row */
  filter?: React.ReactNode;
  /** Whether the panel is currently being dragged */
  isDragging?: boolean;
  title: string;
  /** Optional toolbar rendered below the filter row */
  toolbar?: React.ReactNode;
  /**
   * Fixed width for the panel (used in PanelLayout scroll mode).
   * Accepts any valid CSS width value, e.g. `'320px'` or `320`.
   */
  width?: number | string;
}

export function Panel({ accent, children, className, count, dragHandle, filter, isDragging, title, toolbar, width }: PanelProps) {
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const accentStyle: React.CSSProperties = {
    ...(accent ? { '--panel-accent': accent } as React.CSSProperties : {}),
    ...(widthValue ? { width: widthValue, minWidth: widthValue } : {}),
    borderLeftColor: accent ?? 'var(--color-sea)'
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full overflow-hidden rounded-xl border border-white/8 bg-white/2',
        'border-l-[3px] transition-all duration-200',
        isDragging ? 'rotate-1 shadow-2xl' : 'shadow-sm hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
      style={accentStyle}
    >
      {/* Panel header */}
      <div
        className={cn(
          'flex flex-col rounded-t-xl border-b border-white/8 bg-white/3 select-none',
          'text-[color:var(--panel-accent,var(--color-sea))]'
        )}
      >
        <div className='flex items-center gap-3 px-5 py-4'>
          {dragHandle ? <span className='cursor-grab text-text-secondary active:cursor-grabbing'>{dragHandle}</span> : null}

          {/* LED dot */}
          <span
            className='h-1.5 w-1.5 flex-shrink-0 rounded-full animate-pulse'
            style={{ backgroundColor: accent ?? 'var(--color-sea)' }}
          />

          <span className='flex-1 text-sm font-bold uppercase tracking-wider'>{title}</span>

          {count !== undefined ? (
            <span className='rounded-full bg-text-secondary/10 px-2 py-0.5 text-xs font-medium tabular-nums text-text-secondary dark:text-text-secondary'>
              {count}
            </span>
          ) : null}
        </div>

        {filter ? <div className='px-5 pb-3'>{filter}</div> : null}

        {toolbar ? (
          <div className='flex items-center justify-center gap-2 border-t border-white/5 bg-white/1 px-5 py-2'>{toolbar}</div>
        ) : null}
      </div>

      {/* Scrollable feed */}
      <div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-text-secondary/30 hover:scrollbar-thumb-text-secondary/50'>
        {children}
      </div>
    </div>
  );
}
