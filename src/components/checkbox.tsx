import React from 'react';

import { cn } from '../utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
  description?: React.ReactNode;
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, containerClassName, description, id, label, ...props },
  ref
) {
  const checkbox = (
    <input
      ref={ref}
      id={id}
      type='checkbox'
      className={cn(
        'h-4 w-4 rounded border-sand/40 text-sea shadow-sm transition-colors focus:ring-2 focus:ring-sea disabled:cursor-not-allowed disabled:opacity-50 dark:border-sand/50 dark:bg-dark-sand dark:text-accent-blue dark:focus:ring-accent-blue',
        className
      )}
      {...props}
    />
  );

  if (!label && !description) {
    return checkbox;
  }

  return (
    <label htmlFor={id} className={cn('flex items-start gap-3', containerClassName)}>
      {checkbox}
      <span className='min-w-0'>
        {label ? <span className='block text-sm font-medium text-text-primary dark:text-text-primary'>{label}</span> : null}
        {description ? <span className='mt-0.5 block text-sm text-text-secondary dark:text-text-secondary'>{description}</span> : null}
      </span>
    </label>
  );
});
