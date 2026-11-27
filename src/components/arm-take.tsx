import React from 'react';

import { cn } from '../utils/cn';

export interface ArmTakeProps {
  className?: string;
  disabled?: boolean;
  /** How long a hold takes to confirm. */
  holdMs?: number;
  label: string;
  /** Called when the take is confirmed: a hold of `holdMs`, or a second press while armed. */
  onTake: () => void;
  /** How long an armed control waits for the second press before it disarms itself. */
  armTimeoutMs?: number;
  /**
   * What the armed control says it will do on the second press, for an action that is not a take (for example
   * "Press again to fade"). It replaces the visible text, the accessible name's tail and the announcement, so none of
   * them says "take". Defaults to "Press again to take".
   */
  armedLabel?: string;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * A control that cannot fire by accident: hold it for `holdMs` (a fill shows the progress), or
 * press it twice (the first press arms it, the second takes). A single click never takes. With
 * reduced motion there is no fill and no hold, only the two presses. Esc disarms.
 */
export function ArmTake({ armTimeoutMs = 5_000, armedLabel, className, disabled = false, holdMs = 800, label, onTake }: ArmTakeProps) {
  const [armed, setArmed] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const frame = React.useRef<number | null>(null);
  const startedAt = React.useRef<number | null>(null);
  // The click that follows a completed hold must not arm the control again.
  const heldConfirmed = React.useRef(false);
  const armTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const take = React.useRef(onTake);
  take.current = onTake;

  const clearTimer = React.useCallback(() => {
    if (armTimer.current) clearTimeout(armTimer.current);
    armTimer.current = null;
  }, []);

  const disarm = React.useCallback(() => {
    clearTimer();
    setArmed(false);
  }, [clearTimer]);

  const stopHold = React.useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    startedAt.current = null;
    setProgress(0);
  }, []);

  const confirm = React.useCallback(() => {
    clearTimer();
    setArmed(false);
    take.current();
  }, [clearTimer]);

  const arm = React.useCallback(() => {
    clearTimer();
    setArmed(true);
    armTimer.current = setTimeout(() => setArmed(false), armTimeoutMs);
  }, [armTimeoutMs, clearTimer]);

  React.useEffect(
    () => () => {
      clearTimer();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [clearTimer]
  );

  const tick = React.useCallback(
    (now: number) => {
      if (startedAt.current === null) return;
      const ratio = Math.min(1, (now - startedAt.current) / holdMs);
      setProgress(ratio);
      if (ratio >= 1) {
        frame.current = null;
        startedAt.current = null;
        setProgress(0);
        heldConfirmed.current = true;
        confirm();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    },
    [confirm, holdMs]
  );

  const onPointerDown = () => {
    if (disabled || prefersReducedMotion() || startedAt.current !== null) return;
    startedAt.current = performance.now();
    frame.current = requestAnimationFrame(tick);
  };

  const onClick = () => {
    if (heldConfirmed.current) {
      heldConfirmed.current = false;
      return;
    }
    if (armed) confirm();
    else arm();
  };

  return (
    <button
      type='button'
      disabled={disabled}
      aria-label={armed ? (armedLabel ? `${label}: armed. ${armedLabel}` : `${label}: armed, press again to take`) : label}
      data-armed={armed}
      onPointerDown={onPointerDown}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      onBlur={() => {
        stopHold();
        disarm();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && armed) {
          event.preventDefault();
          disarm();
        }
      }}
      onClick={onClick}
      className={cn(
        'relative inline-flex h-9 select-none items-center gap-2 overflow-hidden rounded-[var(--radius-button)] border px-4 text-xs font-bold uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-sea disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-accent-blue',
        armed ? 'border-accent-red bg-accent-red text-white' : 'border-accent-text text-accent-text dark:border-accent-yellow dark:text-accent-yellow',
        className
      )}
    >
      <span aria-hidden='true' data-arm-fill className='absolute inset-y-0 left-0 bg-accent-red/70' style={{ width: `${progress * 100}%` }} />
      <span className='relative'>{armed ? (armedLabel ?? 'Press again to take') : label}</span>
      <span role='status' className='sr-only'>
        {armed ? (armedLabel ? `Armed. ${armedLabel}.` : 'Armed. Press again within the time shown to take.') : ''}
      </span>
    </button>
  );
}
