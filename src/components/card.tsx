import React from 'react';

import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-sand/10 dark:border-dark-sand/30 bg-white/80 dark:bg-dark-sand/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-400',
        className
      )}
      {...props}
    />
  );
}
