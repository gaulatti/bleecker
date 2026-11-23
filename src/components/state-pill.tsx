import { cn } from '../utils/cn';
import { statusToneClasses } from '../utils/status-tones';

export type StatePillTone = 'live' | 'ok' | 'warn' | 'bad' | 'arm' | 'info' | 'idle';

export interface StatePillProps {
  className?: string;
  /** The state, in words. Colour alone never carries it. */
  label: string;
  /** Pulses the dot (a live state). Respects reduced motion. */
  pulse?: boolean;
  title?: string;
  tone: StatePillTone;
}

const toneClasses: Record<StatePillTone, string> = statusToneClasses;

/**
 * A state as a dot and a label: the compact status of a row, a strip or a header. StatusBadge stays
 * exported with its current variants; StatePill is its successor with the tones of the console's
 * dense surfaces (on air, ready, measuring, failed, armed).
 */
export function StatePill({ className, label, pulse = false, title, tone }: StatePillProps) {
  return (
    <span
      data-tone={tone}
      title={title}
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-[11px] font-semibold tracking-ui',
        toneClasses[tone],
        className
      )}
    >
      <i aria-hidden='true' className={cn('h-1.5 w-1.5 rounded-full bg-current', pulse && 'motion-safe:animate-pulse')} />
      {label}
    </span>
  );
}
