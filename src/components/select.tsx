import { Check, ChevronDown } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  className?: string;
  disabled?: boolean;
  error?: boolean;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  value: string;
}

export function Select({ className, disabled = false, error = false, onChange, options, placeholder = 'Select...', value }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type='button'
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (disabled) {
            return;
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen((open) => !open);
          }

          if (event.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm('');
          }
        }}
        className={cn(
          'w-full rounded-[18px] border bg-white px-4 py-3 text-left text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sea dark:bg-dark-sand dark:text-text-primary dark:focus:ring-accent-blue',
          disabled ? 'cursor-not-allowed opacity-50 bg-sand/10' : 'cursor-pointer hover:border-sea/50 dark:hover:border-accent-blue/50',
          error ? 'border-terracotta dark:border-terracotta' : 'border-sand/30 dark:border-sand/50',
          isOpen && 'border-sea ring-2 ring-sea dark:border-accent-blue dark:ring-accent-blue'
        )}
      >
        <div className='flex items-center justify-between gap-3'>
          <span className={selectedOption ? 'text-text-primary dark:text-text-primary' : 'text-text-secondary dark:text-text-secondary'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={18} className={cn('text-text-secondary transition-transform duration-200 dark:text-text-secondary', isOpen && 'rotate-180')} />
        </div>
      </button>

      {isOpen ? (
        <div
          ref={dropdownRef}
          className='absolute z-50 mt-2 w-full overflow-hidden rounded-[20px] border border-sand/30 bg-white shadow-lg dark:border-sand/50 dark:bg-dark-sand dark:shadow-2xl'
        >
          {options.length > 5 ? (
            <div className='border-b border-sand/20 p-2 dark:border-sand/40'>
              <input
                type='text'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder='Search...'
                className='w-full rounded-lg border border-sand/20 bg-sand/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-sea dark:border-sand/30 dark:bg-sand/10 dark:text-text-primary dark:placeholder:text-text-secondary dark:focus:ring-accent-blue'
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          ) : null}

          <div className='max-h-60 overflow-y-auto py-1'>
            {filteredOptions.length === 0 ? (
              <div className='px-4 py-3 text-center text-sm text-text-secondary dark:text-text-secondary'>No options found</div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors duration-150',
                      isSelected
                        ? 'bg-sea/10 font-medium text-sea dark:bg-accent-blue/10 dark:text-accent-blue'
                        : 'text-text-primary hover:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/20'
                    )}
                  >
                    <span className='flex-1 tracking-refined'>{option.label}</span>
                    {isSelected ? <Check size={16} className='flex-shrink-0 text-sea dark:text-accent-blue' /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
