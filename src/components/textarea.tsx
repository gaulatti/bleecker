import React from 'react';

import { cn } from '../utils/cn';

type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  textareaSize?: TextareaSize;
}

const sizeClasses: Record<TextareaSize, string> = {
  sm: 'min-h-24 px-3 py-2 text-sm',
  md: 'min-h-28 px-4 py-3 text-sm',
  lg: 'min-h-32 px-4 py-3 text-base'
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error = false, textareaSize = 'md', rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded-[var(--radius-ui)] border-0 ring-1 ring-inset ring-black/10 bg-light-sand/50 text-text-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all duration-200 placeholder:text-text-secondary/60 hover:bg-white hover:ring-black/20 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-sea disabled:cursor-not-allowed disabled:opacity-50 dark:bg-deep-sea/50 dark:text-text-primary dark:ring-white/10 dark:placeholder:text-text-secondary dark:hover:bg-deep-sea dark:focus:ring-accent-blue',
        'resize-y',
        error ? 'ring-terracotta/50 focus:ring-terracotta dark:ring-terracotta/50' : '',
        sizeClasses[textareaSize],
        className
      )}
      {...props}
    />
  );
});
