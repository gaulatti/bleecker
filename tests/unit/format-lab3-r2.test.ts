import { describe, expect, test } from 'vitest';

import { formatPercent } from '../../src/utils/format';

describe('formatPercent lab3 cases', () => {
  test('formatPercent renders a regular and an edge value', () => {
    expect(formatPercent(0.5, { locale: 'en-US' })).toBe('50.0%');
    expect(formatPercent(1, { locale: 'en-US' })).toBe('100.0%');
  });
});
