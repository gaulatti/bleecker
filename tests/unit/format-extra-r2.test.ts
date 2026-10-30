import { describe, expect, test } from 'vitest';

import { formatCompactNumber } from '../../src/utils/format';

describe('formatCompactNumber extra coverage', () => {
  test('formatCompactNumber renders a known value', () => {
    expect(formatCompactNumber(1500, { locale: 'en-US' })).toBe('1.5K');
  });
});
