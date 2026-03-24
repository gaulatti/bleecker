import { Minus } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../utils/cn';

export interface DrawerProps {
  children: React.ReactNode;
  className?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: string[];
  title?: string;
}

export function Drawer({ children, className, description, isOpen, onClose, title }: DrawerProps) {
  const [visible, setVisible] = React.useState(false);
  const startYRef = React.useRef<number | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - startYRef.current;
    startYRef.current = null;
    if (delta > 60) onClose();
  };

  if (typeof document === 'undefined' || !isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50'>
      {/* Backdrop */}
      <div
        className={cn('absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
        aria-hidden='true'
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-label={title}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-3xl border-t border-sand/10 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-sand/20 dark:bg-dark-sand',
          visible ? 'translate-y-0' : 'translate-y-full',
          className
        )}
      >
        {/* Drag handle */}
        <div className='flex items-center justify-center pt-3 pb-1'>
          <Minus size={24} className='text-sand/40 dark:text-sand/50' strokeWidth={3} aria-hidden='true' />
        </div>
        {(title || description) && (
          <div className='px-6 pb-4 pt-1'>
            {title ? <h2 className='text-base font-semibold text-text-primary dark:text-text-primary'>{title}</h2> : null}
            {description ? <p className='mt-0.5 text-sm text-text-secondary dark:text-text-secondary'>{description}</p> : null}
          </div>
        )}
        <div className='flex-1 overflow-y-auto px-6 pb-6 pt-0'>{children}</div>
      </div>
    </div>,
    document.body
  );
}
