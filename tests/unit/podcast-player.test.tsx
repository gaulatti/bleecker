import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PodcastPlayer, formatPodcastTime } from '../../src/components/podcast-player';
import { keydown, render } from './helpers';

// The podcast player, checked branch by branch: the props and their defaults, the cover and the empty
// states, the gain edges, the animation frames (live spectrum, idle line, no canvas context), the audio
// events, the analyser set-up (built once, refused by the browser, suspended), autoplay with and without a
// block, the cleanup on a new episode and on unmount, and the scrubber by pointer and keyboard.

const q = (selector: string) => document.querySelector(selector)! as HTMLElement;
const audio = () => q('audio') as HTMLAudioElement;
const slider = () => q('[role="slider"]');
const card = () => q('section');

const URL_A = 'https://example.test/ep1.mp3';
const URL_B = 'https://example.test/ep2.mp3';

let frames: Array<(ts: number) => void>;
let playCalls: number;
let playResult: 'ok' | 'blocked';
let contextState: 'running' | 'suspended';
let contextThrows: boolean;
let contexts: Array<{ resume: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> }>;
let freqBins: number[];

/** Runs every queued animation frame once, as the browser would on its next paint. */
const runFrames = async (ts = 1000) => {
  const pending = frames;
  frames = [];
  await act(async () => {
    pending.forEach((frame) => frame(ts));
  });
};

const fire = async (target: EventTarget, type: string) => {
  await act(async () => {
    target.dispatchEvent(new Event(type));
  });
};

const setDuration = async (value: number | undefined) => {
  Object.defineProperty(audio(), 'duration', { configurable: true, value });
  await fire(audio(), 'durationchange');
};

const rect = (width: number) =>
  ({ left: 0, width, top: 0, height: 6, right: width, bottom: 6, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;

beforeEach(() => {
  frames = [];
  playCalls = 0;
  playResult = 'ok';
  contextState = 'running';
  contextThrows = false;
  contexts = [];
  freqBins = new Array(1024).fill(0);
  vi.stubGlobal('requestAnimationFrame', (frame: (ts: number) => void) => {
    frames.push(frame);
    return frames.length;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => {
    playCalls += 1;
    return playResult === 'ok' ? Promise.resolve() : Promise.reject(new Error('NotAllowedError'));
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.stubGlobal(
    'AudioContext',
    class FakeAudioContext {
      state = contextState;
      resume = vi.fn(async () => undefined);
      close = vi.fn(async () => undefined);
      constructor() {
        if (contextThrows) throw new Error('AudioContext refused');
        contexts.push(this);
      }
      createAnalyser() {
        return {
          fftSize: 0,
          smoothingTimeConstant: 0,
          frequencyBinCount: freqBins.length,
          connect: vi.fn(),
          getByteFrequencyData: (array: Uint8Array) => array.set(freqBins.slice(0, array.length)),
        };
      }
      createMediaElementSource() {
        return { connect: vi.fn() };
      }
      get destination() {
        return {};
      }
    }
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('labels, defaults and the hidden state', () => {
  test('shows the episode and show lines, with neutral placeholders when they are empty', async () => {
    await render(<PodcastPlayer episodeTitle='Harbor Lights' showName='The Paper Hours' />);
    expect(document.body.textContent).toContain('Harbor Lights');
    expect(document.body.textContent).toContain('The Paper Hours');
    document.body.innerHTML = '';
    await render(<PodcastPlayer episodeTitle='' showName='' />);
    expect(document.body.textContent).toContain('Episode title');
    expect(document.body.textContent).toContain('Show name');
  });

  test('renders nothing when hidden, and mounts no audio element', async () => {
    await render(<PodcastPlayer show={false} episodeTitle='Harbor Lights' audioUrl={URL_A} masterGain={0.3} />);
    expect(card()).toBeNull();
    expect(document.querySelector('audio')).toBeNull();
    await runFrames();
    expect(playCalls).toBe(0);
  });

  test('shows and hides with the show prop, re-applying the gain when shown', async () => {
    const { rerender } = await render(<PodcastPlayer show={false} masterGain={0.25} />);
    expect(card()).toBeNull();
    await rerender(<PodcastPlayer show masterGain={0.25} />);
    expect(card()).not.toBeNull();
    expect(audio().volume).toBeCloseTo(0.25);
    await rerender(<PodcastPlayer show={false} />);
    expect(card()).toBeNull();
  });

  test('renders with every prop left at its default', async () => {
    await render(<PodcastPlayer />);
    expect(card()).not.toBeNull();
    expect(audio().volume).toBe(1);
    expect(audio().muted).toBe(false);
    expect(audio().getAttribute('src')).toBeNull();
    expect(playCalls).toBe(0);
    expect(document.querySelector('img')).toBeNull();
  });
});

describe('the cover', () => {
  test('uses the cover image when given one', async () => {
    await render(<PodcastPlayer coverUrl='https://example.test/cover.jpg' />);
    expect(q('img').getAttribute('src')).toBe('https://example.test/cover.jpg');
  });

  test('shows the neutral placeholder for an empty cover', async () => {
    await render(<PodcastPlayer coverUrl='' />);
    expect(document.querySelector('img')).toBeNull();
    expect(card().querySelector('svg')).not.toBeNull();
  });
});

describe('the gain', () => {
  test('uses the gain as given, between 0 and 1', async () => {
    await render(<PodcastPlayer masterGain={0.4} />);
    expect(audio().volume).toBeCloseTo(0.4);
    expect(audio().muted).toBe(false);
  });

  test('clamps a gain above 1 and below 0', async () => {
    const { rerender } = await render(<PodcastPlayer masterGain={2} />);
    expect(audio().volume).toBe(1);
    await rerender(<PodcastPlayer masterGain={-1} />);
    expect(audio().volume).toBe(0);
  });

  test('mutes at zero and at a gain under the mute threshold, but not just above it', async () => {
    const { rerender } = await render(<PodcastPlayer masterGain={0} />);
    expect(audio().muted).toBe(true);
    await rerender(<PodcastPlayer masterGain={0.00005} />);
    expect(audio().muted).toBe(true);
    await rerender(<PodcastPlayer masterGain={0.001} />);
    expect(audio().muted).toBe(false);
  });
});

describe('loading and autoplay', () => {
  test('loads the episode and starts playback once it can play', async () => {
    await render(<PodcastPlayer audioUrl={URL_A} />);
    expect(audio().getAttribute('src')).toBe(URL_A);
    await fire(audio(), 'canplay');
    expect(playCalls).toBe(1);
  });

  test('does not load or play an empty audio URL', async () => {
    await render(<PodcastPlayer audioUrl='' />);
    expect(audio().getAttribute('src')).toBeNull();
    await fire(audio(), 'canplay');
    expect(playCalls).toBe(0);
  });

  test('says so when the browser blocks autoplay, and clears it once playback starts', async () => {
    playResult = 'blocked';
    await render(<PodcastPlayer audioUrl={URL_A} />);
    await fire(audio(), 'canplay');
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(document.body.textContent).toContain('Waiting for interaction to start playback');
    await fire(audio(), 'play');
    expect(document.body.textContent).not.toContain('Waiting for interaction');
  });

  test('resumes a suspended audio context before playing', async () => {
    contextState = 'suspended';
    await render(<PodcastPlayer audioUrl={URL_A} />);
    await fire(audio(), 'canplay');
    expect(contexts).toHaveLength(1);
    expect(contexts[0].resume).toHaveBeenCalledTimes(1);
  });

  test('plays without a visualiser when the browser refuses the audio graph', async () => {
    contextThrows = true;
    await render(<PodcastPlayer audioUrl={URL_A} />);
    await fire(audio(), 'canplay');
    expect(playCalls).toBe(1);
    expect(contexts).toHaveLength(0);
    // The idle line still draws, and unmounting with no audio context closes nothing.
    await runFrames();
  });

  test('builds the audio graph once, across episodes', async () => {
    const { rerender } = await render(<PodcastPlayer audioUrl={URL_A} />);
    await fire(audio(), 'canplay');
    await rerender(<PodcastPlayer audioUrl={URL_B} />);
    await fire(audio(), 'canplay');
    expect(contexts).toHaveLength(1);
    expect(playCalls).toBe(2);
    expect(audio().getAttribute('src')).toBe(URL_B);
  });

  test('drops a pending start when the episode changes before it can play', async () => {
    const { rerender } = await render(<PodcastPlayer audioUrl={URL_A} />);
    await rerender(<PodcastPlayer audioUrl={URL_B} />);
    await fire(audio(), 'canplay');
    expect(playCalls).toBe(1);
  });
});

describe('audio events and the time readout', () => {
  test('follows the time and the duration, and treats a missing duration as zero', async () => {
    await render(<PodcastPlayer episodeTitle='Harbor Lights' />);
    audio().currentTime = 65;
    await fire(audio(), 'timeupdate');
    expect(document.body.textContent).toContain('1:05');
    await setDuration(180);
    expect(document.body.textContent).toContain('3:00');
    await setDuration(undefined);
    expect(document.body.textContent).toContain('0:00');
  });

  test('reads the duration on loaded metadata too', async () => {
    await render(<PodcastPlayer />);
    Object.defineProperty(audio(), 'duration', { configurable: true, value: 120 });
    await fire(audio(), 'loadedmetadata');
    expect(document.body.textContent).toContain('2:00');
  });

  test('goes back to the idle line on pause and on the end of the episode', async () => {
    const strokes = vi.spyOn(CanvasRenderingContext2D.prototype, 'stroke');
    await render(<PodcastPlayer audioUrl={URL_A} />);
    await fire(audio(), 'canplay');
    await fire(audio(), 'play');
    freqBins = freqBins.map(() => 200);
    await runFrames();
    expect(strokes).not.toHaveBeenCalled();
    await fire(audio(), 'pause');
    await runFrames();
    expect(strokes).toHaveBeenCalled();
    strokes.mockClear();
    await fire(audio(), 'play');
    await fire(audio(), 'ended');
    await runFrames();
    expect(strokes).toHaveBeenCalled();
    strokes.mockRestore();
  });

  test('formats times as m:ss and treats bad values as zero', () => {
    expect(formatPodcastTime(0)).toBe('0:00');
    expect(formatPodcastTime(9)).toBe('0:09');
    expect(formatPodcastTime(65.9)).toBe('1:05');
    expect(formatPodcastTime(3600)).toBe('60:00');
    expect(formatPodcastTime(NaN)).toBe('0:00');
    expect(formatPodcastTime(Infinity)).toBe('0:00');
    expect(formatPodcastTime(-3)).toBe('0:00');
  });
});

describe('the animation frames', () => {
  test('draws the idle line while paused, and the spectrum while playing', async () => {
    const strokes = vi.spyOn(CanvasRenderingContext2D.prototype, 'stroke');
    await render(<PodcastPlayer audioUrl={URL_A} />);
    // Paused, with no audio graph yet: the breathing line.
    await runFrames(500);
    expect(strokes).toHaveBeenCalled();
    strokes.mockClear();
    // Playing, with spectrum data: bars, not the idle line; silent bins are skipped and the frame completes.
    await fire(audio(), 'canplay');
    await fire(audio(), 'play');
    freqBins = freqBins.map((_, index) => (index % 3 === 0 ? 0 : 200));
    await runFrames(900);
    expect(strokes).not.toHaveBeenCalled();
    freqBins = freqBins.map(() => 0);
    await runFrames(950);
    expect(strokes).not.toHaveBeenCalled();
    strokes.mockRestore();
  });

  test('keeps the page up with no canvas context, drawing nothing', async () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { unmount } = await render(<PodcastPlayer audioUrl={URL_A} />);
    await runFrames();
    await runFrames();
    expect(card()).not.toBeNull();
    expect(context).toHaveBeenCalled();
    context.mockRestore();
    await unmount();
  });

  test('cancels the frames it started when unmounted, even when none was registered', async () => {
    vi.stubGlobal('requestAnimationFrame', () => null);
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);
    const { unmount } = await render(<PodcastPlayer />);
    await unmount();
    expect(cancel).not.toHaveBeenCalled();
  });

  test('cancels the pending frames on unmount', async () => {
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);
    const { unmount } = await render(<PodcastPlayer audioUrl={URL_A} />);
    await unmount();
    expect(cancel).toHaveBeenCalled();
  });

  test('closes the audio context on unmount', async () => {
    const { unmount } = await render(<PodcastPlayer audioUrl={URL_A} />);
    await fire(audio(), 'canplay');
    await unmount();
    expect(contexts[0].close).toHaveBeenCalledTimes(1);
  });
});

describe('the scrubber', () => {
  test('seeks to the pointer position along the track', async () => {
    await render(<PodcastPlayer audioUrl={URL_A} />);
    await setDuration(200);
    slider().getBoundingClientRect = () => rect(400);
    await act(async () => {
      slider().dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 100 }));
    });
    expect(audio().currentTime).toBeCloseTo(50);
  });

  test('clamps a seek before the start and after the end', async () => {
    await render(<PodcastPlayer audioUrl={URL_A} />);
    await setDuration(200);
    slider().getBoundingClientRect = () => rect(400);
    await act(async () => {
      slider().dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: -50 }));
    });
    expect(audio().currentTime).toBe(0);
    await act(async () => {
      slider().dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 900 }));
    });
    expect(audio().currentTime).toBe(200);
  });

  test('ignores a seek before the episode has a duration', async () => {
    await render(<PodcastPlayer audioUrl={URL_A} />);
    audio().currentTime = 7;
    slider().getBoundingClientRect = () => rect(400);
    await act(async () => {
      slider().dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 200 }));
    });
    expect(audio().currentTime).toBe(7);
    await keydown(slider(), 'ArrowRight');
    expect(audio().currentTime).toBe(7);
  });

  test('moves five seconds with the arrow keys, stays inside the episode, and ignores other keys', async () => {
    await render(<PodcastPlayer audioUrl={URL_A} />);
    await setDuration(20);
    audio().currentTime = 2;
    await keydown(slider(), 'ArrowRight');
    expect(audio().currentTime).toBe(7);
    await keydown(slider(), 'ArrowLeft');
    await keydown(slider(), 'ArrowLeft');
    expect(audio().currentTime).toBe(0);
    for (let i = 0; i < 4; i++) await keydown(slider(), 'ArrowRight');
    expect(audio().currentTime).toBe(20);
    await keydown(slider(), 'a');
    expect(audio().currentTime).toBe(20);
  });

  test('exposes the position to assistive technology', async () => {
    await render(<PodcastPlayer audioUrl={URL_A} />);
    await setDuration(90);
    audio().currentTime = 30;
    await fire(audio(), 'timeupdate');
    expect(slider()).toHaveAttribute('aria-valuetext', '0:30 of 1:30');
    expect(slider()).toHaveAttribute('aria-valuenow', '30');
    expect(slider()).toHaveAttribute('aria-valuemax', '90');
  });

  test('draws the progress as a fraction of the episode, and none before it is known', async () => {
    await render(<PodcastPlayer audioUrl={URL_A} />);
    const fill = () => q('[role="slider"] > div') as HTMLElement;
    expect(fill().style.width).toBe('0%');
    await setDuration(200);
    audio().currentTime = 50;
    await fire(audio(), 'timeupdate');
    expect(fill().style.width).toBe('25%');
  });
});
