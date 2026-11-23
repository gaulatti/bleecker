import { act } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LogoWidget } from '../../src/components/logo-widget';
import { render } from './helpers';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

const widget = (container: HTMLElement) => container.querySelector('.logo-widget') as HTMLElement;

it('shows the given logo image instead of the bug', async () => {
  const { container } = await render(<LogoWidget logoUrl='https://cdn.example.test/logo.png' position='top-right' />);
  expect(container.querySelector('.logo-image')!.getAttribute('src')).toBe('https://cdn.example.test/logo.png');
  expect(container.querySelector('.logo-svg')).toBeNull();
  expect(widget(container).classList.contains('top-right')).toBe(true);
});

it('starts as the white bug, bottom-right, with the gradient off', async () => {
  const { container } = await render(<LogoWidget />);
  expect(widget(container).classList.contains('bottom-right')).toBe(true);
  expect(widget(container).classList.contains('variant-white')).toBe(true);
  expect(widget(container).classList.contains('gradient-active')).toBe(false);
  expect(container.querySelectorAll('.logo-svg')).toHaveLength(2);
});

it('cycles gradient, then black, on the ten-second beat', async () => {
  const { container } = await render(<LogoWidget />);
  await act(async () => vi.advanceTimersByTime(10000));
  expect(widget(container).classList.contains('gradient-active')).toBe(true);

  await act(async () => vi.advanceTimersByTime(10000));
  await act(async () => vi.advanceTimersByTime(100));
  expect(widget(container).classList.contains('variant-black')).toBe(true);
  expect(widget(container).classList.contains('gradient-active')).toBe(false);
});

it('grows to the big bug after the black phase, then turns red', async () => {
  // Each phase takes two beats: the gradient comes on, then the bug moves on.
  const { container } = await render(<LogoWidget />);
  const beat = () => act(async () => vi.advanceTimersByTime(10000));
  await beat(); // gradient on
  await beat(); // black, small
  await act(async () => vi.advanceTimersByTime(100));
  await beat(); // gradient on
  await beat(); // grows
  expect(widget(container).classList.contains('resizing')).toBe(true);
  await act(async () => vi.advanceTimersByTime(800));
  expect(widget(container).classList.contains('big-mode')).toBe(true);
  expect(widget(container).classList.contains('resizing')).toBe(false);

  await beat(); // gradient on
  await beat(); // shrinks back to red, small
  expect(widget(container).classList.contains('big-mode')).toBe(false);
  await act(async () => vi.advanceTimersByTime(800));
  expect(widget(container).classList.contains('variant-red')).toBe(true);
});

it('stops the cycle when unmounted', async () => {
  const { container, unmount } = await render(<LogoWidget />);
  await unmount();
  expect(container.querySelector('.logo-widget')).toBeNull();
  await act(async () => vi.advanceTimersByTime(30000));
});
