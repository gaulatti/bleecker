import React from 'react';

import { Panel } from '../components/panel';
import { cn } from '../utils/cn';

export interface PanelLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Optional padding applied around the panel container. @default 'p-0' */
  padding?: string;
}

export function PanelLayout({ children, className, padding }: PanelLayoutProps) {
  const resolvedPadding = padding ?? 'p-0';

  return (
    <div className={cn('flex flex-1 h-full min-h-0 overflow-x-auto', resolvedPadding, className)}>
      <div className='flex flex-1 h-full min-h-0 gap-0 flex-nowrap'>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          const shouldFill = Boolean((child.props as { grow?: boolean }).grow);

          // Auto-inject monitor panel styling for Panel children.
          const childProps = child.type === Panel ? { variant: 'monitor' } : {};

          return (
            <div className={cn('flex h-full min-h-0 flex-col', shouldFill ? 'flex-1 min-w-0' : 'shrink-0')}>
              {React.cloneElement(child, childProps as any)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
