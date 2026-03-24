import React from 'react';

import { cn } from '../utils/cn';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked?: boolean;
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { checked = false, className, disabled, id, label, onCheckedChange, ...props },
  ref
) {
  const inputId = id ?? React.useId();

  return (
    <label
      htmlFor={inputId}
      className={cn('inline-flex cursor-pointer select-none items-center gap-3', disabled && 'cursor-not-allowed opacity-50', className)}
    >
      <span className='relative inline-flex'>
        <input
          ref={ref}
          id={inputId}
          type='checkbox'
          role='switch'
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className='sr-only'
          aria-checked={checked}
          {...props}
        />
        {/* Track */}
        <span
          className={cn(
            'block h-6 w-11 rounded-full border-2 border-transparent transition-colors duration-300',
            checked ? 'bg-sea dark:bg-accent-blue' : 'bg-sand/30 dark:bg-sand/40'
          )}
        />
        {/* Thumb */}
        <span
          className={cn(
            'absolute top-0.5 left-0.5 block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </span>
      {label ? <span className='text-sm font-medium text-text-primary dark:text-text-primary'>{label}</span> : null}
    </label>
  );
});
