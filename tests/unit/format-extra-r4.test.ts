import { describe, expect, test } from 'vitest';

import { formatNumber } from '../../src/utils/format';

describe('formatNumber extra coverage', () => {
  test('formatNumber renders a known value', () => {
    expect(formatNumber(1000000, { locale: 'en-US' })).toBe('1,000,000');
  });
});
