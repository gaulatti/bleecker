import React from 'react';

import { cn } from '../utils/cn';

type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  endIcon?: React.ReactNode;
  error?: boolean;
  inputSize?: InputSize;
  startIcon?: React.ReactNode;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'min-h-9 px-3 py-2 text-sm',
  md: 'min-h-11 px-4 py-2.5 text-sm',
  lg: 'min-h-12 px-4 py-3 text-base'
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, endIcon, error = false, inputSize = 'md', startIcon, type = 'text', ...props },
  ref
) {
  return (
    <div className='relative w-full'>
      {startIcon ? (
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary dark:text-text-secondary'>{startIcon}</div>
      ) : null}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-[var(--radius-ui)] border-0 ring-1 ring-inset ring-black/10 bg-light-sand/50 text-text-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none transition-all duration-200 placeholder:text-text-secondary/60 hover:bg-white hover:ring-black/20 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-sea disabled:cursor-not-allowed disabled:opacity-50 dark:bg-deep-sea/50 dark:text-text-primary dark:ring-white/10 dark:placeholder:text-text-secondary dark:hover:bg-deep-sea dark:focus:ring-accent-blue',
          error ? 'ring-terracotta/50 focus:ring-terracotta dark:ring-terracotta/50' : '',
          startIcon ? 'pl-10' : sizeClasses[inputSize],
          startIcon && inputSize === 'sm' && 'min-h-9 py-2 pr-3 text-sm',
          startIcon && inputSize === 'md' && 'min-h-11 py-2.5 pr-4 text-sm',
          startIcon && inputSize === 'lg' && 'min-h-12 py-3 pr-4 text-base',
          endIcon ? 'pr-10' : undefined,
          className
        )}
        {...props}
      />
      {endIcon ? (
        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary dark:text-text-secondary'>{endIcon}</div>
      ) : null}
    </div>
  );
});
