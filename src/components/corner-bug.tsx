import React from 'react';

export interface CornerBugProps {
  /** The bug's label; empty or missing shows 'LIVE'. */
  text?: string;
}

/** The generic program corner bug: a red label in the top-right corner of the frame. */
export const CornerBug: React.FC<CornerBugProps> = ({ text }) => {
  return (
    <div className='absolute top-8 right-8 bg-red-600 text-white px-8 py-4 rounded-lg shadow-2xl'>
      <div className='text-3xl font-bold'>{text || 'LIVE'}</div>
    </div>
  );
};
