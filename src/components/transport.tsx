import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';

export interface TransportCue {
  /** Where the cue sits, in seconds. */
  at: number;
  label: string;
}

export interface TransportProps {
  className?: string;
  /** Marks on the timeline, such as a song's cue in and cue out. */
  cues?: TransportCue[];
  disabled?: boolean;
  /** Seconds, or null when the length is unknown (the timeline is then hidden). */
  duration: number | null;
  onNext?: () => void;
  onPrev?: () => void;
  /** Called with the new position in seconds. Without it the timeline is read only. */
  onSeek?: (seconds: number) => void;
  onToggle: () => void;
  playing: boolean;
  /** Seconds. */
  position: number;
  subtitle?: string;
  title: string;
}

const SEEK_STEP_SECONDS = 5;

function formatClock(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return '—';
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/**
 * One shared transport for a list of audio: previous, play or pause, next, what is loaded, a
 * timeline with cue marks, and the time. It is presentational: the page owns the audio element.
 * Space toggles on the timeline, and the arrow keys seek by five seconds.
 */
export function Transport({ className, cues = [], disabled = false, duration, onNext, onPrev, onSeek, onToggle, playing, position, subtitle, title }: TransportProps) {
  const timeline = React.useRef<HTMLDivElement>(null);
  const length = duration !== null && duration > 0 ? duration : null;
  const clamped = length === null ? Math.max(0, position) : Math.min(Math.max(0, position), length);
  const percent = (seconds: number) => (length === null ? 0 : Math.max(0, Math.min(100, (seconds / length) * 100)));

  const seekTo = (seconds: number) => {
    if (!onSeek || length === null) return;
    onSeek(Math.max(0, Math.min(length, seconds)));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      onToggle();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      seekTo(clamped + SEEK_STEP_SECONDS);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      seekTo(clamped - SEEK_STEP_SECONDS);
    } else if (event.key === 'Home') {
      event.preventDefault();
      seekTo(0);
    } else if (event.key === 'End' && length !== null) {
      event.preventDefault();
      seekTo(length);
    }
  };

  const buttonClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-sand/20 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-sea disabled:pointer-events-none disabled:opacity-40 dark:focus-visible:ring-accent-blue';

  return (
    <div role='group' aria-label='Transport' className={cn('flex items-center gap-4 rounded-[var(--radius-card)] border border-sand/30 bg-light-sand/50 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.04]', className)}>
      <div className='flex items-center gap-1'>
        <button type='button' aria-label='Previous' className={buttonClass} disabled={disabled || !onPrev} onClick={onPrev}>
          <SkipBack size={14} aria-hidden='true' />
        </button>
        <button
          type='button'
          aria-label={playing ? 'Pause' : 'Play'}
          className='inline-flex h-9 w-9 items-center justify-center rounded-full bg-sea text-white hover:bg-deep-sea focus:outline-none focus-visible:ring-2 focus-visible:ring-sea focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 dark:bg-accent-blue dark:hover:bg-accent-blue/80 dark:focus-visible:ring-accent-blue'
          disabled={disabled}
          onClick={onToggle}
        >
          {playing ? <Pause size={16} aria-hidden='true' /> : <Play size={16} aria-hidden='true' />}
        </button>
        <button type='button' aria-label='Next' className={buttonClass} disabled={disabled || !onNext} onClick={onNext}>
          <SkipForward size={14} aria-hidden='true' />
        </button>
      </div>
      <div className='min-w-0 basis-40'>
        <p className='truncate text-sm font-semibold text-text-primary'>{title}</p>
        {subtitle ? <p className='truncate text-[11px] text-text-secondary'>{subtitle}</p> : null}
      </div>
      {length !== null ? (
        <div
          ref={timeline}
          role='slider'
          tabIndex={disabled ? -1 : 0}
          aria-label='Position'
          aria-valuemin={0}
          aria-valuemax={Math.round(length)}
          aria-valuenow={Math.round(clamped)}
          aria-valuetext={`${formatClock(clamped)} of ${formatClock(length)}`}
          aria-disabled={disabled || !onSeek}
          onKeyDown={onKeyDown}
          onClick={(event) => {
            if (!onSeek || disabled || !timeline.current) return;
            const box = timeline.current.getBoundingClientRect();
            if (box.width > 0) seekTo(((event.clientX - box.left) / box.width) * length);
          }}
          className='relative h-4 min-w-24 flex-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sea dark:focus-visible:ring-accent-blue'
        >
          <span className='absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-sand/50 dark:bg-sand/40' />
          <span data-transport='done' className='absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-sea dark:bg-accent-blue' style={{ width: `${percent(clamped)}%` }} />
          {cues.map((cue) => (
            <span key={`${cue.label}-${cue.at}`} data-transport='cue' title={cue.label} className='absolute top-0 h-full w-0.5 bg-accent-text dark:bg-accent-yellow' style={{ left: `${percent(cue.at)}%` }} />
          ))}
        </div>
      ) : (
        <div className='flex-1' />
      )}
      <p className='shrink-0 font-mono text-xs tabular-nums text-text-secondary'>
        <b className='text-text-primary'>{formatClock(clamped)}</b> / {formatClock(length)}
      </p>
    </div>
  );
}
