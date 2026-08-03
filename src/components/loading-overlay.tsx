import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../utils/cn';
import { LoadingSpinner } from './loading-spinner';

export interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
  className?: string;
  overlayClassName?: string;
}

export function LoadingOverlay({ visible, label = 'Loading...', className, overlayClassName }: LoadingOverlayProps) {
  if (!visible || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        overlayClassName
      )}
    >
      <div className={cn('flex flex-col items-center gap-3 rounded-[var(--radius-card)] bg-card p-6 shadow-lg ring-1 ring-border', className)}>
        <LoadingSpinner size='lg' />
        {label && <p className='text-sm font-medium text-text-primary dark:text-text-primary'>{label}</p>}
      </div>
    </div>,
    document.body
  );
}
