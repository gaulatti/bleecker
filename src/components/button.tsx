import React from 'react';

import { cn } from '../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-sea text-white hover:bg-desert border-transparent',
  secondary: 'bg-white/65 text-text-primary border-sand/20 hover:bg-white dark:bg-sand/20 dark:text-text-primary dark:border-sand/50 dark:hover:bg-sand/30',
  ghost: 'bg-transparent text-text-primary border-transparent hover:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/15',
  destructive: 'bg-terracotta text-white hover:opacity-90 border-transparent'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base'
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
        'inline-flex items-center justify-center gap-2 rounded-full border font-[family-name:var(--font-header)] font-medium tracking-refined transition-all duration-400 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sea disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-accent-blue',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
