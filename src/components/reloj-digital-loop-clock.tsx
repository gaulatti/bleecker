import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export interface RelojDigitalLoopClockProps {
  timezone?: string;
  /** The title line to show now. The host resolves any text sequence before passing it in. */
  titleText?: string;
  /** The call-to-action line to show now. The host resolves any text sequence before passing it in. */
  ctaText?: string;
  mode?: 'clock' | 'countdown';
  countdownDuration?: number;
  /** Start or stop the countdown each time this number increases. */
  countdownCommand?: number;
  /** Called once when the countdown reaches zero. The host decides whether this should switch the program. */
  onCountdownComplete?: () => void;
  /** The brand mark shown above the clock, supplied by the host. */
  brandMark?: ReactNode;
}

interface LoopTimezone {
  label: string;
  timezone: string;
}

const LOOP_TIMEZONES: LoopTimezone[] = [
  { label: 'SANREMO', timezone: 'Europe/Rome' },
  { label: 'NEW YORK', timezone: 'America/New_York' },
  { label: 'MADRID', timezone: 'Europe/Madrid' },
  { label: 'MONTEVIDEO', timezone: 'America/Montevideo' },
  { label: 'SANTIAGO', timezone: 'America/Santiago' }
];

const FLIGHT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,.!? ';

function FlightBoardText({ targetText }: { targetText: string }) {
  const [displayArray, setDisplayArray] = useState<string[]>([]);
  const targetChars = useMemo(() => targetText.split(''), [targetText]);

  useEffect(() => {
    setDisplayArray((prev) => {
      const start = prev.slice(0, targetChars.length);
      while (start.length < targetChars.length) start.push(' ');
      return start;
    });

    let frame = 0;
    const intervalId = window.setInterval(() => {
      frame++;
      setDisplayArray((prev) => {
        let allDone = true;
        const next = targetChars.map((targetChar, i) => {
          const settleFrame = 5 + i * 2;
          if (frame >= settleFrame) {
            return targetChar;
          }

          allDone = false;
          return FLIGHT_CHARS[Math.floor(Math.random() * FLIGHT_CHARS.length)];
        });

        if (allDone) window.clearInterval(intervalId);
        return next;
      });
    }, 45);

    return () => window.clearInterval(intervalId);
  }, [targetChars]);

  return <>{displayArray.join('')}</>;
}

export function RelojDigitalLoopClock({
  timezone = 'Europe/Rome',
  titleText: titleProp = '',
  ctaText: ctaProp = '',
  mode = 'clock',
  countdownDuration = 300,
  countdownCommand,
  onCountdownComplete,
  brandMark
}: RelojDigitalLoopClockProps) {
  const defaultIndex = useMemo(() => {
    const idx = LOOP_TIMEZONES.findIndex((item) => item.timezone === timezone);
    return idx >= 0 ? idx : 0;
  }, [timezone]);

  const [activeIndex, setActiveIndex] = useState<number>(defaultIndex);
  const activeIndexRef = useRef(defaultIndex);
  const [clockOut, setClockOut] = useState(false);


  const countdownFiredRef = useRef(false);
  const countdownAnchorRef = useRef(0);
  const lastCommandRef = useRef(0);
  const initializedRef = useRef(false);
  const [countdownRunning, setCountdownRunning] = useState(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      lastCommandRef.current = countdownCommand || 0;
      return;
    }

    const cmd = countdownCommand || 0;
    if (cmd > lastCommandRef.current) {
      lastCommandRef.current = cmd;
      if (countdownRunning) {
        setCountdownRunning(false);
        countdownFiredRef.current = true;
      } else {
        countdownAnchorRef.current = Date.now();
        countdownFiredRef.current = false;
        setCountdownRunning(true);
      }
    }
  }, [countdownCommand]);

  const clockRef = useRef<HTMLDivElement>(null);
  const msRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveIndex(defaultIndex);
    activeIndexRef.current = defaultIndex;
  }, [defaultIndex]);

  const prevDurationRef = useRef(countdownDuration);

  useEffect(() => {
    if (countdownRunning && countdownDuration !== prevDurationRef.current) {
      countdownAnchorRef.current = Date.now();
      countdownFiredRef.current = false;
    }
    prevDurationRef.current = countdownDuration;
  }, [countdownDuration, countdownRunning]);

  useEffect(() => {
    if (mode !== 'countdown') return;

    let rafId: number;
    let animationId: number;

    const tick = () => {
      let remaining: number;

      if (countdownRunning) {
        const now = Date.now();
        const elapsed = now - countdownAnchorRef.current;
        remaining = Math.max(0, countdownDuration * 1000 - elapsed);
      } else if (countdownFiredRef.current) {
        remaining = 0;
      } else {
        remaining = countdownDuration * 1000;
      }

      const totalCs = Math.floor(remaining / 10);
      const cs = totalCs % 100;
      const totalSeconds = Math.floor(remaining / 1000);
      const seconds = totalSeconds % 60;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const minutes = totalMinutes % 60;
      const hours = Math.floor(totalMinutes / 60);

      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      // The refs are set for as long as these ticks run: their cleanup cancels the frame and timer on unmount.
      clockRef.current!.textContent = timeStr;
      msRef.current!.textContent = String(cs).padStart(2, '0');
      labelRef.current!.textContent = countdownRunning ? 'COUNTDOWN' : '';

      if (countdownRunning && remaining <= 0 && !countdownFiredRef.current) {
        countdownFiredRef.current = true;
        // The host decides whether reaching zero should switch the program.
        onCountdownComplete?.();
        return;
      }

      rafId = requestAnimationFrame(() => {
        animationId = window.setTimeout(tick, 20);
      });
    };

    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(animationId);
    };
  }, [mode, countdownRunning, countdownDuration, onCountdownComplete]);

  useEffect(() => {
    if (mode !== 'clock') return;

    let rafId: number;
    let timerId: number;

    const tick = () => {
      const now = new Date();
      const currentTz = LOOP_TIMEZONES[activeIndexRef.current].timezone;

      try {
        const fmt = new Intl.DateTimeFormat('en-GB', {
          timeZone: currentTz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        const parts = fmt.formatToParts(now);
        const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';

        if (clockRef.current) {
          clockRef.current.textContent = `${get('hour')}:${get('minute')}:${get('second')}`;
        }
      } catch (e) {
        clockRef.current!.textContent = now.toLocaleTimeString('en-GB', { timeZone: currentTz, hour12: false });
      }

      msRef.current!.textContent = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
      labelRef.current!.textContent = LOOP_TIMEZONES[activeIndexRef.current].label;

      rafId = requestAnimationFrame(() => {
        timerId = window.setTimeout(tick, 20);
      });
    };
    tick();
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timerId);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== 'clock') return;

    const id = window.setInterval(() => {
      const now = new Date();
      const secs = now.getSeconds();

      if (secs % 30 === 0) {
        setClockOut(true);
        setTimeout(() => {
          const next = (activeIndexRef.current + 1) % LOOP_TIMEZONES.length;
          activeIndexRef.current = next;
          setActiveIndex(next);
          setClockOut(false);
        }, 500);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [mode]);

  const active = LOOP_TIMEZONES[activeIndex];

  const titleText = titleProp.trim();
  const ctaText = ctaProp.trim();
  // The CTA never takes the in-anim or out class: the host passes only its text.

  return (
    <div className='reloj-digital-loop-root'>
      <div id='reloj-mark'>
        {brandMark}
      </div>
      <div id='clock-block' className={clockOut && mode === 'clock' ? 'clock-out' : ''}>
        <div id='clock-row'>
          <div id='clock-bg'>
            <div id='clock' ref={clockRef}>
              00:00:00
            </div>
          </div>
          <div id='ms-bg'>
            <div id='ms' ref={msRef}>
              00
            </div>
          </div>
        </div>
        <div id='city-name' ref={labelRef}>{active.label}</div>
      </div>
      {(titleText !== '' || ctaText !== '') && (
        <div id='lower-third'>
          {ctaText !== '' && (
            <div id='cta' className=''>
              {ctaText}
            </div>
          )}
          {titleText !== '' && (
            <div id='show-title'>
              <FlightBoardText targetText={titleText} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
