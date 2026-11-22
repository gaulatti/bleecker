import type { ReactNode } from 'react';

import { ThemeProvider } from '../../src/theme/theme-provider';
import type { ThemeMode } from '../../src/theme/types';

/** Renders a story's content in one fixed theme, so a story can show light and dark side by side. */
export function InTheme({ children, theme }: { children: ReactNode; theme: Exclude<ThemeMode, 'system'> }) {
  return (
    <ThemeProvider theme={theme} onThemeChange={() => {}}>
      <div className='space-y-4 bg-background p-6 text-text-primary'>
        <h3 className='text-xs font-semibold uppercase tracking-wider text-text-secondary'>{theme}</h3>
        {children}
      </div>
    </ThemeProvider>
  );
}
