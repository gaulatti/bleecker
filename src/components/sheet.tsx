import { X } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

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
      requestAnimationFrame(() => setVisible(true));
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
          'absolute flex flex-col border border-sand/10 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-sand/20 dark:bg-dark-sand',
          panel,
          visible ? enter : leave,
          (side === 'left' || side === 'right') && 'rounded-none',
          side === 'top' && 'rounded-b-2xl',
          side === 'bottom' && 'rounded-t-2xl',
          className
        )}
      >
        <div className='flex items-center justify-between border-b border-sand/10 px-6 py-4 dark:border-sand/20'>
          <div>
            {title ? <h2 className='text-base font-semibold text-text-primary dark:text-text-primary'>{title}</h2> : null}
            {description ? <p className='mt-0.5 text-sm text-text-secondary dark:text-text-secondary'>{description}</p> : null}
          </div>
          <button
            type='button'
            onClick={onClose}
            className='inline-flex items-center justify-center rounded-full p-2 text-text-secondary transition-colors duration-200 hover:bg-sand/10 hover:text-text-primary dark:text-text-secondary dark:hover:bg-sand/20 dark:hover:text-text-primary'
            aria-label='Close'
          >
            <X size={18} />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto p-6'>{children}</div>
      </div>
    </div>,
    document.body
  );
}
