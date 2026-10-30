import { describe, expect, test } from 'vitest';

import { formatNumber } from '../../src/utils/format';

describe('formatNumber extra coverage', () => {
  test('formatNumber renders a known value', () => {
    expect(formatNumber(1234567, { locale: 'de-DE' })).toBe('1.234.567');
  });
});
