import { afterEach, expect, it, vi } from 'vitest';
import { ClockWidget } from '../../src/components/clock-widget';
import { render } from './helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

const timeText = (container: HTMLElement) => container.querySelector('.font-semibold')!.textContent;

it('shows the time the host formats, every second', async () => {
  const formatTime = vi.fn(() => '21:45');
  const { container } = await render(<ClockWidget showIcon={false} formatTime={formatTime} />);
  expect(timeText(container)).toBe('21:45');
  expect(formatTime).toHaveBeenCalled();
});

it('formats in the given timezone and locale by default', async () => {
  const { container } = await render(<ClockWidget showIcon={false} timezone='America/New_York' locale='en-US' />);
  const expected = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false });
  expect(timeText(container)).toBe(expected);
});

it('falls back to local HH:MM and reports an invalid timezone', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { container } = await render(<ClockWidget showIcon={false} timezone='Not/AZone' />);
  const now = new Date();
  expect(timeText(container)).toBe(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  expect(errors).toHaveBeenCalledWith('Invalid timezone:', 'Not/AZone');
});

it('shows the given icon image by default', async () => {
  const { container } = await render(<ClockWidget iconUrl='https://cdn.example.test/icon.png' />);
  expect(container.querySelector('img')!.getAttribute('src')).toBe('https://cdn.example.test/icon.png');
});

it('shows no icon when showIcon is off', async () => {
  const { container } = await render(<ClockWidget showIcon={false} iconUrl='https://cdn.example.test/icon.png' />);
  expect(container.querySelector('img')).toBeNull();
});
