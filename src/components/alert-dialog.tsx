import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

import { Button } from './button';
import { cn } from '../utils/cn';

export interface AlertDialogProps {
  cancelLabel?: string;
  className?: string;
  confirmLabel?: string;
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
  description,
  isOpen,
  onCancel,
  onConfirm,
  title,
  variant = 'default'
}: AlertDialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Trap focus & handle keyboard dismissal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (typeof document === 'undefined' || !isOpen) {
    return null;
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      className={cn(
        'm-auto w-full max-w-md rounded-[24px] border border-sand/10 bg-white p-0 text-text-primary shadow-xl outline-none backdrop:bg-black/50 backdrop:backdrop-blur-sm dark:border-sand/20 dark:bg-dark-sand dark:text-text-primary dark:backdrop:bg-black/70',
        className
      )}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onCancel();
        }
      }}
      onClose={onCancel}
    >
      <div className='p-6'>
        <div className='mb-4 flex items-start gap-4'>
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
              variant === 'destructive'
                ? 'bg-terracotta/10 text-terracotta dark:bg-terracotta/20'
                : 'bg-desert/10 text-desert dark:bg-desert/20 dark:text-accent-gold'
            )}
          >
            <AlertTriangle size={20} />
          </div>
          <div className='min-w-0 flex-1'>
            <h3 className='text-lg font-semibold leading-tight text-text-primary dark:text-text-primary'>{title}</h3>
            {description ? <p className='mt-1.5 text-sm leading-relaxed text-text-secondary dark:text-text-secondary'>{description}</p> : null}
          </div>
        </div>
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' size='sm' onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'destructive' ? 'destructive' : 'primary'} size='sm' onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
