import { Info } from 'lucide-react';

import { cn } from '../utils/cn';

export interface FieldHelpTooltipProps {
  className?: string;
  text: string;
}

export function FieldHelpTooltip({ className, text }: FieldHelpTooltipProps) {
  if (!text.trim()) {
    return null;
  }

  return (
    <span className={cn('group relative inline-flex items-center align-middle', className)}>
      <button
        type='button'
        tabIndex={0}
        aria-label={text}
        title={text}
        className='inline-flex h-4 w-4 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-sea dark:focus:ring-accent-blue'
      >
        <Info size={14} />
      </button>
      <span className='pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-64 -translate-x-1/2 rounded-lg bg-dark-sand px-3 py-2 text-left text-xs font-normal leading-relaxed text-white shadow-xl group-hover:block group-focus-within:block'>
        {text}
      </span>
    </span>
  );
}
