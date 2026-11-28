import React from 'react';

export interface LowerThirdProps {
  /** The line shown on the bar; empty or missing shows 'Lower Third'. */
  text?: string;
}

/** The generic program lower third: a blue bar across the foot of the frame with one bold line. */
export const LowerThird: React.FC<LowerThirdProps> = ({ text }) => {
  return (
    <div className='absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center px-16'>
      <div className='text-white'>
        <div className='text-5xl font-bold'>{text || 'Lower Third'}</div>
      </div>
    </div>
  );
};
