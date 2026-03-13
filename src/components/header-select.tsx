import React from 'react';

import { cn } from '../utils/cn';

export interface HeaderSelectOption {
  label: string;
  value: string;
}

export interface HeaderSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  icon?: React.ReactNode;
  onChange: (value: string) => void;
  options: HeaderSelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
}

export function HeaderSelect({
  className,
  disabled,
  icon,
  onChange,
  options,
  placeholder = 'Select option',
  value,
  wrapperClassName,
  ...props
}: HeaderSelectProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-sand/20 bg-white/35 px-3 py-1.5 shadow-sm backdrop-blur-md dark:border-sand/70 dark:bg-sand/25',
        disabled && 'opacity-50',
        wrapperClassName
      )}
    >
      {icon}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'max-w-[140px] cursor-pointer bg-transparent text-sm text-text-primary focus:outline-none dark:text-text-primary',
          className
        )}
        {...props}
      >
        <option value=''>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
