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

// The formatter reports only the parts given; a missing one reads as zero.
function partsOf(parts: Array<[string, string]>) {
  vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
    return { formatToParts: () => parts.map(([type, value]) => ({ type, value })) };
  } as never);
}

const hand = (container: HTMLElement, index: number) => Number(container.querySelectorAll('svg line')[index].getAttribute('x2'));
const RADIUS = 200;
const hourX = (degrees: number) => Math.sin((degrees * Math.PI) / 180) * RADIUS * 0.55;
const minuteX = (degrees: number) => Math.sin((degrees * Math.PI) / 180) * RADIUS * 0.78;

it('reads a missing hour as zero', async () => {
  partsOf([['minute', '30'], ['second', '0']]);
  const { container } = await render(<RelojLoopClock timezone='Europe/Madrid' />);
  // Hour 0 plus 30 minutes is 15 degrees on the hour hand.
  expect(hand(container, 12)).toBeCloseTo(hourX(15), 5);
});

it('reads a missing minute as zero', async () => {
  partsOf([['hour', '3'], ['second', '0']]);
  const { container } = await render(<RelojLoopClock timezone='Europe/Madrid' />);
  expect(hand(container, 12)).toBeCloseTo(hourX(90), 5);
  expect(hand(container, 13)).toBeCloseTo(minuteX(0), 5);
});

it('reads a missing second as zero', async () => {
  partsOf([['hour', '0'], ['minute', '1']]);
  const { container } = await render(<RelojLoopClock timezone='Europe/Madrid' />);
  // One minute is 6 degrees, with no seconds added.
  expect(hand(container, 13)).toBeCloseTo(minuteX(6), 5);
});

