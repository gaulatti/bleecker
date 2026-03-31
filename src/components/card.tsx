import React from 'react';

import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-card)] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02),0_8px_32px_rgba(26,55,77,0.04)] ring-1 ring-black/[0.04] backdrop-blur-md transition-all duration-300 dark:bg-deep-sea/90 dark:ring-white/[0.08] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        className
      )}
      {...props}
    />
  );
}
