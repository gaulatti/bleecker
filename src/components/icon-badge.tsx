import React from 'react';

import { cn } from '../utils/cn';

export interface IconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'md' | 'lg';
}

const sizeClassNames: Record<NonNullable<IconBadgeProps['size']>, string> = {
  md: 'h-14 w-14',
  lg: 'h-16 w-16'
};

export function IconBadge({ children, className, size = 'lg', ...props }: IconBadgeProps) {
  return (
    <div
      className={cn('flex items-center justify-center bg-black text-white dark:bg-white dark:text-black', sizeClassNames[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
