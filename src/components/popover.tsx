import React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '../utils/cn';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  align?: PopoverAlign;
  children: React.ReactNode;
  className?: string;
  content: React.ReactNode;
  /** Controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: PopoverSide;
}

export function Popover({ align = 'center', children, className, content, onOpenChange, open: controlledOpen, side = 'bottom' }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };

  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });

  const reposition = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scroll = { x: window.scrollX, y: window.scrollY };

    let top = 0;
    let left = 0;
    const panelW = panelRef.current?.offsetWidth ?? 220;
    const panelH = panelRef.current?.offsetHeight ?? 100;
    const gap = 8;

    if (side === 'bottom') top = rect.bottom + scroll.y + gap;
    if (side === 'top') top = rect.top + scroll.y - panelH - gap;
    if (side === 'left') {
      top = rect.top + scroll.y;
      left = rect.left + scroll.x - panelW - gap;
    }
    if (side === 'right') {
      top = rect.top + scroll.y;
      left = rect.right + scroll.x + gap;
    }

    if (side === 'bottom' || side === 'top') {
      if (align === 'start') left = rect.left + scroll.x;
      else if (align === 'end') left = rect.right + scroll.x - panelW;
      else left = rect.left + scroll.x + rect.width / 2 - panelW / 2;
    }
    if (side === 'left' || side === 'right') {
      if (align === 'start') top = rect.top + scroll.y;
      else if (align === 'end') top = rect.bottom + scroll.y - panelH;
      else top = rect.top + scroll.y + rect.height / 2 - panelH / 2;
    }

    setCoords({ top, left });
  }, [side, align]);

  React.useEffect(() => {
    if (!isOpen) return;
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [isOpen, reposition]);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) && !panelRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const panel =
    isOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={panelRef}
            role='dialog'
            className={cn(
              'absolute z-50 min-w-[14rem] rounded-[var(--radius-card)] border-0 ring-1 ring-black/5 bg-white/95 backdrop-blur-xl p-1 shadow-[0_8px_32px_rgba(0,0,0,0.08)] outline-none dark:ring-white/10 dark:bg-deep-sea/95 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
              'animate-in fade-in-0 zoom-in-95 duration-200 ease-out-expo',
              className
            )}
            style={{ top: coords.top, left: coords.left }}
          >
            {content}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <span ref={triggerRef} className='inline-flex' onClick={() => setOpen(!isOpen)}>
        {children}
      </span>
      {panel}
    </>
  );
}
