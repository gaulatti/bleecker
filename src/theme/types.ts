import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}
