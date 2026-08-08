'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

import { Button } from './button';
import { cn } from '../utils/cn';
import { usePresence } from '../utils/hooks';

export interface AlertDialogProps {
  cancelLabel?: string;
  className?: string;
  confirmLabel?: string;
  confirmLoading?: boolean;
  description?: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  variant?: 'default' | 'destructive';
}

export function AlertDialog({
  cancelLabel = 'Cancel',
  className,
  confirmLabel = 'Continue',
  confirmLoading = false,
  description,
  isOpen,
  onCancel,
  onConfirm,
  title,
  variant = 'default'
}: AlertDialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  const { present, visible } = usePresence(isOpen, 150);

  React.useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!present || !dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (!isOpen && dialog.open) dialog.close();
    };
  }, [isOpen, present]);

  // Trap focus & handle keyboard dismissal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!confirmLoading) onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, confirmLoading]);

  if (typeof document === 'undefined' || !present) {
    return null;
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-state={visible ? 'open' : 'closing'}
      className={cn(
        'modal-motion m-auto w-full max-w-md rounded-[var(--radius-dialog)] border border-sand/30 bg-white p-0 text-text-primary shadow-[var(--shadow-overlay)] outline-none backdrop:bg-deep-sea/38 backdrop:backdrop-blur-[2px] dark:border-white/12 dark:bg-deep-sea dark:text-text-primary dark:backdrop:bg-black/65',
        className
      )}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onCancel();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!confirmLoading) onCancel();
      }}
      onClose={() => {
        if (isOpen) onCancel();
      }}
    >
      <div className='p-6 md:p-8'>
        <div className='mb-6 flex items-start gap-4'>
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[9px] border',
              variant === 'destructive'
                ? 'border-terracotta/15 bg-terracotta/[0.07] text-terracotta dark:bg-terracotta/15'
                : 'border-desert/15 bg-desert/[0.07] text-desert dark:bg-desert/15 dark:text-accent-gold'
            )}
          >
            <AlertTriangle size={20} />
          </div>
          <div className='min-w-0 flex-1'>
            <h2 id={titleId} className='text-xl font-medium leading-tight text-text-primary dark:text-text-primary'>{title}</h2>
            {description ? <p id={descriptionId} className='font-secondary mt-2 text-sm leading-relaxed text-text-secondary dark:text-text-secondary'>{description}</p> : null}
          </div>
        </div>
        <div className='flex justify-end gap-3 border-t border-sand/20 pt-5 dark:border-white/10'>
          <Button variant='secondary' size='sm' onClick={onCancel} disabled={confirmLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'destructive' ? 'destructive' : 'primary'} size='sm' onClick={onConfirm} disabled={confirmLoading}>
            {confirmLoading ? (
              <span className='flex items-center gap-2'>
                <Loader2 size={16} className='animate-spin' />
                {confirmLabel}
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
