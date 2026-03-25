import { cn } from '../utils/cn';

export type StatusBadgeVariant = 'live' | 'offline' | 'warning' | 'info' | 'default';

export interface StatusBadgeProps {
  className?: string;
  description?: string;
  label: string;
  variant?: StatusBadgeVariant;
}

const variantClasses: Record<StatusBadgeVariant, { badge: string; dot: string }> = {
  live: {
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
    dot: 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2),0_0_8px_rgba(16,185,129,0.4)]'
  },
  offline: {
    badge: 'bg-red-500/10 border-red-500/20 text-red-500 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
    dot: 'bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2),0_0_8px_rgba(239,68,68,0.4)]'
  },
  warning: {
    badge: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
    dot: 'bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.2),0_0_8px_rgba(245,158,11,0.4)]'
  },
  info: {
    badge: 'bg-sea/10 border-sea/20 text-sea dark:bg-accent-blue/10 dark:border-accent-blue/20 dark:text-accent-blue',
    dot: 'bg-sea dark:bg-accent-blue shadow-[0_0_0_2px_rgba(44,87,132,0.2),0_0_8px_rgba(44,87,132,0.4)]'
  },
  default: {
    badge: 'bg-sand/20 border-sand/30 text-text-secondary dark:bg-sand/10 dark:border-sand/20 dark:text-text-secondary',
    dot: 'bg-text-secondary'
  }
};

export function StatusBadge({ className, description, label, variant = 'default' }: StatusBadgeProps) {
  const { badge, dot } = variantClasses[variant];
  const animate = variant === 'live' || variant === 'offline' || variant === 'warning';

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider', badge)}>
        <span className={cn('h-2 w-2 rounded-full', animate && 'animate-pulse', dot)} />
        {label}
      </span>
      {description ? <span className='text-xs text-text-secondary dark:text-text-secondary'>{description}</span> : null}
    </div>
  );
}
