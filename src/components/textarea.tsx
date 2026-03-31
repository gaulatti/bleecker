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
        'w-full rounded-[20px] border bg-white text-text-primary shadow-sm outline-none transition-all duration-200 placeholder:text-text-secondary focus:ring-2 focus:ring-sea disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-sand dark:text-text-primary dark:placeholder:text-text-secondary dark:focus:ring-accent-blue',
        'resize-y',
        error ? 'border-terracotta dark:border-terracotta' : 'border-sand/30 dark:border-sand/50',
        sizeClasses[textareaSize],
        className
      )}
      {...props}
    />
  );
});
