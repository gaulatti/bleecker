import React from 'react';

import { cn } from '../utils/cn';

export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  offsetHeader?: boolean;
}

export function AppShell({ children, className, contentClassName, footer, header, offsetHeader = true }: AppShellProps) {
  return (
    <div className={cn('min-h-screen flex flex-col bg-light-sand text-text-primary dark:bg-deep-sea dark:text-text-primary', className)}>
      {header}
      <main className={cn('flex-1 flex flex-col min-h-0', offsetHeader && 'pt-20', contentClassName)}>
        <div className='flex-1 flex flex-col min-h-0'>{children}</div>
      </main>
      {footer}
    </div>
  );
}
