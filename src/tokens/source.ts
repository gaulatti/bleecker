/**
 * Platform-neutral Bleecker design tokens.
 *
 * This module is the canonical source for both Bleecker's generated CSS and
 * Thompson's React Native theme. Keep browser-only representations out of it.
 */

export const fontFamilies = {
  primary: 'Encode Sans',
  secondary: 'Libre Franklin'
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
} as const;

export const spacing = {
  detail: 4,
  inline: 8,
  control: 12,
  component: 16,
  group: 24,
  container: 32,
  section: 48,
  page: 64
} as const;

export const radii = {
  button: 7,
  card: 12,
  ui: 7,
  dialog: 14,
  pill: 9999
} as const;

export const durations = {
  fast: 150,
  standard: 200,
  deliberate: 300,
  enter: 220,
  exit: 320,
  control: 190,
  surface: 220,
  overlay: 240,
  motionExit: 150
} as const;

export const letterSpacing = {
  refined: -0.02,
  ui: 0,
  elegant: 0.05
} as const;

export const easing = {
  spring: [0.16, 1, 0.3, 1],
  bouncy: [0.34, 1.56, 0.64, 1],
  outExpo: [0.16, 1, 0.3, 1],
  premium: [0.22, 1, 0.36, 1]
} as const;

export const shadows = {
  surface: '0 1px 2px rgb(26 55 77 / 0.025), 0 10px 30px -18px rgb(26 55 77 / 0.18)',
  raised: '0 2px 5px rgb(26 55 77 / 0.045), 0 18px 42px -22px rgb(26 55 77 / 0.24)',
  overlay: '0 24px 64px -20px rgb(26 55 77 / 0.28), 0 4px 14px rgb(26 55 77 / 0.06)'
} as const;

// Elevated surfaces (bleecker#549 phase 1, bleecker#550). Everything below is
// additive: no existing export, key or type changes, and existing screens keep
// their size and look until a component opts in.

/** Control heights in px. `dense` and `compact` sit beside the existing 36/40/48. */
export const controlHeights = {
  dense: 28,
  compact: 32,
  small: 36,
  default: 40,
  large: 48
} as const;

/** One focus ring for every control, in px. */
export const focusRing = {
  width: 2,
  offset: 2
} as const;

/** Type scale in px for dense, hairline-first surfaces. */
export const fontSizes = {
  caps: 11,
  caption: 12,
  dense: 13,
  body: 14,
  section: 20,
  readout: 24
} as const;

/** Tracking in em for the 11px caps label (the proposals use .08 to .14em). */
export const capsTracking = 0.1;

/** Monospace face for tabular readouts (levels, durations, counts). */
export const monoFamily = 'ui-monospace';

const sharedColors = {
  dusk: '#694f5d',
  deepSea: '#1a374d',
  accentOxblood: '#76323f',
  accentBronze: '#cd7f32',
  accentRed: '#d94f4f',
  accentYellow: '#d4af37',
  persgray50: '#f9fafb'
} as const;

export const lightColors = {
  ...sharedColors,
  sand: '#e6d5b8',
  desert: '#c1814d',
  terracotta: '#a65d57',
  sea: '#2c5784',
  lightSand: '#f9f6f2',
  darkSand: '#d4c4a9',
  sunset: '#ff9677',
  accentGold: '#c6a760',
  accentText: '#8a5735',
  accentBlue: '#2c5784',
  textPrimary: '#2d2d2d',
  textSecondary: '#595959',
  background: '#ffffff',
  foreground: '#2d2d2d',
  card: '#ffffff',
  cardForeground: '#2d2d2d',
  popover: '#ffffff',
  popoverForeground: '#2d2d2d',
  muted: '#f9f6f2',
  mutedForeground: '#595959',
  border: 'rgba(0, 0, 0, 0.08)',
  input: 'rgba(0, 0, 0, 0.08)',
  ring: '#2c5784',
  primary: '#2c5784',
  primaryForeground: '#ffffff',
  secondary: '#f9f6f2',
  secondaryForeground: '#2d2d2d',
  destructive: '#a65d57',
  destructiveForeground: '#ffffff',
  accent: '#f9f6f2',
  accentForeground: '#2d2d2d',
  statusOk: '#2f7d5b',
  statusWarn: '#a8741a',
  statusBad: '#a65d57',
  statusIdle: '#767676',
  rail: '#e9e1d3',
  railStrong: '#d4c4a9',
  cue: '#8a5735'
} as const;

export const darkColors = {
  ...sharedColors,
  sand: '#1a2332',
  desert: '#e0ac69',
  terracotta: '#d47b75',
  sea: '#5ba3f5',
  deepSea: '#182533',
  lightSand: '#0d1821',
  darkSand: '#243447',
  sunset: '#ff9677',
  accentGold: '#d4af37',
  accentText: '#e0ac69',
  accentBlue: '#5ba3f5',
  textPrimary: '#f0f4f8',
  textSecondary: '#b8c5d6',
  background: '#0d1821',
  foreground: '#f0f4f8',
  card: '#182533',
  cardForeground: '#f0f4f8',
  popover: '#182533',
  popoverForeground: '#f0f4f8',
  muted: '#1a2332',
  mutedForeground: '#b8c5d6',
  border: 'rgba(255, 255, 255, 0.08)',
  input: 'rgba(255, 255, 255, 0.08)',
  ring: '#5ba3f5',
  primary: '#5ba3f5',
  primaryForeground: '#0d1821',
  secondary: '#1a2332',
  secondaryForeground: '#f0f4f8',
  destructive: '#d47b75',
  destructiveForeground: '#0d1821',
  accent: '#1a2332',
  accentForeground: '#f0f4f8',
  statusOk: '#5cc49a',
  statusWarn: '#e0ac69',
  statusBad: '#d47b75',
  statusIdle: '#8a9bb0',
  rail: '#22324a',
  railStrong: '#2f4562',
  cue: '#e0ac69'
} as const;

export const themes = {
  light: lightColors,
  dark: darkColors
} as const;

export type BleeckerColorScheme = keyof typeof themes;
export type BleeckerTheme = (typeof themes)[BleeckerColorScheme];
export type BleeckerColorToken = keyof BleeckerTheme;
