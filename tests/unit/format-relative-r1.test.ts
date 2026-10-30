import { afterEach, describe, expect, test, vi } from 'vitest';

import { formatRelativeTime } from '../../src/utils/format';

describe('formatRelativeTime future days', () => {
  afterEach(() => vi.useRealTimers());

  test('future days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-05T12:00:00Z'));
    expect(formatRelativeTime('2024-03-07T12:00:00Z')).toBe('in 2 days');
  });
});
