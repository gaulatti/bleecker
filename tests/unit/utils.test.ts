import { describe, expect, test } from 'vitest';

import { pickColor, chartTheme } from '../../src/components/chart-theme';
import { resolveTheme } from '../../src/core/contracts';
import { createAttentionColor } from '../../src/utils/attention-color';

describe('createAttentionColor', () => {
  test('mixes the category hue and red by intensity', () => {
    const result = createAttentionColor({ hue: 200, intensity: 2 });
    expect(result.redMix).toBe(20);
    expect(result.intensity).toBe(2);
    expect(result.coverage).toBeCloseTo(38.4);
    expect(result.accent).toBe('color-mix(in oklab, hsl(200 66% 52%) 80%, hsl(6 78% 56%) 20%)');
    expect(result.style.background).toContain('linear-gradient(45deg');
    expect(result.style.borderColor).toContain(result.accent);
  });

  test('clamps intensity and normalizes the hue into 0-359', () => {
    expect(createAttentionColor({ hue: -10, intensity: 99 }).intensity).toBe(10);
    expect(createAttentionColor({ hue: -10, intensity: -4 }).intensity).toBe(0);
    expect(createAttentionColor({ hue: 725, intensity: 1 }).accent).toContain('hsl(5 66% 52%)');
  });

  test('uses neutral defaults for non-finite input', () => {
    const result = createAttentionColor({ hue: Number.NaN, intensity: Number.NaN });
    expect(result.intensity).toBe(0);
    expect(result.accent).toContain('hsl(210 66% 52%)');
  });
});

describe('pickColor', () => {
  test('wraps around the palette', () => {
    const { palette } = chartTheme;
    expect(pickColor(0)).toBe(palette[0]);
    expect(pickColor(palette.length + 1)).toBe(palette[1]);
  });
});

describe('resolveTheme', () => {
  test('resolves system by the dark preference and passes explicit modes through', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});
