import * as React from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { cn } from '../utils/cn';
import { Button } from './button';

export interface DateRange {
  from?: string;
  to?: string;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
  presets?: { label: string; days: number }[];
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Pick a date range',
  presets
}: DateRangePickerProps) {
  const hasValue = value.from || value.to;

  const applyPreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    onChange({
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    });
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className='relative flex items-center rounded-[var(--radius-ui)] bg-light-sand/50 ring-1 ring-inset ring-black/10 transition-all hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-sea dark:bg-deep-sea/50 dark:ring-white/10 dark:focus-within:ring-accent-blue'>
        <CalendarIcon size={16} className='ml-3 text-text-secondary dark:text-text-secondary' />
        <input
          type='date'
          value={value.from ?? ''}
          max={value.to}
          onChange={(e) => onChange({ ...value, from: e.target.value || undefined })}
          className='h-9 border-none bg-transparent px-2 text-sm text-text-primary outline-none dark:text-text-primary'
        />
        <span className='text-sm text-text-secondary dark:text-text-secondary'>-</span>
        <input
          type='date'
          value={value.to ?? ''}
          min={value.from}
          onChange={(e) => onChange({ ...value, to: e.target.value || undefined })}
          className='h-9 border-none bg-transparent px-2 text-sm text-text-primary outline-none dark:text-text-primary'
        />
        {hasValue && (
          <button
            type='button'
            onClick={() => onChange({})}
            className='mr-2 rounded-md p-1 text-text-secondary hover:bg-sand/10 hover:text-text-primary dark:hover:bg-sand/15'
          >
            <X size={14} />
          </button>
        )}
      </div>

      {presets && (
        <div className='flex flex-wrap items-center gap-1'>
          {presets.map((preset) => (
            <Button key={preset.label} variant='ghost' size='sm' onClick={() => applyPreset(preset.days)}>
              {preset.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
