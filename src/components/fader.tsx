import React from 'react';

import { cn } from '../utils/cn';
import { Meter, type MeterProps } from './meter';

export type FaderUnit = 'db' | 'percent';

export interface FaderProps {
  className?: string;
  /** The coarse step, for Shift with an arrow and for Page Up / Page Down. Defaults to ten steps. */
  coarseStep?: number;
  disabled?: boolean;
  /** What the fader sets, announced with its value ("Music: −6.0 dB"). */
  label: string;
  /** How the readout and the announcement show a value. Defaults to `formatFaderValue`. */
  format?: (value: number) => string;
  /** The track's length along its axis (a CSS length). Defaults to 12rem. */
  length?: string;
  /** Labelled scale marks along the track, in the value's unit, placed through `taper`. */
  marks?: ReadonlyArray<number | FaderMark>;
  max: number;
  /**
   * A level shown beside the fader on a linear `min`–`max` scale. With a `taper` the
   * fader's travel is not linear, so a consumer with a taper keeps its own meter.
   */
  meter?: Pick<MeterProps, 'hold' | 'peak' | 'value' | 'warnFrom'>;
  min: number;
  onValueChange: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
  /** The fine step, for an arrow key. Defaults to 0.5 dB or 1 %. */
  step?: number;
  /**
   * Where a value sits along the travel, for a non-linear fader such as a console taper:
   * `toPosition(value)` gives 0 (bottom or left) to 1, and `fromPosition` is its inverse.
   * The track, cap, unity mark, scale marks and pointer follow it; keys still step in the
   * value's unit. Defaults to linear between `min` and `max`.
   */
  taper?: FaderTaper;
  /** The value the fader returns to on double-click or the 0 key; drawn as a mark on the track. */
  unity?: number;
  unit: FaderUnit;
  value: number;
}

export interface FaderTaper {
  fromPosition: (position: number) => number;
  toPosition: (value: number) => number;
}

export interface FaderMark {
  /** Shown beside the mark; defaults to the value, rounded. */
  label?: string;
  value: number;
}

const DECIMALS: Record<FaderUnit, number> = { db: 1, percent: 0 };

/** The value as read out and announced: "−6.0 dB", "+3.0 dB", "75 %". */
export function formatFaderValue(value: number, unit: FaderUnit): string {
  const fixed = Math.abs(value).toFixed(DECIMALS[unit]);
  if (unit === 'percent') return `${value < 0 ? '−' : ''}${fixed} %`;
  const sign = Number(fixed) === 0 ? '' : value < 0 ? '−' : '+';
  return `${sign}${fixed} dB`;
}

function clampToStep(value: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, value));
  if (!(step > 0)) return clamped;
  const snapped = min + Math.round((clamped - min) / step) * step;
  // Keep the decimals of the step (0.5 + 0.1 drift) and stay inside the range.
  const digits = (String(step).split('.')[1] ?? '').length;
  return Math.min(max, Math.max(min, Number(snapped.toFixed(digits))));
}

/**
 * A console fader: sets a level between `min` and `max` and states it. Vertical by default, with a
 * unity mark, a readout in tabular numerals and an optional level meter on the same scale.
 *
 * Keyboard: arrows step by `step`, Shift with an arrow (or Page Up / Page Down) by `coarseStep`,
 * Home and End go to the limits, and 0 returns to `unity`. A double-click also returns to unity.
 * Mute and solo are separate controls.
 */
export function Fader({
  className,
  coarseStep,
  disabled = false,
  format,
  label,
  length = '12rem',
  marks,
  max,
  meter,
  min,
  onValueChange,
  orientation = 'vertical',
  step,
  taper,
  unity,
  unit,
  value
}: FaderProps) {
  const fine = step ?? (unit === 'db' ? 0.5 : 1);
  const coarse = coarseStep ?? fine * 10;
  const vertical = orientation === 'vertical';
  const span = max - min;
  const travel = (reading: number) => (taper ? taper.toPosition(reading) : span > 0 ? (reading - min) / span : 0);
  // Where a value sits along the track, in percent of its length.
  const at = (reading: number) => {
    const position = travel(reading);
    return Number.isFinite(position) ? Math.max(0, Math.min(100, position * 100)) : 0;
  };
  const current = Math.min(max, Math.max(min, value));
  const unityInRange = unity !== undefined && unity >= min && unity <= max;
  const readout = format ? format(current) : formatFaderValue(current, unit);
  const dragging = React.useRef(false);

  const commit = (next: number) => {
    const settled = clampToStep(next, min, max, fine);
    if (settled !== current) onValueChange(settled);
  };

  const valueAt = (track: HTMLElement, clientX: number, clientY: number) => {
    const box = track.getBoundingClientRect();
    const fraction = vertical
      ? box.height > 0 ? (box.bottom - clientY) / box.height : 0
      : box.width > 0 ? (clientX - box.left) / box.width : 0;
    const position = Math.max(0, Math.min(1, fraction));
    return taper ? taper.fromPosition(position) : min + position * span;
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const amount = event.shiftKey ? coarse : fine;
    // From a value between steps, the first press of any step key (fine or coarse) goes to the
    // nearest fine step in that direction.
    const onGrid = clampToStep(current, min, max, fine);
    const up = (by: number) => (onGrid > current ? onGrid : onGrid + by);
    const down = (by: number) => (onGrid < current ? onGrid : onGrid - by);
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        next = up(amount);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        next = down(amount);
        break;
      case 'PageUp':
        next = up(coarse);
        break;
      case 'PageDown':
        next = down(coarse);
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      case '0':
        if (unityInRange) next = unity;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next !== null) commit(next);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.currentTarget.focus();
    dragging.current = true;
    try {
      // Keeps the drag when the pointer leaves the track; a pointer the browser
      // does not know (a synthetic one) cannot be captured, and the drag still works on the track.
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Not capturable: the drag follows the track only.
    }
    commit(valueAt(event.currentTarget, event.clientX, event.clientY));
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !dragging.current) return;
    commit(valueAt(event.currentTarget, event.clientX, event.clientY));
  };

  const endDrag = () => {
    dragging.current = false;
  };

  const position = at(current);
  const cap = vertical ? { bottom: `calc(${position}% - 0.5rem)` } : { left: `calc(${position}% - 0.5rem)` };
  const fill = vertical ? { height: `${position}%` } : { width: `${position}%` };

  return (
    <div
      data-fader={orientation}
      className={cn('inline-flex gap-2 text-text-primary', vertical ? 'flex-col items-center' : 'flex-row items-center', disabled && 'opacity-50', className)}
    >
      <span className='text-xs font-medium text-text-secondary dark:text-text-primary'>{label}</span>
      <div
        className={cn(
          'flex gap-2',
          vertical ? 'flex-row items-stretch' : 'flex-col',
          // Room for the scale labels, which sit beside or below the track.
          marks?.length ? (vertical ? 'pl-8' : 'pb-5') : undefined
        )} style={vertical ? { height: length } : { width: length }}>
        <div
          role='slider'
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current}
          aria-valuetext={readout}
          aria-orientation={orientation}
          aria-disabled={disabled || undefined}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          style={vertical ? { height: length } : { width: length }}
          onDoubleClick={() => {
            if (!disabled && unityInRange) commit(unity);
          }}
          className={cn(
            'relative shrink-0 touch-none select-none rounded-[var(--radius-ui)] bg-text-primary/15',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-sea focus-visible:ring-offset-2 dark:focus-visible:ring-accent-blue',
            vertical ? 'w-3' : 'h-3',
            disabled ? 'cursor-not-allowed' : vertical ? 'cursor-ns-resize' : 'cursor-ew-resize'
          )}
        >
          <span data-fader='fill' className={cn('absolute rounded-[inherit] bg-sea dark:bg-accent-blue', vertical ? 'inset-x-0 bottom-0' : 'inset-y-0 left-0')} style={fill} />
          {unityInRange ? (
            <span
              data-fader='unity'
              aria-hidden='true'
              className={cn('absolute bg-text-primary/70', vertical ? '-inset-x-1 h-px' : '-inset-y-1 w-px')}
              style={vertical ? { bottom: `${at(unity)}%` } : { left: `${at(unity)}%` }}
            />
          ) : null}
          {(marks ?? []).map((mark) => {
            const { value: markValue, label: markLabel } = typeof mark === 'number' ? { value: mark, label: undefined } : mark;
            const placed = at(markValue);
            return (
              <span
                key={markValue}
                data-fader='mark'
                aria-hidden='true'
                className={cn(
                  'absolute whitespace-nowrap font-mono text-xs tabular-nums text-text-secondary dark:text-text-primary',
                  vertical ? 'right-full mr-2 translate-y-1/2' : 'top-full mt-2 -translate-x-1/2'
                )}
                style={vertical ? { bottom: `${placed}%` } : { left: `${placed}%` }}
              >
                {markLabel ?? String(Math.round(markValue))}
              </span>
            );
          })}
          <span
            data-fader='cap'
            aria-hidden='true'
            className={cn(
              'absolute rounded-sm border border-text-primary/40 bg-white shadow-sm transition-shadow duration-[var(--motion-control)] ease-premium dark:bg-dark-sand',
              vertical ? '-inset-x-1.5 h-4' : '-inset-y-1.5 w-4'
            )}
            style={cap}
          />
        </div>
        {meter ? (
          <Meter
            label={`${label} level`}
            min={min}
            max={max}
            unit={unit === 'db' ? 'dB' : '%'}
            orientation={orientation}
            value={meter.value}
            peak={meter.peak}
            hold={meter.hold}
            warnFrom={meter.warnFrom}
          />
        ) : null}
      </div>
      <output aria-hidden='true' className='font-mono text-xs tabular-nums text-text-secondary dark:text-text-primary'>
        {readout}
      </output>
    </div>
  );
}
