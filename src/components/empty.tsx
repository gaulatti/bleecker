import React from 'react';

import { cn } from '../utils/cn';

export interface EmptyProps {
  action?: React.ReactNode;
  className?: string;
  description?: string;
  icon?: React.ReactNode;
  title: string;
}

const DefaultIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none' className='h-full w-full' aria-hidden='true'>
    <rect x='8' y='16' width='48' height='36' rx='6' stroke='currentColor' strokeWidth='2' />
    <path d='M8 28h48' stroke='currentColor' strokeWidth='2' />
    <path d='M24 40h16' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
  </svg>
);

export function Empty({ action, className, description, icon, title }: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-black/5 bg-light-sand/30 px-6 py-16 text-center dark:border-white/10 dark:bg-deep-sea/30',
        className
      )}
    >
      <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-text-secondary shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/5 dark:bg-deep-sea dark:text-text-primary dark:ring-white/10'>
        {icon ?? (
          <span className='h-8 w-8 text-sea dark:text-accent-blue'>
            <DefaultIcon />
          </span>
        )}
      </div>
      <div className='space-y-1.5'>
        <h3 className='text-base font-semibold text-text-primary dark:text-text-primary'>{title}</h3>
        {description ? <p className='max-w-xs text-sm leading-relaxed text-text-secondary dark:text-text-secondary'>{description}</p> : null}
      </div>
      {action ? <div className='mt-1'>{action}</div> : null}
    </div>
  );
}
