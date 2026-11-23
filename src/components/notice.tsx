import { AlertTriangle, CheckCircle2, Info, OctagonAlert, X } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';
import { statusToneClasses } from '../utils/status-tones';

export type NoticeTone = 'info' | 'warn' | 'bad' | 'ok';

export interface NoticeProps {
  /** Right-aligned control, for example a Retry button. */
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** The label of the dismiss control. */
  dismissLabel?: string;
  /** Replaces the default icon of the tone. */
  icon?: React.ReactNode;
  /** The tone word shown before the message (default: Info, Warning, Error or Done), so colour never carries it alone. */
  label?: string;
  /** Shows a dismiss control when given. */
  onDismiss?: () => void;
  title?: string;
  tone: NoticeTone;
}

// The pill's dark `bad` text is 4.4:1 on a tinted card; a notice carries a sentence, so it lightens the text.
const toneText: Partial<Record<NoticeTone, string>> = {
  bad: 'dark:text-[color-mix(in_srgb,var(--color-terracotta),white_22%)]'
};

const defaults: Record<NoticeTone, { icon: React.ReactNode; label: string }> = {
  info: { icon: <Info size={16} />, label: 'Info' },
  warn: { icon: <AlertTriangle size={16} />, label: 'Warning' },
  bad: { icon: <OctagonAlert size={16} />, label: 'Error' },
  ok: { icon: <CheckCircle2 size={16} />, label: 'Done' }
};

/**
 * A persistent inline message for a card or a section: it stays in the layout until the condition
 * clears. `Alert` is the transient toast; `Notice` is the message that belongs to the content. An
 * `bad` notice announces as an alert, the others as a status.
 */
export function Notice({ action, children, className, dismissLabel = 'Dismiss', icon, label, onDismiss, title, tone }: NoticeProps) {
  const { icon: defaultIcon, label: defaultLabel } = defaults[tone];
  return (
    <div
      role={tone === 'bad' ? 'alert' : 'status'}
      data-tone={tone}
      className={cn('flex flex-wrap items-start gap-x-3 gap-y-2 rounded-[var(--radius-ui)] border px-3.5 py-2.5 text-sm', statusToneClasses[tone], toneText[tone], className)}
    >
      <span aria-hidden='true' className='mt-0.5 inline-flex shrink-0'>
        {icon ?? defaultIcon}
      </span>
      <div className='min-w-0 flex-1'>
        <p className='font-semibold'>
          {label ?? defaultLabel}
          {title ? <span className='font-semibold'>{` · ${title}`}</span> : null}
        </p>
        {children ? <div className='mt-0.5 font-normal'>{children}</div> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
      {onDismiss ? (
        <button
          type='button'
          aria-label={dismissLabel}
          onClick={onDismiss}
          className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-transparent opacity-80 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current'
        >
          <X size={14} aria-hidden='true' />
        </button>
      ) : null}
    </div>
  );
}
