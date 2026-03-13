import React from 'react';

import { cn } from '../utils/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ className, type = 'button', ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-2.5 border border-sand/20 dark:border-sand/70 bg-white/35 dark:bg-sand/25 backdrop-blur-md shadow-sm transition-all duration-400 hover:-translate-y-0.5 hover:scale-105 hover:bg-white/55 dark:hover:bg-sand/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-sea dark:focus-visible:ring-accent-blue',
        className
      )}
      {...props}
    />
  );
});
