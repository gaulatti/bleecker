import { describe, expect, test } from 'vitest';

import { formatCurrency } from '../../src/utils/format';

describe('formatCurrency extra coverage', () => {
  test('formatCurrency renders a known value', () => {
    expect(formatCurrency(1234.5, 'USD', { locale: 'en-US' })).toBe('$1,234.50');
  });
});
