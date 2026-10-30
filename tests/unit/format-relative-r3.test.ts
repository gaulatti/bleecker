import { afterEach, describe, expect, test, vi } from 'vitest';

import { formatRelativeTime } from '../../src/utils/format';

describe('formatRelativeTime exactly one day ago', () => {
  afterEach(() => vi.useRealTimers());

  test('exactly one day ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-05T12:00:00Z'));
    expect(formatRelativeTime('2024-03-04T12:00:00Z')).toBe('yesterday');
  });
});
