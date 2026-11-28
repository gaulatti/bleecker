import React from 'react';

export interface FadeToBlackProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'> {
  /** True covers the program in black; false leaves it clear. */
  active: boolean;
  /**
   * True fades between the two states over one second. Pass false for the first state the program
   * shows, so a page that loads already faded starts black instead of fading in.
   */
  animate: boolean;
}

/** A full black frame over the whole program, above every scene layer (z-index 2000). */
export const FadeToBlack: React.FC<FadeToBlackProps> = ({ active, animate, ...rest }) => {
  return (
    <div
      data-fade-to-black={active ? 'active' : 'inactive'}
      {...rest}
      className='pointer-events-none absolute inset-0 z-[2000] bg-black'
      style={{
        opacity: active ? 1 : 0,
        transition: animate ? 'opacity 1000ms linear' : 'none'
      }}
    />
  );
};
