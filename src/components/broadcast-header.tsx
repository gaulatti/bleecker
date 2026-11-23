import React from 'react';

export interface BroadcastHeaderProps {
  title?: string;
  date?: string;
}

export const BroadcastHeader: React.FC<BroadcastHeaderProps> = ({
  title = '',
  date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}) => {
  return (
    <div className='broadcast-header'>
      <div className='header-content'>
        <span className='header-text'>
          {title ? `${title} | ${date}` : date}
        </span>
      </div>
    </div>
  );
};
