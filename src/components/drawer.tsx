'use client';

import { Minus, X } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../utils/cn';
import { ModalLayerScope, useModalLayer, usePresence } from '../utils/hooks';

interface DrawerBaseProps {
  children: React.ReactNode;
  className?: string;
  description?: string;
  onClose: () => void;
  snapPoints?: string[];
  title?: string;
}

/** The bottom sheet (the default): a modal overlay that holds focus. */
export interface DrawerSheetProps extends DrawerBaseProps {
  variant?: 'sheet';
  isOpen: boolean;
}

/**
 * `variant="detail"` (bleecker#549): a panel docked beside a list, with no
 * overlay and no focus trap, so focus stays in the list. `open` (or `isOpen`)
 * shows it; `width` defaults to 22rem.
 */
export interface DrawerDetailProps extends DrawerBaseProps {
  variant: 'detail';
  open?: boolean;
  isOpen?: boolean;
  width?: string;
}

export type DrawerProps = DrawerSheetProps | DrawerDetailProps;

export function Drawer(props: DrawerProps) {
  if (props.variant === 'detail') return <DetailDrawer {...props} />;
  return <SheetDrawer {...props} />;
}

function DetailDrawer({ children, className, description, onClose, open, isOpen, title, width = '22rem' }: DrawerDetailProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  if (!(open ?? isOpen)) return null;
  return (
    <aside
      data-bleecker-drawer='detail'
      aria-label={title ? undefined : 'Details'}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      style={{ width }}
      className={cn(
        'flex h-full min-h-0 shrink-0 flex-col border-l border-sand/25 bg-white dark:border-white/10 dark:bg-deep-sea',
        className
      )}
    >
      <div className='flex items-start gap-3 border-b border-sand/20 px-5 py-4 dark:border-white/[0.07]'>
        <div className='min-w-0 flex-1'>
          {title ? <h2 id={titleId} className='truncate text-base font-medium text-text-primary dark:text-text-primary'>{title}</h2> : null}
          {description ? <p id={descriptionId} className='font-secondary mt-1 text-sm text-text-secondary dark:text-text-secondary'>{description}</p> : null}
        </div>
        <button
          type='button'
          onClick={onClose}
          aria-label='Close details'
          className='-mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-button)] text-text-secondary transition-colors duration-[var(--motion-control)] ease-premium hover:bg-light-sand/60 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea/45 dark:hover:bg-white/[0.06]'
        >
          <X size={16} aria-hidden='true' />
        </button>
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto px-5 py-4'>{children}</div>
    </aside>
  );
}

function SheetDrawer({ children, className, description, isOpen, onClose, title }: DrawerSheetProps) {
  const { present, visible } = usePresence(isOpen, 180);
  const startYRef = React.useRef<number | null>(null);
  const panelRef = useModalLayer<HTMLDivElement>(isOpen, onClose);
  const titleId = React.useId();
  const descriptionId = React.useId();

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - startYRef.current;
    startYRef.current = null;
    if (delta > 60) onClose();
  };

  if (typeof document === 'undefined' || !present) return null;

  return createPortal(
    <ModalLayerScope layerRef={panelRef}><div data-bleecker-modal-overlay className={cn('fixed inset-0 z-50', !isOpen && 'pointer-events-none')} aria-hidden={!isOpen || undefined}>
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-deep-sea/38 backdrop-blur-[2px] transition-opacity ease-premium dark:bg-black/65',
          visible ? 'duration-[var(--motion-overlay)]' : 'duration-[180ms] ease-in',
          visible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden='true'
      />
      {/* Panel */}
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-label={title ? undefined : 'Dialog'}
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-[var(--radius-dialog)] border-t border-sand/30 bg-white shadow-[var(--shadow-overlay)] transition-transform dark:border-white/12 dark:bg-deep-sea',
          visible ? 'duration-[var(--motion-overlay)] ease-premium' : 'duration-[180ms] ease-in',
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
            {title ? <h2 id={titleId} className='text-lg font-medium text-text-primary dark:text-text-primary'>{title}</h2> : null}
            {description ? <p id={descriptionId} className='font-secondary mt-2 text-sm leading-relaxed text-text-secondary dark:text-text-secondary'>{description}</p> : null}
          </div>
        )}
        <div className='flex-1 overflow-y-auto px-6 pb-6 pt-0'>{children}</div>
      </div>
    </div></ModalLayerScope>,
    document.body
  );
}
