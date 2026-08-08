'use client';

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
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = React.useId();
  const [isPresent, setIsPresent] = React.useState(isOpen);
  const [motionState, setMotionState] = React.useState<'opening' | 'open' | 'closing'>(isOpen ? 'opening' : 'closing');

  React.useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setIsPresent(true);
      setMotionState('opening');
      return;
    }

    if (isPresent) {
      setMotionState('closing');
      closeTimerRef.current = setTimeout(() => {
        dialogRef.current?.close();
        setIsPresent(false);
      }, 150);
    }
  }, [isOpen, isPresent]);

  React.useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!isPresent || !isOpen || !dialog) return;

    if (!dialog.open) dialog.showModal();
    openTimerRef.current = setTimeout(() => setMotionState('open'), 20);

    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
    };
  }, [isOpen, isPresent]);

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      dialogRef.current?.close();
    };
  }, []);

  const requestClose = () => {
    if (motionState !== 'closing') onClose();
  };

  if (typeof document === 'undefined' || !isPresent) {
    return null;
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-state={motionState}
      className={cn(
        'modal-motion m-auto w-full max-w-xl rounded-[var(--radius-dialog)] border border-sand/30 bg-white p-0 text-text-primary shadow-[var(--shadow-overlay)] outline-none backdrop:bg-deep-sea/38 backdrop:backdrop-blur-[2px] dark:border-white/12 dark:bg-deep-sea dark:text-text-primary dark:backdrop:bg-black/65',
        className
      )}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          requestClose();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={() => {
        if (isOpen) onClose();
      }}
    >
      <div>
        <div className='flex items-center justify-between gap-4 border-b border-sand/20 px-6 py-5 dark:border-white/[0.08] md:px-7'>
          <h2 id={titleId} className='text-xl font-semibold tracking-refined text-text-primary dark:text-text-primary'>{title}</h2>
          <DialogCloseButton onClick={requestClose} aria-label='Close' />
        </div>
        <div className='px-6 py-6 md:px-7 md:py-7'>{children}</div>
      </div>
    </dialog>,
    document.body
  );
}
