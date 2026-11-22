import React from 'react';

import { cn } from '../utils/cn';
import { StatePill, type StatePillProps, type StatePillTone } from './state-pill';

export type OnAirState = 'live' | 'armed' | 'idle';

export interface OnAirStripPill {
  label: string;
  title?: string;
  tone: StatePillTone;
}

export interface OnAirStripProps {
  className?: string;
  /** A clock or any trailing readout, shown at the right. */
  clock?: React.ReactNode;
  /** What plays now: a title line and a detail line. */
  now?: { detail?: string; title: string };
  /** What plays next. */
  next?: { detail?: string; title: string };
  /** Health chips: stream, engine, monitor. */
  pills?: OnAirStripPill[];
  state: OnAirState;
  /** What the state says when it differs from its default words (On air, Armed, Off air). */
  stateLabel?: string;
  /** Shown when nothing is on air. */
  idleText?: string;
}

const STATE_TONES: Record<OnAirState, { label: string; tone: StatePillProps['tone'] }> = {
  live: { label: 'On air', tone: 'live' },
  armed: { label: 'Armed', tone: 'arm' },
  idle: { label: 'Off air', tone: 'idle' }
};

/**
 * A one-row strip for the top of a console: whether the program is on air, what plays and what is
 * next, the health chips and a clock. Tones come from StatePill.
 */
export function OnAirStrip({ className, clock, idleText = 'Nothing on air', next, now, pills = [], state, stateLabel }: OnAirStripProps) {
  const base = STATE_TONES[state];
  return (
    <section aria-label='On air' data-state={state} className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[var(--radius-card)] bg-deep-sea px-4 py-2.5 text-white', className)}>
      <StatePill tone={base.tone} label={stateLabel ?? base.label} pulse={state === 'live'} className='border-white/30' />
      <div className='min-w-0 flex-1 basis-56'>
        {now ? (
          <>
            <p className='truncate text-sm font-semibold'>{now.title}</p>
            {now.detail ? <p className='truncate text-xs text-white/70'>{now.detail}</p> : null}
          </>
        ) : (
          <p className='text-sm text-white/70'>{idleText}</p>
        )}
      </div>
      {next ? (
        <div className='min-w-0 basis-48 text-xs'>
          <p className='text-white/70'>Next</p>
          <p className='truncate'>
            <span className='font-semibold'>{next.title}</span>
            {next.detail ? <span className='text-white/70'> · {next.detail}</span> : null}
          </p>
        </div>
      ) : null}
      {pills.length > 0 ? (
        <div className='flex flex-wrap items-center gap-1.5'>
          {pills.map((pill) => (
            <StatePill key={pill.label} tone={pill.tone} label={pill.label} title={pill.title} />
          ))}
        </div>
      ) : null}
      {clock ? <div className='font-mono text-lg font-semibold tabular-nums'>{clock}</div> : null}
    </section>
  );
}
