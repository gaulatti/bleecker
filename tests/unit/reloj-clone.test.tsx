import { afterEach, describe, expect, it, vi } from 'vitest';
import { RelojClone } from '../../src/components/reloj-clone';
import { render } from './helpers';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

const hand = (container: HTMLElement, name: string) => (container.querySelector(`.${name}`) as HTMLElement).style.transform;

describe('RelojClone', () => {
  it('sets the hands to the wall time in the timezone', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-23T10:30:00Z') });
    const { container } = await render(<RelojClone timezone='UTC' />);
    // 10:30:00 UTC: hour 10 on 12, minute 30, second 0.
    expect(hand(container, 'second-hand')).toBe('rotate(90deg)');
    expect(hand(container, 'minute-hand')).toBe(`rotate(${(30 / 60) * 360 + 90}deg)`);
    expect(hand(container, 'hour-hand')).toBe(`rotate(${(10 / 12) * 360 + (30 / 60) * 30 + 90}deg)`);
  });

  it('shows the logo only when one is given', async () => {
    const plain = await render(<RelojClone />);
    expect(plain.container.querySelector('img')).toBeNull();
    await plain.unmount();

    const branded = await render(<RelojClone logoUrl='https://cdn.example.test/logo.png' />);
    expect(branded.container.querySelector('img')!.getAttribute('src')).toBe('https://cdn.example.test/logo.png');
  });

  it('shows the host broadcast time over the wall time when it returns one', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-23T10:30:00Z') });
    const resolveTimeParts = vi.fn(() => ({ hours: 3, minutes: 0, seconds: 15 }));
    const { container } = await render(<RelojClone timezone='UTC' resolveTimeParts={resolveTimeParts} />);
    expect(resolveTimeParts).toHaveBeenCalled();
    expect(hand(container, 'second-hand')).toBe(`rotate(${(15 / 60) * 360 + 90}deg)`);
    expect(hand(container, 'hour-hand')).toBe(`rotate(${(3 / 12) * 360 + 90}deg)`);
  });

  it('keeps the wall time when the host has no override', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-23T10:30:00Z') });
    const { container } = await render(<RelojClone timezone='UTC' resolveTimeParts={() => null} />);
    expect(hand(container, 'minute-hand')).toBe(`rotate(${(30 / 60) * 360 + 90}deg)`);
  });

  it('falls back to the local clock when the timezone cannot be formatted', async () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 23, 7, 5, 0) });
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
      throw new RangeError('no timezone data');
    });
    const { container } = await render(<RelojClone timezone='Not/AZone' />);
    expect(hand(container, 'hour-hand')).toBe(`rotate(${(7 / 12) * 360 + (5 / 60) * 30 + 90}deg)`);
  });
});

// A part the formatter leaves out reads as the local clock's part.
function partsOf(parts: Array<[string, string]>) {
  vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
    return { formatToParts: () => parts.map(([type, value]) => ({ type, value })) };
  } as never);
}

it('reads a missing hour from the local clock', async () => {
  vi.useFakeTimers({ now: new Date(2026, 10, 23, 7, 5, 0) });
  partsOf([['minute', '5'], ['second', '0']]);
  const { container } = await render(<RelojClone timezone='UTC' />);
  expect(hand(container, 'hour-hand')).toBe(`rotate(${(7 / 12) * 360 + (5 / 60) * 30 + 90}deg)`);
});

it('reads a missing minute from the local clock', async () => {
  vi.useFakeTimers({ now: new Date(2026, 10, 23, 7, 5, 0) });
  partsOf([['hour', '7'], ['second', '0']]);
  const { container } = await render(<RelojClone timezone='UTC' />);
  expect(hand(container, 'minute-hand')).toBe(`rotate(${(5 / 60) * 360 + 90}deg)`);
});

it('reads a missing second from the local clock', async () => {
  vi.useFakeTimers({ now: new Date(2026, 10, 23, 7, 5, 30) });
  partsOf([['hour', '7'], ['minute', '5']]);
  const { container } = await render(<RelojClone timezone='UTC' />);
  expect(hand(container, 'second-hand')).toBe(`rotate(${(30 / 60) * 360 + 90}deg)`);
});

