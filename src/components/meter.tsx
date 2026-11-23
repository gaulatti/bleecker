import { cn } from '../utils/cn';

export interface MeterProps {
  className?: string;
  /** The held maximum, in the same scale as `value`. */
  hold?: number | null;
  label: string;
  max: number;
  min: number;
  /** Horizontal by default. Vertical fills from the bottom, for a meter beside a vertical fader. */
  orientation?: 'horizontal' | 'vertical';
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
export function Meter({ className, hold, label, max, min, orientation = 'horizontal', peak, unit, value, warnFrom }: MeterProps) {
  const span = max - min;
  const at = (reading: number) => (span > 0 ? Math.max(0, Math.min(100, ((reading - min) / span) * 100)) : 0);
  const vertical = orientation === 'vertical';
  // Along the meter's axis: from the left, or from the bottom when vertical.
  const from = (percent: number) => (vertical ? { bottom: `${percent}%` } : { left: `${percent}%` });
  const mark = (percent: number) => (vertical ? { bottom: `calc(${percent}% - 1px)` } : { left: `calc(${percent}% - 1px)` });
  return (
    <div
      role='meter'
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value ?? min}
      aria-valuetext={value === null ? 'No level' : `${value.toFixed(1)}${unit ? ` ${unit}` : ''}`}
      data-orientation={vertical ? 'vertical' : undefined}
      className={cn('relative overflow-hidden rounded-full bg-sand/30 dark:bg-sand/25', vertical ? 'h-full w-1.5' : 'h-1.5', className)}
    >
      {warnFrom !== undefined ? (
        <span data-meter='warn' className={cn('absolute bg-terracotta/35', vertical ? 'inset-x-0 top-0' : 'inset-y-0 right-0')} style={from(at(warnFrom))} />
      ) : null}
      {value !== null ? (
        <span
          data-meter='fill'
          className={cn('absolute bg-sea dark:bg-accent-blue', vertical ? 'inset-x-0 bottom-0' : 'inset-y-0 left-0')}
          style={vertical ? { height: `${at(value)}%` } : { width: `${at(value)}%` }}
        />
      ) : null}
      {peak !== undefined && peak !== null ? (
        <span data-meter='peak' className={cn('absolute bg-text-primary/80', vertical ? 'inset-x-0 h-0.5' : 'inset-y-0 w-0.5')} style={mark(at(peak))} />
      ) : null}
      {hold !== undefined && hold !== null ? (
        <span
          data-meter='hold'
          className={cn(
            'absolute',
            vertical ? 'inset-x-0 h-0.5' : 'inset-y-0 w-0.5',
            warnFrom !== undefined && hold >= warnFrom ? 'bg-terracotta' : 'bg-accent-text dark:bg-accent-yellow'
          )}
          style={mark(at(hold))}
        />
      ) : null}
    </div>
  );
}
