import { ChevronDown, ChevronRight } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';

export interface AccordionItem {
  actions?: React.ReactNode;
  content: React.ReactNode;
  id: string;
  subtitle?: React.ReactNode;
  title: React.ReactNode;
}

export interface AccordionProps {
  className?: string;
  defaultExpandedId?: string | null;
  items: AccordionItem[];
}

export function Accordion({ className, defaultExpandedId = null, items }: AccordionProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(defaultExpandedId);

  return (
    <div className={cn('overflow-hidden rounded-xl border border-sand/10 bg-white shadow-sm dark:border-sand/20 dark:bg-sand/10', className)}>
      <ul className='divide-y divide-sand/10 dark:divide-sand/20'>
        {items.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <li key={item.id}>
              <div
                className='flex cursor-pointer items-center justify-between px-4 py-4 transition-colors hover:bg-sand/5 dark:hover:bg-sand/10 sm:px-6'
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className='flex min-w-0 items-center gap-3'>
                  {isExpanded ? (
                    <ChevronDown size={16} className='flex-shrink-0 text-text-secondary' />
                  ) : (
                    <ChevronRight size={16} className='flex-shrink-0 text-text-secondary' />
                  )}
                  <div className='min-w-0'>
                    <div className='text-sm font-medium text-text-primary dark:text-text-primary'>{item.title}</div>
                    {item.subtitle ? <div className='mt-0.5 text-xs text-text-secondary dark:text-text-secondary'>{item.subtitle}</div> : null}
                  </div>
                </div>
                {item.actions ? (
                  <div className='ml-4 flex items-center gap-2' onClick={(event) => event.stopPropagation()}>
                    {item.actions}
                  </div>
                ) : null}
              </div>
              {isExpanded ? <div className='bg-sand/5 dark:bg-sand/5'>{item.content}</div> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
