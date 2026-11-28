import React from 'react';

export interface FullScreenProps {
  /** The centred title; empty or missing shows 'Full Screen'. */
  text?: string;
}

/** The generic program full-screen card: a purple-to-blue frame with one large centred title. */
export const FullScreen: React.FC<FullScreenProps> = ({ text }) => {
  return (
    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900'>
      <div className='text-white text-8xl font-bold text-center px-16'>{text || 'Full Screen'}</div>
    </div>
  );
};
