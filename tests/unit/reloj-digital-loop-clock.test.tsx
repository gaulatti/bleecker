import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { RelojDigitalLoopClock } from '../../src/components/reloj-digital-loop-clock';
import { eventually, render } from './helpers';

const text = (container: HTMLElement, selector: string) => container.querySelector(selector)?.textContent ?? null;

describe('RelojDigitalLoopClock', () => {
  it('shows the city for its timezone and the brand mark the host supplies', async () => {
    const { container } = await render(<RelojDigitalLoopClock timezone='America/New_York' brandMark={<span data-testid='mark'>mark</span>} />);
    expect(text(container, '#city-name')).toBe('NEW YORK');
    expect(container.querySelector('[data-testid="mark"]')).not.toBeNull();
    expect(container.querySelector('#reloj-mark')!.textContent).toContain('mark');
  });

  it('falls back to the first city for a timezone outside the loop', async () => {
    const { container } = await render(<RelojDigitalLoopClock timezone='Asia/Tokyo' />);
    expect(text(container, '#city-name')).toBe('SANREMO');
  });

  it('shows the title and call-to-action the host resolves, trimmed', async () => {
    const { container } = await render(<RelojDigitalLoopClock titleText='  EN VIVO  ' ctaText=' Sintonizá ' />);
    await eventually(() => expect(container.querySelector('#lower-third')).not.toBeNull());
    expect(text(container, '#cta')).toBe('Sintonizá');
    await eventually(() => expect(container.querySelector('#show-title')).not.toBeNull());
  });

  it('shows no lower third without a title or call-to-action', async () => {
    const { container } = await render(<RelojDigitalLoopClock titleText='   ' ctaText='' />);
    expect(container.querySelector('#lower-third')).toBeNull();
  });

  it('starts the countdown when its command advances, and reports completion once', async () => {
    const onCountdownComplete = vi.fn();
    const view = await render(
      <RelojDigitalLoopClock mode='countdown' countdownDuration={0} countdownCommand={0} onCountdownComplete={onCountdownComplete} />,
    );
    await view.rerender(
      <RelojDigitalLoopClock mode='countdown' countdownDuration={0} countdownCommand={1} onCountdownComplete={onCountdownComplete} />,
    );
    await eventually(() => expect(onCountdownComplete).toHaveBeenCalledTimes(1));
    expect(text(view.container, '#clock')).toBe('00:00:00');
    expect(text(view.container, '#city-name')).toBe('COUNTDOWN');
  });

  it('shows the full countdown before it is started', async () => {
    const { container } = await render(<RelojDigitalLoopClock mode='countdown' countdownDuration={300} countdownCommand={0} />);
    expect(text(container, '#clock')).toBe('00:05:00');
  });

  it('completes a countdown without a host callback', async () => {
    const view = await render(<RelojDigitalLoopClock mode='countdown' countdownDuration={0} countdownCommand={0} />);
    await view.rerender(<RelojDigitalLoopClock mode='countdown' countdownDuration={0} countdownCommand={1} />);
    await eventually(() => expect(text(view.container, '#clock')).toBe('00:00:00'));
  });

  it('settles the flight-board title onto its final letters', async () => {
    const { container } = await render(<RelojDigitalLoopClock titleText='HOLA' ctaText='' />);
    await eventually(() => expect(text(container, '#show-title')).toBe('HOLA'), 3000);
  });

  it('runs a countdown until a second command stops it, then holds at zero', async () => {
    const onCountdownComplete = vi.fn();
    const view = await render(
      <RelojDigitalLoopClock mode='countdown' countdownDuration={60} countdownCommand={0} onCountdownComplete={onCountdownComplete} />,
    );
    await view.rerender(
      <RelojDigitalLoopClock mode='countdown' countdownDuration={60} countdownCommand={1} onCountdownComplete={onCountdownComplete} />,
    );
    await eventually(() => expect(text(view.container, '#city-name')).toBe('COUNTDOWN'));
    expect(text(view.container, '#clock')).not.toBe('00:00:00');
    await view.rerender(
      <RelojDigitalLoopClock mode='countdown' countdownDuration={60} countdownCommand={2} onCountdownComplete={onCountdownComplete} />,
    );
    await eventually(() => expect(text(view.container, '#clock')).toBe('00:00:00'));
    expect(onCountdownComplete).not.toHaveBeenCalled();
    expect(text(view.container, '#city-name')).toBe('');
  });

  it('restarts a running countdown when its duration changes', async () => {
    const view = await render(<RelojDigitalLoopClock mode='countdown' countdownDuration={60} countdownCommand={0} />);
    await view.rerender(<RelojDigitalLoopClock mode='countdown' countdownDuration={60} countdownCommand={1} />);
    await eventually(() => expect(text(view.container, '#city-name')).toBe('COUNTDOWN'));
    await view.rerender(<RelojDigitalLoopClock mode='countdown' countdownDuration={120} countdownCommand={1} />);
    await eventually(() => expect(text(view.container, '#clock')).toMatch(/^00:0[12]:/));
  });

  it('cycles the clock through the loop cities at the half minute', async () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 23, 9, 59, 29) });
    try {
      const { container } = await render(<RelojDigitalLoopClock mode='clock' timezone='Europe/Madrid' />);
      expect(text(container, '#city-name')).toBe('MADRID');
      await act(async () => vi.advanceTimersByTime(1000));
      await act(async () => vi.advanceTimersByTime(500));
      expect(text(container, '#city-name')).toBe('MONTEVIDEO');
    } finally {
      vi.useRealTimers();
    }
  });

  it('reads the clock when the formatter reports no parts, and falls back when it fails', async () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 23, 7, 5, 30) });
    try {
      vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
        return { formatToParts: () => [] };
      } as never);
      const empty = await render(<RelojDigitalLoopClock mode='clock' timezone='Europe/Madrid' />);
      await act(async () => vi.advanceTimersByTime(40));
      expect(text(empty.container, '#clock')).toBe('00:00:00');
      await empty.unmount();
      vi.restoreAllMocks();

      vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
        throw new RangeError('no timezone data');
      } as never);
      const failed = await render(<RelojDigitalLoopClock mode='clock' timezone='Europe/Madrid' />);
      await act(async () => vi.advanceTimersByTime(40));
      expect(text(failed.container, '#clock')).toMatch(/^\d\d:\d\d:\d\d$/);
    } finally {
      vi.restoreAllMocks();
      vi.useRealTimers();
    }
  });

  it('keeps its city between the half minutes', async () => {
    vi.useFakeTimers({ now: new Date(2026, 10, 23, 10, 0, 10) });
    try {
      const { container } = await render(<RelojDigitalLoopClock mode='clock' timezone='Europe/Madrid' />);
      await act(async () => vi.advanceTimersByTime(1000));
      await act(async () => vi.advanceTimersByTime(1000));
      expect(text(container, '#city-name')).toBe('MADRID');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps a countdown idle when its command is withdrawn', async () => {
    const view = await render(<RelojDigitalLoopClock mode='countdown' countdownDuration={300} countdownCommand={0} />);
    await view.rerender(<RelojDigitalLoopClock mode='countdown' countdownDuration={300} />);
    expect(text(view.container, '#clock')).toBe('00:05:00');
    expect(text(view.container, '#city-name')).toBe('');
  });
});

