import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

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
          <button
            type='button'
            onClick={onCancel}
            className='inline-flex items-center justify-center rounded-full border border-sand/20 bg-white/65 px-4 py-2 text-sm font-medium tracking-refined text-text-primary transition-all duration-400 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sea dark:border-sand/50 dark:bg-sand/20 dark:text-text-primary dark:hover:bg-sand/30 dark:focus-visible:ring-accent-blue'
          >
            {cancelLabel}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className={cn(
              'inline-flex items-center justify-center rounded-full border-transparent px-4 py-2 text-sm font-medium tracking-refined text-white transition-all duration-400 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sea disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-accent-blue',
              variant === 'destructive' ? 'bg-terracotta hover:opacity-90' : 'bg-sea hover:bg-desert'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}
