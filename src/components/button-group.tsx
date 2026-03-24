import React from 'react';

import { cn } from '../utils/cn';

export interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * ButtonGroup joins multiple Button (or button) elements into a connected
 * strip with shared borders and no gap between items.
 *
 * Place regular <Button> or <button> elements as direct children.
 * The group automatically adjusts border-radius so only the outer
 * corners are rounded.
 */
export function ButtonGroup({ children, className, orientation = 'horizontal' }: ButtonGroupProps) {
  return (
    <div
      role='group'
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        // Collapse inner borders between siblings and remove intermediate radius
        '[&>*]:rounded-none',
        orientation === 'horizontal'
          ? [
              '[&>*:not(:last-child)]:border-r-0',
              '[&>*:first-child]:rounded-l-full',
              '[&>*:last-child]:rounded-r-full',
              // Ensure vertical borders between buttons are visible
              '[&>*:not(:first-child)]:border-l'
            ]
          : ['[&>*:not(:last-child)]:border-b-0', '[&>*:first-child]:rounded-t-full', '[&>*:last-child]:rounded-b-full', '[&>*:not(:first-child)]:border-t'],
        className
      )}
    >
      {children}
    </div>
  );
}
