import { describe, expect, test } from 'vitest';

import { formatDate } from '../../src/utils/format';

describe('formatDate lab3 cases', () => {
  test('formatDate renders a regular and an edge value', () => {
    expect(formatDate('2024-03-05T10:20:00Z', { locale: 'en-US', timeZone: 'UTC', dateStyle: 'short' })).toBe('3/5/24');
    expect(formatDate('2024-03-05T10:20:00Z', { locale: 'en-US', timeZone: 'UTC', dateStyle: 'full' })).toBe('Tuesday, March 5, 2024');
  });
});
