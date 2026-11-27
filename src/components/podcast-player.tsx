import React, { useEffect, useRef, useState } from 'react';

import { cn } from '../utils/cn';

export interface PodcastPlayerProps {
  className?: string;
  /** Shows the player. When false it renders nothing, and the audio element is not mounted. */
  show?: boolean;
  /** Episode artwork. Without it the cover shows a neutral placeholder. */
  coverUrl?: string;
  /** The episode title, the first line of the card. */
  episodeTitle?: string;
  /** The show name, the second line of the card. */
  showName?: string;
  /** The episode audio. Playback starts when it loads, or waits for a tap where the browser blocks autoplay. */
  audioUrl?: string;
  /** Output gain from 0 to 1. At 0 or below the audio is muted. */
  masterGain?: number;
}

// The canvas draws with fixed colours, because a canvas cannot read a CSS token. The card and text
// take their colours from the Bleecker tokens (deep sea, sand, terracotta).
const ORB_COLOURS = [
  { x: 0.15, y: 0.35, r: 0.7, hue: 196, sat: 55, spd: 0.00031, phase: 0.0 }, // sea
  { x: 0.8, y: 0.25, r: 0.6, hue: 12, sat: 48, spd: 0.00027, phase: 1.1 }, // terracotta
  { x: 0.55, y: 0.75, r: 0.55, hue: 36, sat: 60, spd: 0.00019, phase: 2.3 }, // desert
  { x: 0.1, y: 0.8, r: 0.5, hue: 210, sat: 45, spd: 0.00023, phase: 3.7 } // deep sea
];

export function formatPodcastTime(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * A podcast episode player for a programme screen: cover art, the episode and show lines, a spectrum
 * visualiser that moves with the audio, and a scrubber. The audio and the gain are props; the player
 * never fetches anything itself.
 */
export function PodcastPlayer({
  className,
  show = true,
  coverUrl = '',
  episodeTitle = '',
  showName = '',
  audioUrl = '',
  masterGain = 1
}: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vizCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgRafRef = useRef<number | null>(null);
  const vizRafRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const isPlayingRef = useRef(false);
  const durationRef = useRef(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.max(0, Math.min(1, masterGain));
    audioRef.current.muted = masterGain <= 0.0001;
    // `show` re-applies the gain to the audio element mounted when the player is shown.
  }, [masterGain, show]);

  // Background: four colour orbs drift on slow sine paths, blended into a radial fill each frame.
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const draw = (ts: number) => {
      const W = canvas.width;
      const H = canvas.height;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(26, 55, 77, 0.6)';
      ctx.fillRect(0, 0, W, H);
      for (const orb of ORB_COLOURS) {
        const t = ts * orb.spd + orb.phase;
        const cx = (orb.x + Math.sin(t) * 0.22 + Math.cos(t * 0.6) * 0.1) * W;
        const cy = (orb.y + Math.cos(t * 0.8) * 0.18 + Math.sin(t * 0.4) * 0.12) * H;
        const radius = orb.r * Math.max(W, H);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `hsla(${orb.hue}, ${orb.sat}%, 60%, 0.5)`);
        grad.addColorStop(0.5, `hsla(${orb.hue}, ${orb.sat}%, 40%, 0.18)`);
        grad.addColorStop(1, `hsla(${orb.hue}, ${orb.sat}%, 20%, 0)`);
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.globalCompositeOperation = 'source-over';
      const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.85);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
      bgRafRef.current = requestAnimationFrame(draw);
    };
    bgRafRef.current = requestAnimationFrame(draw);
    return () => {
      if (bgRafRef.current !== null) cancelAnimationFrame(bgRafRef.current);
    };
  }, []);

  // Visualiser: a mirrored spectrum while playing, a breathing line while paused.
  useEffect(() => {
    const canvas = vizCanvasRef.current;
    if (!canvas) return;
    let idleT = 0;
    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const analyser = analyserRef.current;
      const freqArr = dataArrayRef.current;
      if (analyser && freqArr && isPlayingRef.current) {
        analyser.getByteFrequencyData(freqArr);
        const usableBins = Math.floor(freqArr.length * 0.6);
        const barW = W / usableBins;
        const mid = H / 2;
        for (let i = 0; i < usableBins; i++) {
          const mag = freqArr[i]! / 255;
          const barH = mag * mid * 0.95;
          if (barH < 1) continue;
          const hue = 12 + (i / usableBins) * 190;
          ctx.fillStyle = `hsla(${hue}, 60%, 62%, ${0.5 + mag * 0.5})`;
          ctx.fillRect(i * barW, mid - barH, Math.max(1, barW - 1), barH);
          ctx.fillRect(i * barW, mid, Math.max(1, barW - 1), barH);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(0, mid - 0.5, W, 1);
      } else {
        idleT += 0.04;
        const mid = H / 2;
        const amp = 6 + Math.sin(idleT * 0.7) * 4;
        const freq = 8;
        for (const [stroke, width] of [
          ['rgba(198,122,116,0.18)', 8],
          ['rgba(198,122,116,0.6)', 1.5]
        ] as const) {
          ctx.beginPath();
          ctx.strokeStyle = stroke;
          ctx.lineWidth = width;
          for (let x = 0; x <= W; x += 2) {
            const y = mid + Math.sin((x / W) * Math.PI * freq + idleT * 2) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      vizRafRef.current = requestAnimationFrame(draw);
    };
    vizRafRef.current = requestAnimationFrame(draw);
    return () => {
      if (vizRafRef.current !== null) cancelAnimationFrame(vizRafRef.current);
    };
  }, []);

  // Audio element events feed the time, the duration and the play state.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => {
      durationRef.current = audio.duration ?? 0;
      setDuration(audio.duration ?? 0);
    };
    const onPlay = () => {
      isPlayingRef.current = true;
      setAutoplayBlocked(false);
    };
    const onPause = () => {
      isPlayingRef.current = false;
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
    };
  }, []);

  // The analyser sits on the audio element, so it is built on the first user-driven or autoplay start.
  const initAnalyser = () => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return;
    try {
      const actx = new AudioContext();
      const analyser = actx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.75;
      const source = actx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(actx.destination);
      audioCtxRef.current = actx;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    } catch {
      // The browser refused an audio graph; playback continues without the visualiser.
    }
  };

  // Load and autoplay each new episode.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    durationRef.current = 0;
    isPlayingRef.current = false;
    setCurrentTime(0);
    setDuration(0);
    setAutoplayBlocked(false);
    if (!audioUrl) return;
    audio.src = audioUrl;
    audio.load();
    const tryPlay = () => {
      initAnalyser();
      if (audioCtxRef.current?.state === 'suspended') void audioCtxRef.current.resume();
      audio.play().catch(() => setAutoplayBlocked(true));
    };
    audio.addEventListener('canplay', tryPlay, { once: true });
    return () => audio.removeEventListener('canplay', tryPlay);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (bgRafRef.current !== null) cancelAnimationFrame(bgRafRef.current);
      if (vizRafRef.current !== null) cancelAnimationFrame(vizRafRef.current);
      void audioCtxRef.current?.close();
    };
  }, []);

  const seekTo = (clientX: number, rect: DOMRect) => {
    const audio = audioRef.current;
    if (!audio || !durationRef.current) return;
    audio.currentTime = Math.max(0, Math.min(durationRef.current, ((clientX - rect.left) / rect.width) * durationRef.current));
  };

  if (!show) return null;

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <section
      aria-label='Podcast player'
      className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-deep-sea text-white', className)}
    >
      <canvas ref={bgCanvasRef} width={1920} height={1080} aria-hidden='true' className='absolute inset-0 block h-full w-full' />
      {/* The audio element is kept off screen; the card's controls drive it. */}
      <audio ref={audioRef} crossOrigin='anonymous' preload='metadata' />

      <div className='relative flex w-[min(92%,1800px)] flex-row items-stretch overflow-hidden rounded-[var(--radius-card)] border border-white/10 bg-black/60 shadow-[0_32px_80px_rgba(0,0,0,0.75)] backdrop-blur-[40px]'>
        <div className='h-auto w-[30%] shrink-0 overflow-hidden bg-[#1a1a1a]'>
          {coverUrl ? (
            <img src={coverUrl} alt='Episode cover' className='block h-full w-full object-cover' />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#111]'>
              <svg width='64' height='64' viewBox='0 0 64 64' fill='none' aria-hidden='true'>
                <circle cx='32' cy='32' r='24' stroke='rgba(255,255,255,0.15)' strokeWidth='2' />
                <circle cx='32' cy='32' r='8' fill='rgba(255,255,255,0.1)' />
              </svg>
            </div>
          )}
        </div>

        <div className='flex min-w-0 flex-1 flex-col justify-center gap-6 px-12 py-12'>
          <div className='min-w-0'>
            <p className='truncate font-[family-name:var(--font-display)] text-[clamp(1.5rem,4vw,4.9rem)] font-bold leading-tight text-white'>
              {episodeTitle || 'Episode title'}
            </p>
            <p className='mt-2 truncate text-[clamp(1rem,2.2vw,2.4rem)] text-white/50'>{showName || 'Show name'}</p>
          </div>

          <div className='relative min-h-0 flex-1 overflow-hidden rounded-lg bg-black/30'>
            <canvas ref={vizCanvasRef} width={720} height={120} aria-hidden='true' className='block h-full w-full' />
          </div>

          <div
            role='slider'
            aria-label='Seek'
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatPodcastTime(currentTime)} of ${formatPodcastTime(duration)}`}
            tabIndex={0}
            className='relative h-1.5 cursor-pointer rounded-full bg-white/12'
            onClick={(e) => seekTo(e.clientX, e.currentTarget.getBoundingClientRect())}
            onKeyDown={(e) => {
              const audio = audioRef.current;
              if (!audio || !durationRef.current) return;
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const delta = e.key === 'ArrowRight' ? 5 : -5;
                audio.currentTime = Math.max(0, Math.min(durationRef.current, audio.currentTime + delta));
              }
            }}
          >
            <div className='absolute left-0 top-0 h-full rounded-full bg-terracotta' style={{ width: `${progress * 100}%` }} />
            <div
              className='pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta shadow-[0_0_12px_var(--color-terracotta)]'
              style={{ left: `${progress * 100}%` }}
            />
          </div>

          <div className='-mt-3 flex justify-between text-[clamp(0.9rem,1.6vw,1.9rem)] font-medium text-white/45'>
            <span>{formatPodcastTime(currentTime)}</span>
            <span>{formatPodcastTime(duration)}</span>
          </div>

          {autoplayBlocked ? (
            <p className='text-xs uppercase tracking-wider text-white/35'>Waiting for interaction to start playback</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
