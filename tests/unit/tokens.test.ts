import { describe, expect, test } from 'vitest';

import * as tokens from '../../src/tokens/source';

// gaulatti/bleecker#550 (bleecker#549 phase 1): the token refresh is additive.
// Thompson reads radii, spacing and themes directly, so no existing export, key or
// type may be removed, renamed or retyped. The pin below was taken from the source
// before this change; a new key may be added, an old one may not go.

type Pin = Record<string, string | Record<string, string>>;

const existing: Pin = {
  "fontFamilies": {
    "primary": "string",
    "secondary": "string"
  },
  "fontWeights": {
    "regular": "string",
    "medium": "string",
    "semibold": "string",
    "bold": "string"
  },
  "spacing": {
    "detail": "number",
    "inline": "number",
    "control": "number",
    "component": "number",
    "group": "number",
    "container": "number",
    "section": "number",
    "page": "number"
  },
  "radii": {
    "button": "number",
    "card": "number",
    "ui": "number",
    "dialog": "number",
    "pill": "number"
  },
  "durations": {
    "fast": "number",
    "standard": "number",
    "deliberate": "number",
    "enter": "number",
    "exit": "number",
    "control": "number",
    "surface": "number",
    "overlay": "number",
    "motionExit": "number"
  },
  "letterSpacing": {
    "refined": "number",
    "ui": "number",
    "elegant": "number"
  },
  "easing": {
    "spring": "array",
    "bouncy": "array",
    "outExpo": "array",
    "premium": "array"
  },
  "shadows": {
    "surface": "string",
    "raised": "string",
    "overlay": "string"
  },
  "lightColors": {
    "dusk": "string",
    "deepSea": "string",
    "accentOxblood": "string",
    "accentBronze": "string",
    "accentRed": "string",
    "accentYellow": "string",
    "persgray50": "string",
    "sand": "string",
    "desert": "string",
    "terracotta": "string",
    "sea": "string",
    "lightSand": "string",
    "darkSand": "string",
    "sunset": "string",
    "accentGold": "string",
    "accentText": "string",
    "accentBlue": "string",
    "textPrimary": "string",
    "textSecondary": "string",
    "background": "string",
    "foreground": "string",
    "card": "string",
    "cardForeground": "string",
    "popover": "string",
    "popoverForeground": "string",
    "muted": "string",
    "mutedForeground": "string",
    "border": "string",
    "input": "string",
    "ring": "string",
    "primary": "string",
    "primaryForeground": "string",
    "secondary": "string",
    "secondaryForeground": "string",
    "destructive": "string",
    "destructiveForeground": "string",
    "accent": "string",
    "accentForeground": "string"
  },
  "darkColors": {
    "dusk": "string",
    "deepSea": "string",
    "accentOxblood": "string",
    "accentBronze": "string",
    "accentRed": "string",
    "accentYellow": "string",
    "persgray50": "string",
    "sand": "string",
    "desert": "string",
    "terracotta": "string",
    "sea": "string",
    "lightSand": "string",
    "darkSand": "string",
    "sunset": "string",
    "accentGold": "string",
    "accentText": "string",
    "accentBlue": "string",
    "textPrimary": "string",
    "textSecondary": "string",
    "background": "string",
    "foreground": "string",
    "card": "string",
    "cardForeground": "string",
    "popover": "string",
    "popoverForeground": "string",
    "muted": "string",
    "mutedForeground": "string",
    "border": "string",
    "input": "string",
    "ring": "string",
    "primary": "string",
    "primaryForeground": "string",
    "secondary": "string",
    "secondaryForeground": "string",
    "destructive": "string",
    "destructiveForeground": "string",
    "accent": "string",
    "accentForeground": "string"
  },
  "themes": {
    "light": "object",
    "dark": "object"
  }
};

const typeOf = (value: unknown): string => (Array.isArray(value) ? 'array' : typeof value);

describe('existing tokens keep their names and types', () => {
  for (const [name, expected] of Object.entries(existing)) {
    test(name, () => {
      const actual = (tokens as unknown as Record<string, unknown>)[name];
      expect(actual, `${name} was removed or renamed`).toBeDefined();
      if (typeof expected === 'string') {
        expect(typeOf(actual)).toBe(expected);
        return;
      }
      const record = actual as Record<string, unknown>;
      for (const [key, type] of Object.entries(expected)) {
        expect(record, `${name}.${key} was removed or renamed`).toHaveProperty(key);
        expect(typeOf(record[key]), `${name}.${key} changed type`).toBe(type);
      }
    });
  }
});

describe('the elevated tokens are additive', () => {
  test('themes still carry the same two schemes, and both have the same keys', () => {
    expect(Object.keys(tokens.themes)).toEqual(['light', 'dark']);
    expect(Object.keys(tokens.lightColors).sort()).toEqual(Object.keys(tokens.darkColors).sort());
  });

  test('status, rail and cue tokens exist in light and dark as colours', () => {
    for (const key of ['statusOk', 'statusWarn', 'statusBad', 'statusIdle', 'rail', 'railStrong', 'cue'] as const) {
      expect(tokens.lightColors[key], `light ${key}`).toMatch(/^#[0-9a-f]{6}$/);
      expect(tokens.darkColors[key], `dark ${key}`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  test('the proposal values for ok, warn, bad and rails are the ones used', () => {
    expect(tokens.lightColors).toMatchObject({ statusOk: '#2f7d5b', statusWarn: '#a8741a', statusBad: '#a65d57', rail: '#e9e1d3', railStrong: '#d4c4a9' });
    expect(tokens.darkColors).toMatchObject({ statusOk: '#5cc49a', statusWarn: '#e0ac69', statusBad: '#d47b75', rail: '#22324a', railStrong: '#2f4562' });
  });

  test('a dense control size sits below the existing sizes, which stay put', () => {
    expect(tokens.controlHeights).toEqual({ dense: 28, compact: 32, small: 36, default: 40, large: 48 });
    expect(tokens.controlHeights.dense).toBeLessThan(tokens.controlHeights.small);
  });

  test('the type scale is ordered and the focus ring is one width', () => {
    const sizes = Object.values(tokens.fontSizes);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(tokens.fontSizes.caps).toBe(11);
    expect(tokens.focusRing).toEqual({ width: 2, offset: 2 });
    expect(tokens.capsTracking).toBeGreaterThanOrEqual(0.08);
    expect(tokens.capsTracking).toBeLessThanOrEqual(0.14);
    expect(tokens.monoFamily).toBe('ui-monospace');
  });
});
