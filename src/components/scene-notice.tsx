import React from 'react';

export interface SceneNoticeProps {
  /** The notice, for example 'No Active Scene' or 'Unknown component: name'. */
  message: string;
  /**
   * 'scene' (the default) fills the frame and sets the notice large, as the program does when no
   * scene is on air. 'component' centres the notice over the frame at body size, as the program does
   * for one component of a scene it cannot draw.
   */
  variant?: 'scene' | 'component';
}

/** The centred white notice the program shows instead of a scene, or instead of one of its components. */
export const SceneNotice: React.FC<SceneNoticeProps> = ({ message, variant = 'scene' }) => {
  if (variant === 'component') {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white'
        }}
      >
        {message}
      </div>
    );
  }

  return <div className='w-full h-full flex items-center justify-center text-white text-4xl'>{message}</div>;
};
