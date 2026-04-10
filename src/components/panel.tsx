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
  /**
   * When used inside `PanelLayout`, lets this column grow to consume
   * remaining horizontal space.
   */
  grow?: boolean;
  /** Whether the panel is currently being dragged */
  isDragging?: boolean;
  title: string;
  /** Optional toolbar rendered below the filter row */
  toolbar?: React.ReactNode;
  /**
   * Fixed width for the panel.
   * Accepts any valid CSS width value, e.g. `'320px'` or `320`.
   */
  width?: number | string;
  /**
   * The visual style of the panel.
   * `default` provides the standard elevated card look.
   * `monitor` strips borders, radii, and shadows for seamless multi-column interfaces.
   * @default 'default'
   */
  variant?: 'default' | 'monitor';
}

export function Panel({ accent, children, className, count, dragHandle, filter, grow: _grow, isDragging, title, toolbar, width, variant = 'default' }: PanelProps) {
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const accentStyle: React.CSSProperties = {
    ...(accent ? ({ '--panel-accent': accent } as React.CSSProperties) : {}),
    ...(widthValue ? { width: widthValue, minWidth: widthValue } : {}),
    borderLeftColor: accent ?? 'var(--color-sea)'
  };

  return (
    <div
        className={cn(
        'group flex flex-col h-full min-h-0 overflow-hidden transition-all duration-300 ease-out-expo',
        variant === 'monitor'
          ? 'border-r border-black/[0.04] dark:border-white/[0.04] border-l-0 border-y-0 rounded-none bg-transparent shadow-none'
          : [
              'rounded-[var(--radius-card)] bg-white dark:bg-deep-sea/90',
              'ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.08]',
              'shadow-[0_2px_10px_rgba(0,0,0,0.02),0_8px_32px_rgba(26,55,77,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
              'border-l-4',
              isDragging
                ? 'rotate-1 scale-105 shadow-[0_16px_64px_rgba(26,55,77,0.12)]'
                : 'hover:shadow-[0_8px_32px_rgba(26,55,77,0.08)] dark:hover:shadow-[0_16px_64px_rgba(0,0,0,0.5)]'
            ],
        className
      )}
      style={accentStyle}
    >
      {/* Panel header */}
      <div
        className={cn(
          'flex flex-col relative z-10 bg-white/40 dark:bg-deep-sea/40 backdrop-blur-md',
          'border-b border-black/[0.04] dark:border-white/[0.08] select-none'
        )}
      >
        <div className='flex items-center gap-3 px-5 py-4'>
          {dragHandle ? (
            <span className='cursor-grab text-black/40 hover:text-black/80 dark:text-white/40 dark:hover:text-white/80 active:cursor-grabbing transition-colors'>
              {dragHandle}
            </span>
          ) : null}

          {/* LED dot */}
          <span
            className='h-2 w-2 flex-shrink-0 rounded-full shadow-[0_0_8px_currentColor] opacity-80 group-hover:opacity-100 transition-opacity'
            style={{ backgroundColor: accent ?? 'var(--color-sea)', color: accent ?? 'var(--color-sea)' }}
          />

          <span className='flex-1 text-xs font-bold uppercase tracking-widest text-[color:var(--panel-accent,var(--color-sea))]'>{title}</span>

          {count !== undefined ? (
            <span className='rounded-full bg-light-sand/50 dark:bg-white/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-text-primary ring-1 ring-inset ring-black/5 dark:ring-white/10'>
              {count}
            </span>
          ) : null}
        </div>

        {filter ? <div className='px-5 pb-4'>{filter}</div> : null}

        {toolbar ? (
          <div className='flex items-center justify-center gap-2 border-t border-black/[0.04] dark:border-white/[0.04] bg-light-sand/20 dark:bg-white/5 px-5 py-2.5'>
            {toolbar}
          </div>
        ) : null}
      </div>

      {/* Scrollable feed */}
      <div className='flex-1 min-h-0 overflow-y-auto bg-light-sand/10 dark:bg-transparent scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black/10 hover:scrollbar-thumb-black/20 dark:scrollbar-thumb-white/10 dark:hover:scrollbar-thumb-white/20'>
        {children}
      </div>
    </div>
  );
}
