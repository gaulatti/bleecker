import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date) {
  return isSameDay(date, new Date());
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Calendar ────────────────────────────────────────────────────────────────

export interface CalendarProps {
  className?: string;
  disabled?: (date: Date) => boolean;
  maxDate?: Date;
  minDate?: Date;
  onChange?: (date: Date) => void;
  value?: Date | null;
}

export function Calendar({ className, disabled: isDisabledFn, maxDate, minDate, onChange, value }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(value?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(value?.getMonth() ?? today.getMonth());

  const days = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: days }, (_, i) => new Date(viewYear, viewMonth, i + 1))];

  const isOutOfRange = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className={cn('w-full select-none', className)}>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <button
          type='button'
          onClick={prevMonth}
          className='rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-sand/10 hover:text-text-primary dark:hover:bg-sand/20 dark:hover:text-text-primary'
          aria-label='Previous month'
        >
          <ChevronLeft size={16} />
        </button>
        <span className='text-sm font-semibold text-text-primary dark:text-text-primary'>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type='button'
          onClick={nextMonth}
          className='rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-sand/10 hover:text-text-primary dark:hover:bg-sand/20 dark:hover:text-text-primary'
          aria-label='Next month'
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className='mb-1 grid grid-cols-7'>
        {DAYS.map((d) => (
          <div
            key={d}
            className='flex h-8 items-center justify-center text-[11px] font-medium uppercase tracking-wider text-text-secondary dark:text-text-secondary'
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className='grid grid-cols-7 gap-y-0.5'>
        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;

          const selected = value && isSameDay(date, value);
          const todayCell = isToday(date);
          const outOfRange = isOutOfRange(date);
          const disabled = outOfRange || isDisabledFn?.(date);

          return (
            <button
              key={date.toISOString()}
              type='button'
              disabled={!!disabled}
              onClick={() => onChange?.(date)}
              aria-label={date.toDateString()}
              aria-pressed={!!selected}
              className={cn(
                'flex h-8 w-full items-center justify-center rounded-full text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sea dark:focus-visible:ring-accent-blue',
                selected
                  ? 'bg-sea font-semibold text-white dark:bg-accent-blue'
                  : todayCell
                    ? 'font-semibold text-sea ring-1 ring-inset ring-sea dark:text-accent-blue dark:ring-accent-blue'
                    : 'text-text-primary hover:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/15',
                disabled && 'pointer-events-none opacity-30'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

export interface DatePickerProps {
  className?: string;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  maxDate?: Date;
  minDate?: Date;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  value?: Date | null;
}

export function DatePicker({ className, disabled = false, disabledDates, maxDate, minDate, onChange, placeholder = 'Pick a date', value }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type='button'
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup='dialog'
        aria-expanded={open}
        className={cn(
          'flex h-10 min-w-[200px] items-center gap-2 rounded-[18px] border bg-white px-4 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sea dark:bg-dark-sand dark:focus:ring-accent-blue',
          open ? 'border-sea ring-2 ring-sea/20 dark:border-accent-blue dark:ring-accent-blue/20' : 'border-sand/30 hover:border-sand/50 dark:border-sand/50',
          value ? 'text-text-primary dark:text-text-primary' : 'text-text-secondary dark:text-text-secondary',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <CalendarDays size={15} className='flex-shrink-0 text-text-secondary' />
        <span className='flex-1 text-left'>{value ? formatDate(value) : placeholder}</span>
      </button>

      {open && (
        <div
          role='dialog'
          aria-label='Date picker'
          className='absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-sand/10 bg-white p-4 shadow-xl dark:border-sand/20 dark:bg-dark-sand'
        >
          <Calendar
            value={value}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabledDates}
            onChange={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
          />
          {value && (
            <button
              type='button'
              onClick={() => {
                onChange?.(null);
                setOpen(false);
              }}
              className='mt-3 w-full rounded-lg py-1.5 text-xs text-text-secondary transition-colors hover:bg-sand/10 hover:text-text-primary dark:hover:bg-sand/15 dark:hover:text-text-primary'
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
