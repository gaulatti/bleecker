import React from 'react';
import { createPortal } from 'react-dom';

import { DialogCloseButton } from './dialog-close-button';
import { cn } from '../utils/cn';

export interface ModalProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Modal({ children, className, isOpen, onClose, title }: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
      return;
    }

    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  if (typeof document === 'undefined' || !isOpen) {
    return null;
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      className={cn(
        'm-auto w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 ease-out-expo rounded-[var(--radius-card)] border-0 bg-white p-0 text-text-primary shadow-[0_16px_64px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] outline-none backdrop:bg-deep-sea/40 backdrop:backdrop-blur-md dark:bg-deep-sea dark:shadow-[0_16px_64px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.08)] dark:text-text-primary dark:backdrop:bg-black/70',
        className
      )}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
      onClose={onClose}
    >
      <div className='p-6 md:p-8'>
        <div className='mb-5 flex items-center justify-between gap-4'>
          <h3 className='text-2xl text-text-primary dark:text-text-primary'>{title}</h3>
          <DialogCloseButton onClick={onClose} aria-label='Close' />
        </div>
        <div>{children}</div>
      </div>
    </dialog>,
    document.body
  );
}
