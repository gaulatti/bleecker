import React from 'react';

import { cn } from '../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-sea text-white hover:opacity-90 border-transparent shadow-sm',
  secondary:
    'bg-white/65 text-text-primary border-sand/20 hover:bg-white shadow-[0_2px_8px_rgba(26,55,77,0.04)] dark:bg-sand/10 dark:text-text-primary dark:border-sand/30 dark:hover:bg-sand/20',
  ghost: 'bg-transparent text-text-primary border-transparent hover:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/15',
  destructive: 'bg-terracotta text-white hover:opacity-90 border-transparent shadow-sm'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, size = 'md', type = 'button', variant = 'primary', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] border font-[family-name:var(--font-header)] font-medium tracking-ui transition-all duration-200 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-sea disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-deep-sea dark:focus-visible:ring-accent-blue',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
