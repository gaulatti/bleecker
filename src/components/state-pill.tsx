import { cn } from '../utils/cn';
import { statusToneClasses } from '../utils/status-tones';

export type StatePillSize = 'sm' | 'md';
export type StatePillTone = 'live' | 'ok' | 'warn' | 'bad' | 'arm' | 'info' | 'idle';

export interface StatePillProps {
  className?: string;
  /** The state, in words. Colour alone never carries it. */
  label: string;
  /** Pulses the dot (a live state). Respects reduced motion. */
  pulse?: boolean;
  /** `md` (default) is 12 px text, the console's minimum; `sm` keeps the earlier 11 px for dense surfaces that are not console text. */
  size?: StatePillSize;
  title?: string;
  tone: StatePillTone;
}

const toneClasses: Record<StatePillTone, string> = statusToneClasses;
const sizeClasses: Record<StatePillSize, string> = {
  sm: 'h-[22px] text-[11px]',
  md: 'h-6 text-xs'
};

/**
 * A state as a dot and a label: the compact status of a row, a strip or a header. StatusBadge stays
 * exported with its current variants; StatePill is its successor with the tones of the console's
 * dense surfaces (on air, ready, measuring, failed, armed).
 */
export function StatePill({ className, label, pulse = false, size = 'md', title, tone }: StatePillProps) {
  return (
    <span
      data-tone={tone}
      data-size={size}
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 font-semibold tracking-ui',
        sizeClasses[size],
        toneClasses[tone],
        className
      )}
    >
      <i aria-hidden='true' className={cn('h-1.5 w-1.5 rounded-full bg-current', pulse && 'motion-safe:animate-pulse')} />
      {label}
    </span>
  );
}
