/**
 * The colour classes of a status tone, shared by `StatePill` and `Notice` so the two never drift.
 * `StatePill` keeps its seven tones; `Notice` uses `ok`, `warn`, `bad` and `info`.
 */
export const statusToneClasses = {
  live: 'border-accent-red bg-accent-red text-white',
  ok: 'border-emerald-600/30 bg-emerald-600/[0.08] text-emerald-700 dark:border-emerald-400/35 dark:bg-emerald-400/10 dark:text-emerald-300',
  warn: 'border-desert/35 bg-desert/10 text-accent-text dark:border-desert/35 dark:bg-desert/10 dark:text-accent-text',
  bad: 'border-terracotta/40 bg-terracotta/10 text-[color-mix(in_srgb,var(--color-terracotta),var(--color-text-primary)_35%)] dark:border-terracotta/40 dark:bg-terracotta/10 dark:text-terracotta',
  arm: 'border-accent-text bg-transparent text-accent-text dark:border-accent-yellow dark:text-accent-yellow',
  info: 'border-sea/30 bg-sea/10 text-sea dark:border-accent-blue/35 dark:bg-accent-blue/10 dark:text-accent-blue',
  idle: 'border-sand/40 bg-transparent text-text-secondary dark:border-sand/40 dark:text-text-secondary'
} as const;

export type StatusTone = keyof typeof statusToneClasses;
