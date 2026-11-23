import React from 'react';

export interface CronicaReiteramosProps {
  /** The line shown; the Crónica reiteramos text when not given. */
  text?: string;
  /** Hides the overlay when false. */
  show?: boolean;
}

/** The Crónica "reiteramos" overlay: a repeat line set over the program. */
export const CronicaReiteramos: React.FC<CronicaReiteramosProps> = ({ text = 'REITERAMOS', show = true }) => {
  if (!show) return null;

  return (
    <div className='cronica-layer'>
      <div className='cronica-safe-area'>
        <div className='cronica-reiteramos'>{text}</div>
      </div>
    </div>
  );
};
