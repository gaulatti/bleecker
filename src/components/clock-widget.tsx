import React, { useEffect, useState } from 'react';

export interface ClockWidgetProps {
  showIcon?: boolean;
  iconUrl?: string;
  /** IANA timezone for the default formatter. Omit for the host's local time. */
  timezone?: string;
  /** BCP 47 locale for the default formatter. */
  locale?: string;
  /**
   * Produces the displayed time for a moment. The host supplies this when the time comes from
   * somewhere other than the clock (for example a broadcast time override). Defaults to HH:MM.
   */
  formatTime?: (now: Date) => string;
}

function defaultFormat(now: Date, locale: string, timezone: string | undefined): string {
  try {
    return now.toLocaleTimeString(locale, { timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    console.error('Invalid timezone:', timezone);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}

/** A large clock face that updates every second, with an optional icon. */
export const ClockWidget: React.FC<ClockWidgetProps> = ({
  showIcon = true,
  iconUrl,
  timezone,
  locale = 'en-US',
  formatTime,
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(formatTime ? formatTime(now) : defaultFormat(now, locale, timezone));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [formatTime, locale, timezone]);

  return (
    <div className='flex items-center gap-4'>
      <div className='font-semibold text-4xl leading-none tabular-nums'>{time}</div>
      {showIcon && <div className='flex items-center justify-center'>{iconUrl ? <img src={iconUrl} alt='icon' className='h-12 w-12 object-contain' /> : null}</div>}
    </div>
  );
};
