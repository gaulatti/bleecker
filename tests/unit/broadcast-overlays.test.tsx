import { act } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BroadcastHeader } from '../../src/components/broadcast-header';
import { BroadcastLayout } from '../../src/components/broadcast-layout';
import { Earone } from '../../src/components/earone';
import { Scoreboard } from '../../src/components/scoreboard';
import { render } from './helpers';

// gaulatti/alcantara#383: the broadcast header, scoreboard, Earone badge and the 1920x1080 frame.

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const texts = (container: HTMLElement, selector: string) => [...container.querySelectorAll(selector)].map((node) => node.textContent);

it('shows the header date alone, or the title before it', async () => {
  const { container, rerender } = await render(<BroadcastHeader date='01/02/2027' />);
  expect(container.querySelector('.header-text')!.textContent).toBe('01/02/2027');
  await rerender(<BroadcastHeader title='NEWS' date='01/02/2027' />);
  expect(container.querySelector('.header-text')!.textContent).toBe('NEWS | 01/02/2027');
  await rerender(<BroadcastHeader />);
  expect(container.querySelector('.header-text')!.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
});

it('shows the scoreboard defaults', async () => {
  const { container } = await render(<Scoreboard />);
  expect(container.querySelector('.scoreboard-title')!.textContent).toBe('MATCH');
  expect(texts(container, '.scoreboard-team-label')).toEqual(['HOME', 'AWAY']);
  expect(texts(container, '.scoreboard-team-score')).toEqual(['0', '0']);
  expect(container.querySelector('.scoreboard-period')!.textContent).toBe('1ST');
  expect(container.querySelector('.scoreboard-clock')!.textContent).toBe('00:00');
  expect(container.querySelector('.scoreboard-status')!.textContent).toBe('LIVE');
});

it('shows the given match and can hide the period and the clock', async () => {
  const { container } = await render(
    <Scoreboard title='Final' homeTeam='Lions' awayTeam='Bears' homeScore={3} awayScore='2' period='2ND' clock='45:10' status='HT' showPeriod={false} showClock={false} />
  );
  expect(texts(container, '.scoreboard-team-score')).toEqual(['3', '2']);
  expect(container.querySelector('.scoreboard-period')).toBeNull();
  expect(container.querySelector('.scoreboard-clock')).toBeNull();
  expect(container.querySelector('.scoreboard-status')!.textContent).toBe('HT');
});

it('formats the Earone rank and spins as numbers, strings of digits or text, and shows nothing without either', async () => {
  const { container, rerender } = await render(<Earone rank={1234} spins='5678' />);
  expect(texts(container, '.earone-metric-value')).toEqual(['#1,234', '5,678']);
  await rerender(<Earone rank='  7  ' spins='n/a' />);
  await act(async () => void vi.advanceTimersByTime(200));
  expect(texts(container, '.earone-metric-value')).toEqual(['#7', 'n/a']);
  await rerender(<Earone rank={Number.NaN} spins={null} />);
  await act(async () => void vi.advanceTimersByTime(200));
  expect(texts(container, '.earone-metric-value')).toEqual(['#NaN', '--']);
  await rerender(<Earone rank={undefined} spins='   ' />);
  await act(async () => void vi.advanceTimersByTime(200));
  expect(container).toBeEmptyDOMElement();
});

it('fades the Earone metrics while they change, and draws the partner logo when the host supplies one', async () => {
  const { container, rerender } = await render(<Earone rank={1} spins={2} logoUrl='/partner.svg' label='PARTNER' />);
  const logo = container.querySelector<HTMLImageElement>('img.earone-brand-image')!;
  expect(logo.getAttribute('src')).toBe('/partner.svg');
  expect(logo.alt).toBe('PARTNER');
  await rerender(<Earone rank={2} spins={2} logoUrl='/partner.svg' label='PARTNER' />);
  expect(container.querySelector('.earone-metric--transitioning')).not.toBeNull();
  await act(async () => void vi.advanceTimersByTime(200));
  expect(container.querySelector('.earone-metric--transitioning')).toBeNull();
  expect(texts(container, '.earone-metric-value')[0]).toBe('#2');
  await rerender(<Earone rank={2} spins={2} />);
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('.earone-box')).not.toBeNull();
});

it('lays out the frame with the header, the host clock, the QR code, the live indicator, the chyron and the ticker', async () => {
  const { container } = await render(
    <BroadcastLayout headerTitle='NEWS' headerDate='01/02/2027' hashtag='#tag' url='example.test' showChyron chyronText='Breaking' qrCodeContent='https://example.test' clock={<div className='host-clock'>12:00</div>}>
      <p>Content</p>
    </BroadcastLayout>
  );
  expect(container.querySelector('.broadcast-layout .header-text')!.textContent).toBe('NEWS | 01/02/2027');
  expect(container.querySelector('.host-clock')!.textContent).toBe('12:00');
  expect(container.querySelector('.broadcast-content p')!.textContent).toBe('Content');
  expect(container.querySelector('.live-indicator')).not.toBeNull();
  expect(container.querySelector('.chyron-holder')).not.toBeNull();
  expect(container.querySelector('.qr-code-widget, .qr-widget, [class*="qr"]')).not.toBeNull();
  expect(container.textContent).toContain('#tag');
});

it('leaves out the live indicator, the chyron and the QR code when they are off, and takes a QR code by URL', async () => {
  const { container, rerender } = await render(<BroadcastLayout showLiveIndicator={false} />);
  expect(container.querySelector('.live-indicator')).toBeNull();
  expect(container.querySelector('.chyron-holder')).toBeNull();
  expect(container.querySelector('[class*="qr"]')).toBeNull();
  await rerender(<BroadcastLayout qrCodeUrl='/qr.png' />);
  expect(container.querySelector('[class*="qr"]')).not.toBeNull();
});

it('shows a dash for the rank when only the spins are known', async () => {
  const { container } = await render(<Earone spins={42} />);
  expect(texts(container, '.earone-metric-value')).toEqual(['--', '42']);
});
