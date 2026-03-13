import React from 'react';

import { cn } from '../utils/cn';

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeader({ className, description, eyebrow, title, ...props }: SectionHeaderProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {eyebrow ? <p className='text-sm uppercase tracking-elegant text-desert'>{eyebrow}</p> : null}
      <div className='space-y-2'>
        <h2 className='text-3xl font-semibold text-text-primary dark:text-text-primary'>{title}</h2>
        {description ? <p className='max-w-2xl text-base leading-relaxed text-text-secondary dark:text-text-secondary'>{description}</p> : null}
      </div>
    </div>
  );
}
