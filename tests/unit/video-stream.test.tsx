import type React from 'react';
import { act } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { VideoStream } from '../../src/components/video-stream';
import { eventually, flush, render } from './helpers';

// gaulatti/alcantara#184: the scene video stream, through its loosely typed
// scene props, the video element and hls.js.

const hls = vi.hoisted(() => ({
  supported: true,
  failImport: false,
  instances: [] as Array<{
    options: unknown;
    attachMedia: ReturnType<typeof import('vitest').vi.fn>;
    loadSource: ReturnType<typeof import('vitest').vi.fn>;
    destroy: ReturnType<typeof import('vitest').vi.fn>;
    handlers: Record<string, (event: unknown, data?: unknown) => void>;
  }>,
}));

vi.mock('hls.js', () => {
  class FakeHls {
    static Events = { MANIFEST_PARSED: 'manifestParsed', ERROR: 'error' };
    static isSupported() {
      // A failed chunk load surfaces where the component reads hls.js, inside its try block.
      if (hls.failImport) throw new Error('chunk failed to load');
      return hls.supported;
    }
    handlers: Record<string, (event: unknown, data?: unknown) => void> = {};
    attachMedia = vi.fn();
    loadSource = vi.fn();
    destroy = vi.fn();
    constructor(readonly options: unknown) {
      hls.instances.push(this);
    }
    on(event: string, handler: (event: unknown, data?: unknown) => void) {
      this.handlers[event] = handler;
    }
  }
  return { default: FakeHls };
});

let canPlayHls = '';
beforeEach(() => {
  vi.restoreAllMocks();
  hls.supported = true;
  hls.failImport = false;
  hls.instances.length = 0;
  canPlayHls = '';
  vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockImplementation(() => canPlayHls as CanPlayTypeResult);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

/** Renders and lets the component's mount effects run, so the media element exists. */
const mount = async (ui: React.ReactElement) => {
  const view = await render(ui);
  await flush();
  return view;
};

const video = (container: HTMLElement) => container.querySelector('video')!;
const unavailable = () => (document.body.textContent?.includes('Video stream unavailable') ? true : null);

it('renders nothing without a usable source', async () => {
  for (const sourceUrl of [undefined, 42, '   ']) {
    const { container } = await mount(<VideoStream sourceUrl={sourceUrl} />);
    expect(container).toBeEmptyDOMElement();
  }
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
});

it('plays a direct source with the default presentation', async () => {
  const { container } = await mount(<VideoStream sourceUrl=' https://media.example.test/loop.mp4 ' />);
  const element = video(container);
  expect(element.getAttribute('src')).toBe('https://media.example.test/loop.mp4');
  expect(element.load).toHaveBeenCalled();
  expect(element.play).toHaveBeenCalledTimes(1);
  expect(element.getAttribute('poster')).toBeNull();
  expect(element.controls).toBe(false);
  expect(element.loop).toBe(false);
  expect(element.style.objectFit).toBe('cover');
  expect(element.volume).toBe(1);
  expect(element.muted).toBe(false);
});

it('reads scene props given as strings, numbers or booleans', async () => {
  const { container, rerender } = await mount(
    <VideoStream
      sourceUrl='https://media.example.test/loop.mp4'
      posterUrl=' https://media.example.test/poster.jpg '
      showControls='Yes'
      loop={1}
      autoPlay='off'
      objectFit='contain'
      channelGain={1.8}
    />,
  );
  let element = video(container);
  expect(element.getAttribute('poster')).toBe('https://media.example.test/poster.jpg');
  expect(element.controls).toBe(true);
  expect(element.loop).toBe(true);
  expect(element.style.objectFit).toBe('contain');
  expect(element.volume).toBe(1);
  expect(element.play).not.toHaveBeenCalled();

  await rerender(
    <VideoStream
      sourceUrl='https://media.example.test/loop.mp4'
      showControls=''
      loop={0}
      autoPlay='sometimes'
      objectFit='stretch'
      channelGain={0}
    />,
  );
  element = video(container);
  expect(element.controls).toBe(false);
  expect(element.loop).toBe(false);
  expect(element.style.objectFit).toBe('cover');
  expect(element.muted).toBe(true);
  // An unreadable autoPlay keeps its default and plays.
  expect(element.play).toHaveBeenCalled();

  await rerender(
    <VideoStream sourceUrl='https://media.example.test/loop.mp4' showControls={{}} channelGain='loud' />,
  );
  element = video(container);
  expect(element.controls).toBe(false);
  expect(element.volume).toBe(1);
  expect(element.muted).toBe(false);
});

it('ignores a refused autoplay and a cancelled load, but reports a failed one', async () => {
  const play = vi.mocked(HTMLMediaElement.prototype.play);
  for (const name of ['NotAllowedError', 'AbortError']) {
    play.mockRejectedValueOnce(Object.assign(new Error(name), { name }));
    const { unmount } = await mount(<VideoStream sourceUrl='https://media.example.test/a.mp4' />);
    await act(async () => {});
    expect(unavailable()).toBeNull();
    await unmount();
  }
  play.mockRejectedValueOnce(new Error('decode failed'));
  const failed = await mount(<VideoStream sourceUrl='https://media.example.test/b.mp4' />);
  await eventually(() => expect(unavailable()).toBe(true));
  await failed.unmount();

  play.mockRejectedValueOnce('no reason');
  await mount(<VideoStream sourceUrl='https://media.example.test/c.mp4' />);
  await eventually(() => expect(unavailable()).toBe(true));
});

it('drops a play failure that lands after the source changed', async () => {
  let fail!: (error: Error) => void;
  vi.mocked(HTMLMediaElement.prototype.play).mockImplementationOnce(
    () => new Promise((_done, reject) => (fail = reject)),
  );
  const { rerender } = await mount(<VideoStream sourceUrl='https://media.example.test/a.mp4' />);
  await rerender(<VideoStream sourceUrl='https://media.example.test/b.mp4' />);
  await act(async () => fail(new Error('decode failed')));
  expect(unavailable()).toBeNull();
});

it('plays in browsers whose play() returns nothing', async () => {
  vi.mocked(HTMLMediaElement.prototype.play).mockReturnValue(undefined as never);
  await mount(<VideoStream sourceUrl='https://media.example.test/a.mp4' />);
  expect(unavailable()).toBeNull();
});

it('shows a media error until the stream plays again or changes', async () => {
  const { container, rerender } = await mount(<VideoStream sourceUrl='https://media.example.test/a.mp4' />);
  act(() => video(container).dispatchEvent(new Event('error')));
  expect(unavailable()).toBe(true);
  act(() => video(container).dispatchEvent(new Event('playing')));
  expect(unavailable()).toBeNull();
  act(() => video(container).dispatchEvent(new Event('error')));
  await rerender(<VideoStream sourceUrl='https://media.example.test/b.mp4' />);
  expect(unavailable()).toBeNull();
});

it('plays an HLS stream natively where the browser supports it', async () => {
  canPlayHls = 'maybe';
  const { container } = await mount(<VideoStream sourceUrl='https://media.example.test/live.M3U8' />);
  expect(video(container).getAttribute('src')).toBe('https://media.example.test/live.M3U8');
  expect(hls.instances).toHaveLength(0);
});

it('plays an HLS stream through hls.js, starting once the manifest is parsed', async () => {
  const { container, unmount } = await mount(<VideoStream sourceUrl='https://media.example.test/live.m3u8' />);
  await eventually(() => expect(hls.instances).toHaveLength(1));
  const instance = hls.instances[0];
  expect(instance.options).toEqual({ enableWorker: true, lowLatencyMode: true });
  expect(instance.attachMedia).toHaveBeenCalledWith(video(container));
  expect(instance.loadSource).toHaveBeenCalledWith('https://media.example.test/live.m3u8');
  expect(video(container).play).not.toHaveBeenCalled();
  act(() => instance.handlers.manifestParsed({}));
  expect(video(container).play).toHaveBeenCalledTimes(1);
  act(() => instance.handlers.error({}, { fatal: false }));
  act(() => instance.handlers.error({}));
  expect(unavailable()).toBeNull();
  act(() => instance.handlers.error({}, { fatal: true }));
  expect(unavailable()).toBe(true);
  await unmount();
  expect(instance.destroy).toHaveBeenCalled();
  act(() => instance.handlers.error({}, { fatal: true }));
});

it('falls back to native playback where hls.js is unsupported', async () => {
  hls.supported = false;
  const { container } = await mount(<VideoStream sourceUrl='https://media.example.test/live.m3u8' />);
  await eventually(() => expect(video(container).getAttribute('src')).toBe('https://media.example.test/live.m3u8'),
  );
  expect(hls.instances).toHaveLength(0);
});

it('reports a stream whose HLS player could not load', async () => {
  hls.failImport = true;
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  await mount(<VideoStream sourceUrl='https://media.example.test/live.m3u8' />);
  await eventually(() => expect(unavailable()).toBe(true));
  expect(errors).toHaveBeenCalledWith('Failed to initialize HLS playback:', expect.any(Error));
});

it('does nothing when it closes before the HLS player loads, or fails after closing', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  // Closed straight away: the player's import has not resolved yet, so no player is created.
  const closed = await render(<VideoStream sourceUrl='https://media.example.test/live.m3u8' />);
  await closed.unmount();
  await act(async () => {});
  expect(hls.instances).toHaveLength(0);

  // An HLS error that arrives after the element closed is not shown.
  const playing = await render(<VideoStream sourceUrl='https://media.example.test/other.m3u8' />);
  await eventually(() => expect(hls.instances).toHaveLength(1));
  const instance = hls.instances[hls.instances.length - 1];
  await playing.unmount();
  instance.handlers.error(null, { fatal: true });
  expect(unavailable()).toBeNull();
});

// A host that moves the element's volume on its own (WebKitGTK under PipeWire reflects the level
// the system restored for the app's last stream: 0 after a muted, staged scene) must not leave the
// program silent after a take: the channel gain is applied again.
it('keeps the channel gain when the host moves the volume, on every new element', async () => {
  const { container, rerender } = await mount(<VideoStream sourceUrl='https://media.example.test/card.mp4' channelGain={1} />);
  let element = video(container);
  element.volume = 0;
  act(() => element.dispatchEvent(new Event('volumechange')));
  expect(element.volume).toBe(1);
  expect(element.muted).toBe(false);

  // A take to another source makes a new element, with the same gain: it is applied there too.
  await rerender(<VideoStream sourceUrl='https://media.example.test/next.mp4' channelGain={1} />);
  const next = video(container);
  expect(next).not.toBe(element);
  next.volume = 0;
  act(() => next.dispatchEvent(new Event('playing')));
  expect(next.volume).toBe(1);

  // A muted channel stays muted however the host flips it.
  await rerender(<VideoStream sourceUrl='https://media.example.test/next.mp4' channelGain={0} />);
  element = video(container);
  element.muted = false;
  act(() => element.dispatchEvent(new Event('volumechange')));
  expect(element.muted).toBe(true);
  expect(element.volume).toBe(0);
});

it('leaves a host-rounded volume alone and stops following the element once unmounted', async () => {
  const { container, unmount } = await mount(<VideoStream sourceUrl='https://media.example.test/card.mp4' channelGain={0.5} />);
  const element = video(container);
  element.volume = 0.495;
  act(() => element.dispatchEvent(new Event('volumechange')));
  expect(element.volume).toBe(0.495);

  await unmount();
  element.volume = 0;
  act(() => element.dispatchEvent(new Event('volumechange')));
  expect(element.volume).toBe(0);
});
