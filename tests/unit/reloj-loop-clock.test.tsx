import { act } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { RelojLoopClock } from '../../src/components/reloj-loop-clock';
import { render } from './helpers';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const label = (container: HTMLElement) => container.querySelector('.reloj-loop-city-label')!;

it('starts on the city of the timezone it is given', async () => {
  vi.useFakeTimers({ now: new Date('2026-11-23T10:30:20Z') });
  const { container } = await render(<RelojLoopClock timezone='America/New_York' />);
  expect(label(container).textContent).toBe('NEW YORK');
});

it('starts on Madrid for a timezone outside the loop', async () => {
  vi.useFakeTimers({ now: new Date('2026-11-23T10:30:20Z') });
  const { container } = await render(<RelojLoopClock timezone='Asia/Tokyo' />);
  expect(label(container).textContent).toBe('MADRID');
});

it('moves to the next city at the top of the minute, after the fade', async () => {
  vi.useFakeTimers({ now: new Date('2026-11-23T09:59:59Z') });
  const { container } = await render(<RelojLoopClock timezone='Europe/Madrid' />);
  expect(label(container).textContent).toBe('MADRID');
  await act(async () => vi.advanceTimersByTime(1000));
  expect(container.querySelector('.reloj-loop-analog--out')).not.toBeNull();
  await act(async () => vi.advanceTimersByTime(500));
  expect(label(container).textContent).toBe('SANREMO');
  expect(container.querySelector('.reloj-loop-analog--out')).toBeNull();
});

it('keeps the city between minutes', async () => {
  vi.useFakeTimers({ now: new Date('2026-11-23T10:00:30Z') });
  const { container } = await render(<RelojLoopClock timezone='Europe/Madrid' />);
  await act(async () => vi.advanceTimersByTime(20000));
  expect(label(container).textContent).toBe('MADRID');
});


it('uses the local clock when the timezone cannot be formatted', async () => {
  vi.useFakeTimers({ now: new Date(2026, 10, 23, 7, 5, 30) });
  vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
    throw new RangeError('no timezone data');
  });
  const { container } = await render(<RelojLoopClock timezone='Europe/Madrid' />);
  expect(label(container).textContent).toBe('MADRID');
});
