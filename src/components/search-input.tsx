import * as React from 'react';
import { Search, X } from 'lucide-react';

import { cn } from '../utils/cn';
import { Input, type InputProps } from './input';

export interface SearchInputProps extends Omit<InputProps, 'startIcon' | 'endIcon' | 'type'> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, onClear, value, onChange, ...props },
  ref
) {
  const inputValue = typeof value === 'string' ? value : '';

  return (
    <div className={cn('relative', className)}>
      <Input
        ref={ref}
        type='search'
        value={value}
        onChange={onChange}
        startIcon={<Search className='h-4 w-4' />}
        className='pr-8'
        {...props}
      />
      {inputValue && onClear && (
        <button
          type='button'
          onClick={onClear}
          className='absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-text-secondary transition-colors hover:bg-sand/10 hover:text-text-primary dark:hover:bg-sand/15'
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});
