import React from 'react';
import { createPortal } from 'react-dom';

import { DialogCloseButton } from './dialog-close-button';
import { cn } from '../utils/cn';

export type SheetSide = 'left' | 'right' | 'top' | 'bottom';

export interface SheetProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  side?: SheetSide;
  title?: string;
  description?: string;
}

const sideStyles: Record<SheetSide, { panel: string; enter: string; leave: string }> = {
  right: {
    panel: 'inset-y-0 right-0 h-full w-full max-w-sm',
    enter: 'translate-x-0',
    leave: 'translate-x-full'
  },
  left: {
    panel: 'inset-y-0 left-0 h-full w-full max-w-sm',
    enter: 'translate-x-0',
    leave: '-translate-x-full'
  },
  top: {
    panel: 'inset-x-0 top-0 w-full',
    enter: 'translate-y-0',
    leave: '-translate-y-full'
  },
  bottom: {
    panel: 'inset-x-0 bottom-0 w-full',
    enter: 'translate-y-0',
    leave: 'translate-y-full'
  }
};

export function Sheet({ children, className, description, isOpen, onClose, side = 'right', title }: SheetProps) {
  const [visible, setVisible] = React.useState(false);
  const { panel, enter, leave } = sideStyles[side];

  React.useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (typeof document === 'undefined' || !isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex'>
      {/* Backdrop */}
      <div
        className={cn('absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
        aria-hidden='true'
      />
      {/* Panel */}
      <div
        role='dialog'
        aria-modal='true'
        aria-label={title}
        className={cn(
          'absolute flex flex-col border border-sand/10 bg-white text-text-primary shadow-2xl outline-none transition-transform duration-300 ease-in-out dark:border-sand/20 dark:bg-dark-sand dark:text-text-primary',
          panel,
          visible ? enter : leave,
          (side === 'left' || side === 'right') && 'rounded-none',
          side === 'top' && 'rounded-b-2xl',
          side === 'bottom' && 'rounded-t-2xl',
          className
        )}
      >
        <div className='flex flex-1 flex-col p-6 md:p-8'>
          {title || description ? (
            <div className='mb-5 flex items-start justify-between gap-4'>
              <div className='min-w-0 flex-1'>
                {title ? <h2 className='text-2xl text-text-primary dark:text-text-primary'>{title}</h2> : null}
                {description ? <p className='mt-1.5 text-sm leading-relaxed text-text-secondary dark:text-text-secondary'>{description}</p> : null}
              </div>
              <DialogCloseButton onClick={onClose} aria-label='Close' />
            </div>
          ) : (
            <div className='mb-5 flex justify-end'>
              <DialogCloseButton onClick={onClose} aria-label='Close' />
            </div>
          )}
          <div className='flex-1 overflow-y-auto'>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
