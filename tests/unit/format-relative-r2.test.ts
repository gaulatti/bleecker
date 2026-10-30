import { afterEach, describe, expect, test, vi } from 'vitest';

import { formatRelativeTime } from '../../src/utils/format';

describe('formatRelativeTime past seconds', () => {
  afterEach(() => vi.useRealTimers());

  test('past seconds', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-05T12:00:00Z'));
    expect(formatRelativeTime('2024-03-05T11:59:30Z')).toBe('30 seconds ago');
  });
});
