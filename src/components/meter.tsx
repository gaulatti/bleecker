import { cn } from '../utils/cn';

export interface MeterProps {
  className?: string;
  /** The held maximum, in the same scale as `value`. */
  hold?: number | null;
  label: string;
  max: number;
  min: number;
  /** The live peak, in the same scale as `value`. */
  peak?: number | null;
  unit?: string;
  value: number | null;
  /** From here to `max` the scale is the warning zone, and a hold inside it turns red. */
  warnFrom?: number;
}

/**
 * A reading and its scale: a level between `min` and `max` with an optional live peak, a held peak
 * and a warning zone. It does not animate; the page feeds it new values.
 */
export function Meter({ className, hold, label, max, min, peak, unit, value, warnFrom }: MeterProps) {
  const span = max - min;
  const at = (reading: number) => (span > 0 ? Math.max(0, Math.min(100, ((reading - min) / span) * 100)) : 0);
  return (
    <div
      role='meter'
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value ?? min}
      aria-valuetext={value === null ? 'No level' : `${value.toFixed(1)}${unit ? ` ${unit}` : ''}`}
      className={cn('relative h-1.5 overflow-hidden rounded-full bg-sand/30 dark:bg-sand/25', className)}
    >
      {warnFrom !== undefined ? <span data-meter='warn' className='absolute inset-y-0 right-0 bg-terracotta/35' style={{ left: `${at(warnFrom)}%` }} /> : null}
      {value !== null ? <span data-meter='fill' className='absolute inset-y-0 left-0 bg-sea dark:bg-accent-blue' style={{ width: `${at(value)}%` }} /> : null}
      {peak !== undefined && peak !== null ? <span data-meter='peak' className='absolute inset-y-0 w-0.5 bg-text-primary/80' style={{ left: `calc(${at(peak)}% - 1px)` }} /> : null}
      {hold !== undefined && hold !== null ? (
        <span
          data-meter='hold'
          className={cn('absolute inset-y-0 w-0.5', warnFrom !== undefined && hold >= warnFrom ? 'bg-terracotta' : 'bg-accent-text dark:bg-accent-yellow')}
          style={{ left: `calc(${at(hold)}% - 1px)` }}
        />
      ) : null}
    </div>
  );
}
