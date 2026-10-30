import { describe, expect, test } from 'vitest';

import { formatCompactNumber } from '../../src/utils/format';

describe('formatCompactNumber lab3 cases', () => {
  test('formatCompactNumber renders a regular and an edge value', () => {
    expect(formatCompactNumber(1200000, { locale: 'en-US' })).toBe('1.2M');
    expect(formatCompactNumber(999, { locale: 'en-US' })).toBe('999');
  });
});
