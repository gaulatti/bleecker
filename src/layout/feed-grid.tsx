import React from 'react';

import { mergeClasses } from '../utils/merge-classes';

export interface FeedGridProps extends React.HTMLAttributes<HTMLDivElement> {
  minColumnWidth?: number | string;
}

export function FeedGrid({ children, className, minColumnWidth = 340, style, ...props }: FeedGridProps) {
  const resolvedWidth = typeof minColumnWidth === 'number' ? `${minColumnWidth}px` : minColumnWidth;

  return (
    <div
      {...props}
      className={mergeClasses('grid gap-3 p-4', className)}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${resolvedWidth}), 1fr))`, ...style }}
    >
      {children}
    </div>
  );
}
