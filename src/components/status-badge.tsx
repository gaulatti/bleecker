import type { StatusBadgeVariant } from '../core';
import { cn } from '../utils/cn';

export type { StatusBadgeVariant } from '../core';

export type StatusBadgeSize = 'sm' | 'md';

export interface StatusBadgeProps {
  /** Reaches the wrapper that holds the badge and its description, not the badge itself; use `size` for the text size. */
  className?: string;
  description?: string;
  label: string;
  /** `md` (default) is 12 px text, the console's minimum; `sm` keeps the earlier 11 px. */
  size?: StatusBadgeSize;
  variant?: StatusBadgeVariant;
}

const variantClasses: Record<StatusBadgeVariant, { badge: string; dot: string }> = {
  live: {
    badge: 'border-emerald-600/20 bg-emerald-600/[0.08] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300',
    dot: 'bg-emerald-500'
  },
  offline: {
    badge: 'border-terracotta/20 bg-terracotta/10 text-[#874641] dark:border-terracotta/20 dark:bg-terracotta/10 dark:text-terracotta',
    dot: 'bg-terracotta'
  },
  warning: {
    badge: 'border-desert/20 bg-desert/10 text-accent-text dark:border-desert/20 dark:bg-desert/10 dark:text-accent-text',
    dot: 'bg-desert'
  },
  info: {
    badge: 'bg-sea/10 border-sea/20 text-sea dark:bg-accent-blue/10 dark:border-accent-blue/20 dark:text-accent-blue',
    dot: 'bg-sea dark:bg-accent-blue'
  },
  default: {
    badge: 'bg-sand/20 border-sand/30 text-text-secondary dark:bg-sand/10 dark:border-sand/20 dark:text-text-secondary',
    dot: 'bg-text-secondary'
  }
};

const sizeClasses: Record<StatusBadgeSize, string> = {
  sm: 'min-h-6 text-[11px]',
  md: 'min-h-6 text-xs'
};

export function StatusBadge({ className, description, label, size = 'md', variant = 'default' }: StatusBadgeProps) {
  const { badge, dot } = variantClasses[variant];
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span data-size={size} className={cn('inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-0.5 font-semibold tracking-ui', sizeClasses[size], badge)}>
        <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
        {label}
      </span>
      {description ? <span className='text-xs text-text-secondary dark:text-text-secondary'>{description}</span> : null}
    </div>
  );
}
