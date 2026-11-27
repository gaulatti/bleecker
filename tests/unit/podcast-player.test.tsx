import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PodcastPlayer, formatPodcastTime } from '../../src/components/podcast-player';
import { keydown, render } from './helpers';

// The podcast player: the labels and the hidden state, the gain on the audio element, autoplay and the
// blocked-autoplay prompt, and the seek by pointer and by keyboard. The audio element is stubbed, since
// jsdom does not play media.

const q = (selector: string) => document.querySelector(selector)! as HTMLElement;
const audio = () => q('audio') as HTMLAudioElement;
const slider = () => q('[role="slider"]');

let playCalls = 0;
let playResult: 'ok' | 'blocked' = 'ok';

beforeEach(() => {
  playCalls = 0;
  playResult = 'ok';
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => 1)
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => {
    playCalls += 1;
    return playResult === 'ok' ? Promise.resolve() : Promise.reject(new Error('NotAllowedError'));
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.stubGlobal(
    'AudioContext',
    class {
      state = 'running';
      createAnalyser() {
        return { fftSize: 0, smoothingTimeConstant: 0, frequencyBinCount: 4, connect: vi.fn(), getByteFrequencyData: vi.fn() };
      }
      createMediaElementSource() {
        return { connect: vi.fn() };
      }
      get destination() {
        return {};
      }
      resume = vi.fn();
      close = vi.fn();
    }
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('PodcastPlayer', () => {
  test('shows the episode and show lines, with neutral placeholders when they are empty', async () => {
    await render(<PodcastPlayer episodeTitle='Harbor Lights' showName='The Paper Hours' />);
    expect(document.body.textContent).toContain('Harbor Lights');
    expect(document.body.textContent).toContain('The Paper Hours');

    document.body.innerHTML = '';
    await render(<PodcastPlayer />);
    expect(document.body.textContent).toContain('Episode title');
    expect(document.body.textContent).toContain('Show name');
  });

  test('renders nothing when hidden, and mounts no audio element', async () => {
    await render(<PodcastPlayer show={false} episodeTitle='Harbor Lights' />);
    expect(document.querySelector('section')).toBeNull();
    expect(document.querySelector('audio')).toBeNull();
  });

  test('uses the cover image when given one, and the placeholder otherwise', async () => {
    await render(<PodcastPlayer coverUrl='https://example.test/cover.jpg' />);
    expect(q('img').getAttribute('src')).toBe('https://example.test/cover.jpg');
    document.body.innerHTML = '';
    await render(<PodcastPlayer />);
    expect(document.querySelector('img')).toBeNull();
  });

  test('sets the gain from masterGain, clamped to 0 to 1, and mutes at zero', async () => {
    await render(<PodcastPlayer masterGain={0.4} />);
    expect(audio().volume).toBeCloseTo(0.4);
    expect(audio().muted).toBe(false);

    document.body.innerHTML = '';
    await render(<PodcastPlayer masterGain={2} />);
    expect(audio().volume).toBe(1);

    document.body.innerHTML = '';
    await render(<PodcastPlayer masterGain={0} />);
    expect(audio().muted).toBe(true);
  });

  test('loads the audio URL and starts playback once it can play', async () => {
    const { rerender } = await render(<PodcastPlayer audioUrl='https://example.test/ep1.mp3' />);
    expect(audio().getAttribute('src')).toBe('https://example.test/ep1.mp3');
    await act(async () => {
      audio().dispatchEvent(new Event('canplay'));
    });
    expect(playCalls).toBe(1);
    await rerender(<PodcastPlayer audioUrl='https://example.test/ep1.mp3' />);
  });

  test('says so when the browser blocks autoplay, and clears it once playback starts', async () => {
    playResult = 'blocked';
    await render(<PodcastPlayer audioUrl='https://example.test/ep1.mp3' />);
    await act(async () => {
      audio().dispatchEvent(new Event('canplay'));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(document.body.textContent).toContain('Waiting for interaction to start playback');

    await act(async () => {
      audio().dispatchEvent(new Event('play'));
    });
    expect(document.body.textContent).not.toContain('Waiting for interaction');
  });

  test('seeks to the pointer position along the scrubber', async () => {
    await render(<PodcastPlayer audioUrl='https://example.test/ep1.mp3' />);
    Object.defineProperty(audio(), 'duration', { configurable: true, value: 200 });
    await act(async () => {
      audio().dispatchEvent(new Event('durationchange'));
    });
    const track = slider();
    track.getBoundingClientRect = () => ({ left: 0, width: 400, top: 0, height: 6, right: 400, bottom: 6, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
    await act(async () => {
      track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 100 }));
    });
    expect(audio().currentTime).toBeCloseTo(50);
  });

  test('moves five seconds with the arrow keys and stays inside the episode', async () => {
    await render(<PodcastPlayer audioUrl='https://example.test/ep1.mp3' />);
    Object.defineProperty(audio(), 'duration', { configurable: true, value: 20 });
    await act(async () => {
      audio().dispatchEvent(new Event('durationchange'));
    });
    audio().currentTime = 2;
    await keydown(slider(), 'ArrowRight');
    expect(audio().currentTime).toBe(7);
    await keydown(slider(), 'ArrowLeft');
    await keydown(slider(), 'ArrowLeft');
    expect(audio().currentTime).toBe(0);
    await keydown(slider(), 'ArrowRight');
    await keydown(slider(), 'ArrowRight');
    await keydown(slider(), 'ArrowRight');
    await keydown(slider(), 'ArrowRight');
    expect(audio().currentTime).toBe(20);
  });

  test('formats times as m:ss and treats bad values as zero', () => {
    expect(formatPodcastTime(0)).toBe('0:00');
    expect(formatPodcastTime(65.9)).toBe('1:05');
    expect(formatPodcastTime(NaN)).toBe('0:00');
    expect(formatPodcastTime(-3)).toBe('0:00');
  });
});
