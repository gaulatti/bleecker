import type { ReactNode } from 'react';

import type { ThemeMode } from '../core';

export type { ThemeMode } from '../core';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export interface ControlledThemeProviderProps {
  children: ReactNode;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  defaultTheme?: never;
  storageKey?: never;
}

export type ThemeProviderOptions =
  | (ThemeProviderProps & { theme?: never; onThemeChange?: never })
  | ControlledThemeProviderProps;
