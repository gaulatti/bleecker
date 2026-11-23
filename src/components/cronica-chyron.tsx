import React from 'react';

export interface CronicaChyronProps {
  /** One line per newline in the text. Renders nothing when the text is empty. */
  text?: string;
}

/** The Crónica chyron: large uppercase lines, one per line of text, centred over the program. */
export const CronicaChyron: React.FC<CronicaChyronProps> = ({ text = '' }) => {
  if (!text) return null;

  return (
    <div className='cronica-layer'>
      <div className='cronica-safe-area'>
        <div className='cronica-chyron'>
          {text.split('\n').map((line, index) => (
            <div key={`cronica-line-${index}`} className='cronica-chyron-line'>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
