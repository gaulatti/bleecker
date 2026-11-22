import React from 'react';

import { cn } from '../utils/cn';

export interface KeyCapProps extends React.HTMLAttributes<HTMLElement> {
  /** One cap per key, for a chord: `keys={['⌘', 'K']}`. */
  keys?: string[];
}

const capClasses =
  'inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-b-2 border-sand/60 bg-white px-1.5 font-mono text-[11px] font-semibold text-text-secondary dark:border-white/20 dark:bg-deep-sea/60 dark:text-text-primary';

/** A keyboard key as a cap with a heavier bottom edge. Kbd stays exported; KeyCap is the new styling. */
export function KeyCap({ className, children, keys, ...props }: KeyCapProps) {
  if (keys && keys.length > 0) {
    return (
      <span className='inline-flex items-center gap-1' role='group' aria-label={keys.join(' ')}>
        {keys.map((key, index) => (
          <kbd key={`${key}-${index}`} {...props} className={cn(capClasses, className)}>
            {key}
          </kbd>
        ))}
      </span>
    );
  }
  return (
    <kbd {...props} className={cn(capClasses, className)}>
      {children}
    </kbd>
  );
}
