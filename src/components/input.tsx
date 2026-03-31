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
          'w-full rounded-[18px] border bg-white text-text-primary shadow-sm outline-none transition-all duration-200 placeholder:text-text-secondary focus:ring-2 focus:ring-sea disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-sand dark:text-text-primary dark:placeholder:text-text-secondary dark:focus:ring-accent-blue',
          error ? 'border-terracotta dark:border-terracotta' : 'border-sand/30 dark:border-sand/50',
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
