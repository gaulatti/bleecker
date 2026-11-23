import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Slideshow } from '../../src/components/slideshow';
import { render } from './helpers';

// Prop normalization, the image-list shapes, shuffle, and the load/error paths of the slideshow.

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const imgs = (container: HTMLElement) => Array.from(container.querySelectorAll('img'));
const loadAll = (container: HTMLElement) => imgs(container).forEach((img) => act(() => img.dispatchEvent(new Event('load'))));

describe('Slideshow prop normalization', () => {
  it('falls back to the default interval for a non-numeric value and clamps a short one', async () => {
    vi.useFakeTimers();
    const fallback = await render(<Slideshow images={['/a.avif', '/b.avif']} intervalMs='soon' transitionMs='250' kenBurns={false} />);
    loadAll(fallback.container);
    act(() => vi.advanceTimersByTime(4999));
    expect(imgs(fallback.container)[0].style.opacity).toBe('1');
    act(() => vi.advanceTimersByTime(1));
    expect(imgs(fallback.container)[1].style.opacity).toBe('1');
    await fallback.unmount();

    const clamped = await render(<Slideshow images={['/a.avif', '/b.avif']} intervalMs={10} kenBurns={false} />);
    loadAll(clamped.container);
    act(() => vi.advanceTimersByTime(999));
    expect(imgs(clamped.container)[0].style.opacity).toBe('1');
    act(() => vi.advanceTimersByTime(1));
    expect(imgs(clamped.container)[1].style.opacity).toBe('1');
  });

  it('reads booleans from numbers and the usual strings, and falls back on anything else', async () => {
    vi.useFakeTimers();
    const off = await render(<Slideshow images={['/a.avif']} kenBurns={0} />);
    expect(imgs(off.container)[0].style.animation).toBe('');
    await off.unmount();

    const on = await render(<Slideshow images={['/a.avif']} kenBurns='on' />);
    loadAll(on.container);
    act(() => vi.advanceTimersByTime(50));
    expect(imgs(on.container)[0].style.animation).toContain('slideshowKenBurns');
    await on.unmount();

    const unknown = await render(<Slideshow images={['/a.avif']} kenBurns='sometimes' />);
    loadAll(unknown.container);
    act(() => vi.advanceTimersByTime(50));
    expect(imgs(unknown.container)[0].style.animation).toContain('slideshowKenBurns');
  });
});

describe('Slideshow image list shapes', () => {
  it('reads urls from objects, comma and newline lists, and the items or images of a record', async () => {
    const entries = await render(
      <Slideshow images={[{ url: '/x.avif' }, null, 7, ['nested'], { url: 5 }, '/y.avif, /z.avif']} kenBurns={false} />,
    );
    expect(imgs(entries.container).map((img) => img.getAttribute('src'))).toEqual(['/x.avif', '/y.avif', '/z.avif']);
    await entries.unmount();

    const text = await render(<Slideshow images={'a.avif\nb.avif,c.avif'} kenBurns={false} />);
    expect(imgs(text.container)).toHaveLength(3);
    await text.unmount();

    const record = await render(
      <Slideshow images={{ items: [{ url: '/i.avif' }, null, { url: 1 }], images: ['/m.avif', 4] }} kenBurns={false} />,
    );
    expect(imgs(record.container).map((img) => img.getAttribute('src'))).toEqual(['/i.avif', '/m.avif']);
  });

  it('shows nothing for an empty list, a missing list, or a record without images', async () => {
    for (const images of [[], null, undefined, {}, { other: 1 }, 42]) {
      const view = await render(<Slideshow images={images} />);
      expect(view.container.querySelector('img')).toBeNull();
      await view.unmount();
    }
  });

  it('shows each url once', async () => {
    const view = await render(<Slideshow images={['/a.avif', '/a.avif', '/b.avif']} kenBurns={false} />);
    expect(imgs(view.container)).toHaveLength(2);
  });
});

describe('Slideshow frame changes', () => {
  it('picks the next loaded image at random when shuffling', async () => {
    vi.useFakeTimers();
    // First draw repeats the current position, so the picker draws again and moves on.
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.99);
    const view = await render(<Slideshow images={['/a.avif', '/b.avif', '/c.avif']} intervalMs={1000} shuffle='yes' kenBurns={false} />);
    loadAll(view.container);
    act(() => vi.advanceTimersByTime(1000));
    expect(imgs(view.container)[2].style.opacity).toBe('1');
  });

  it('keeps a single image on screen without cycling', async () => {
    vi.useFakeTimers();
    const view = await render(<Slideshow images={['/a.avif']} intervalMs={1000} shuffle kenBurns={false} />);
    loadAll(view.container);
    act(() => vi.advanceTimersByTime(5000));
    expect(imgs(view.container)[0].style.opacity).toBe('1');
  });

  it('reads a shuffle switched off by a string, and ignores an unreadable one', async () => {
    vi.useFakeTimers();
    const off = await render(<Slideshow images={['/a.avif', '/b.avif']} intervalMs={1000} shuffle='false' kenBurns={false} />);
    loadAll(off.container);
    act(() => vi.advanceTimersByTime(1000));
    expect(imgs(off.container)[1].style.opacity).toBe('1');
    await off.unmount();

    const unreadable = await render(<Slideshow images={['/a.avif', '/b.avif']} intervalMs={1000} shuffle={null} kenBurns={false} />);
    loadAll(unreadable.container);
    act(() => vi.advanceTimersByTime(1000));
    expect(imgs(unreadable.container)[1].style.opacity).toBe('1');
  });

  it('ignores a second load of an image it already has, and a failure of one it lacks', async () => {
    vi.useFakeTimers();
    const view = await render(<Slideshow images={['/a.avif', '/b.avif']} kenBurns={false} />);
    const [first] = imgs(view.container);
    act(() => first.dispatchEvent(new Event('load')));
    act(() => first.dispatchEvent(new Event('load')));
    act(() => imgs(view.container)[1].dispatchEvent(new Event('error')));
    expect(first.style.opacity).toBe('1');
  });

  it('moves on when the showing image fails to load', async () => {
    vi.useFakeTimers();
    const view = await render(<Slideshow images={['/a.avif', '/b.avif']} intervalMs={1000} kenBurns={false} />);
    loadAll(view.container);
    act(() => imgs(view.container)[0].dispatchEvent(new Event('error')));
    expect(imgs(view.container)[1].style.opacity).toBe('1');
  });

  it('restarts from the first image when the list shrinks, and shows nothing when it empties', async () => {
    vi.useFakeTimers();
    const view = await render(<Slideshow images={['/a.avif', '/b.avif', '/c.avif']} intervalMs={1000} kenBurns={false} />);
    loadAll(view.container);
    act(() => vi.advanceTimersByTime(1000));
    expect(imgs(view.container)[1].style.opacity).toBe('1');
    await view.rerender(<Slideshow images={['/a.avif']} intervalMs={1000} kenBurns={false} />);
    expect(imgs(view.container)).toHaveLength(1);
    await view.rerender(<Slideshow images={[]} intervalMs={1000} kenBurns={false} />);
    expect(view.container.querySelector('img')).toBeNull();
  });

  it('ignores a fade-out timer that belongs to a frame already replaced', async () => {
    vi.useFakeTimers();
    const fadeTimers: Array<() => void> = [];
    const realSetTimeout = window.setTimeout.bind(window);
    vi.spyOn(window, 'setTimeout').mockImplementation(((handler: () => void, ms?: number, ...rest: unknown[]) => {
      if (ms === 900) fadeTimers.push(handler);
      return realSetTimeout(handler, ms, ...rest);
    }) as typeof window.setTimeout);

    const view = await render(<Slideshow images={['/a.avif', '/b.avif', '/c.avif']} intervalMs={1000} transitionMs={900} kenBurns={false} />);
    loadAll(view.container);
    act(() => vi.advanceTimersByTime(1000));
    const staleFade = fadeTimers[0];
    act(() => vi.advanceTimersByTime(1000));
    act(() => staleFade());
    expect(imgs(view.container)[2].style.opacity).toBe('1');
  });
});
