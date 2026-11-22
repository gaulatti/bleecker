import { cn } from '../utils/cn';

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

const toneClasses: Record<StatePillTone, string> = {
  live: 'border-accent-red bg-accent-red text-white',
  ok: 'border-emerald-600/30 bg-emerald-600/[0.08] text-emerald-700 dark:border-emerald-400/35 dark:bg-emerald-400/10 dark:text-emerald-300',
  warn: 'border-desert/35 bg-desert/10 text-accent-text dark:border-desert/35 dark:bg-desert/10 dark:text-accent-text',
  bad: 'border-terracotta/40 bg-terracotta/10 text-[#874641] dark:border-terracotta/40 dark:bg-terracotta/10 dark:text-terracotta',
  arm: 'border-accent-text bg-transparent text-accent-text dark:border-accent-yellow dark:text-accent-yellow',
  info: 'border-sea/30 bg-sea/10 text-sea dark:border-accent-blue/35 dark:bg-accent-blue/10 dark:text-accent-blue',
  idle: 'border-sand/40 bg-transparent text-text-secondary dark:border-sand/40 dark:text-text-secondary'
};

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
