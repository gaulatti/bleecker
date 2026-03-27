import { X } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';

export interface DialogCloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconSize?: number;
}

export const DialogCloseButton = React.forwardRef<HTMLButtonElement, DialogCloseButtonProps>(function DialogCloseButton(
  { className, iconSize = 20, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-full border-2 border-sea bg-white p-3 text-text-primary shadow-sm transition-all duration-400 hover:-translate-y-0.5 hover:bg-light-sand focus:outline-none focus-visible:ring-2 focus-visible:ring-sea focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-accent-blue dark:bg-dark-sand dark:text-text-primary dark:hover:bg-sand/20 dark:focus-visible:ring-accent-blue dark:focus-visible:ring-offset-dark-sand',
        className
      )}
      {...props}
    >
      <X size={iconSize} />
    </button>
  );
});
