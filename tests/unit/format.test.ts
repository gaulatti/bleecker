import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  formatCompactNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime
} from '../../src/utils/format';

describe('number formatters', () => {
  test.each([undefined, null, Number.NaN])('return an empty string for %s', value => {
    expect(formatNumber(value)).toBe('');
    expect(formatCurrency(value)).toBe('');
    expect(formatCompactNumber(value)).toBe('');
    expect(formatPercent(value)).toBe('');
  });

  test('formatNumber honours locale and Intl options', () => {
    expect(formatNumber(1234.5)).toBe('1,234.5');
    expect(formatNumber(1234.5, { locale: 'de-DE' })).toBe('1.234,5');
    expect(formatNumber(1234.5678, { locale: 'en-US', maximumFractionDigits: 1 })).toBe('1,234.6');
  });

  test('formatCurrency defaults to USD and accepts a currency and locale', () => {
    expect(formatCurrency(12.5)).toBe('$12.50');
    expect(formatCurrency(12.5, 'EUR', { locale: 'de-DE' })).toBe('12,50 €');
  });

  test('formatCompactNumber abbreviates large values', () => {
    expect(formatCompactNumber(1500, { locale: 'en-US' })).toBe('1.5K');
  });

  test('formatPercent uses one fractional digit by default', () => {
    expect(formatPercent(0.256, { locale: 'en-US' })).toBe('25.6%');
    expect(formatPercent(0.25, { locale: 'en-US', minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe('25%');
  });
});

describe('date formatters', () => {
  const iso = '2024-03-05T10:20:00Z';

  test.each([undefined, null, 'not a date', new Date(Number.NaN)])('return an empty string for %s', value => {
    expect(formatDate(value)).toBe('');
    expect(formatDateTime(value)).toBe('');
    expect(formatRelativeTime(value)).toBe('');
  });

  test('formatDate accepts strings, numbers and Dates with a default medium style', () => {
    const options = { locale: 'en-US', timeZone: 'UTC' };
    expect(formatDate(iso, options)).toBe('Mar 5, 2024');
    expect(formatDate(Date.parse(iso), options)).toBe('Mar 5, 2024');
    expect(formatDate(new Date(iso), options)).toBe('Mar 5, 2024');
    expect(formatDate(iso, { ...options, dateStyle: 'long' })).toBe('March 5, 2024');
  });

  test('formatDateTime renders a short date and time', () => {
    const normalize = (text: string) => text.replace(/\s/g, ' ');
    expect(normalize(formatDateTime(iso, { locale: 'en-US', timeZone: 'UTC' }))).toBe('3/5/24, 10:20 AM');
    expect(normalize(formatDateTime(new Date(iso), { locale: 'en-US', timeZone: 'UTC' }))).toBe('3/5/24, 10:20 AM');
  });

  describe('formatRelativeTime', () => {
    afterEach(() => vi.useRealTimers());

    test('picks the largest fitting unit', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-05T12:00:00Z'));
      expect(formatRelativeTime(new Date('2024-03-05T12:00:30Z'))).toBe('in 30 seconds');
      expect(formatRelativeTime('2024-03-05T11:55:00Z')).toBe('5 minutes ago');
      expect(formatRelativeTime(Date.parse('2024-03-05T15:00:00Z'))).toBe('in 3 hours');
      expect(formatRelativeTime('2024-03-03T12:00:00Z')).toBe('2 days ago');
      expect(formatRelativeTime('2024-03-05T11:55:00Z', 'es')).toBe('hace 5 minutos');
      expect(formatRelativeTime('2024-03-05T11:00:00Z')).toBe('1 hour ago');
      expect(formatRelativeTime('2024-03-05T10:00:00Z')).toBe('2 hours ago');
    });
  });
});
