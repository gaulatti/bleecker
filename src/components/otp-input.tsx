import React from 'react';

import { cn } from '../utils/cn';

export interface OtpInputProps {
  className?: string;
  disabled?: boolean;
  /** Number of digits (default 6) */
  length?: number;
  onChange?: (value: string) => void;
  /** Whether to mask input like a password */
  secure?: boolean;
  value?: string;
}

export function OtpInput({ className, disabled = false, length = 6, onChange, secure = false, value = '' }: OtpInputProps) {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, '').slice(0, length).split('');

  const notify = (newDigits: string[]) => {
    onChange?.(newDigits.join('').replace(/\s/g, ''));
  };

  const handleChange = (index: number, char: string) => {
    const next = [...digits];
    // Accept only one digit at a time; handle paste below
    const clean = char.replace(/\D/g, '').slice(-1);
    next[index] = clean;
    notify(next);
    if (clean && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = ' ';
        notify(next);
      } else if (index > 0) {
        next[index - 1] = ' ';
        notify(next);
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = pasted.padEnd(length, ' ').split('');
    notify(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className={cn('flex items-center gap-2', className)} role='group' aria-label='One-time password input'>
      {Array.from({ length }, (_, i) => {
        const digit = digits[i]?.trim() ?? '';
        return (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type={secure ? 'password' : 'text'}
            inputMode='numeric'
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              'h-12 w-10 rounded-xl border bg-white text-center text-lg font-semibold tracking-widest text-text-primary caret-sea transition-all duration-200 outline-none dark:bg-dark-sand dark:text-text-primary dark:caret-accent-blue',
              digit ? 'border-sea dark:border-accent-blue' : 'border-sand/30 dark:border-sand/50',
              'focus:border-sea focus:ring-2 focus:ring-sea/30 dark:focus:border-accent-blue dark:focus:ring-accent-blue/30',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          />
        );
      })}
    </div>
  );
}
