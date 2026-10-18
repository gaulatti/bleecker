import React from 'react';

import { Button } from '../../src/components/button';
import { ThemeProvider } from '../../src/theme/theme-provider';
import type { ThemeMode } from '../../src/theme/types';

export function ButtonLinkContrastFixture({ theme }: { theme: Exclude<ThemeMode, 'system'> }) {
  const [activation, setActivation] = React.useState({ label: 'No activation yet', count: 0 });
  const surfaces = [
    { label: 'Canvas', token: '--color-background' },
    { label: 'Card', token: '--color-card' },
    { label: 'Muted', token: '--color-muted' },
    ...(theme === 'dark' ? [{ label: 'Dark sand', token: '--color-dark-sand' }] : [])
  ];
  const activate = (label: string) => setActivation(previous => ({ label, count: previous.count + 1 }));

  return (
    <ThemeProvider theme={theme} onThemeChange={() => {}}>
      <div className='space-y-4 p-6 text-text-primary'>
        <h2>Link button contrast · {theme}</h2>
        {surfaces.map(surface => (
          <section
            key={surface.label}
            data-link-surface={surface.label}
            className='space-y-3 rounded-[var(--radius-card)] border border-border p-4'
            style={{ backgroundColor: `var(${surface.token})` }}
          >
            <h3>{surface.label}</h3>
            <div className='flex flex-wrap items-center gap-6'>
              <Button variant='link' onClick={() => activate(`${surface.label} button`)}>{surface.label} button</Button>
              <Button as='a' href='#button-link-contrast-target' variant='link' onClick={() => activate(`${surface.label} anchor`)}>{surface.label} anchor</Button>
              {surface.label === 'Card' && (
                <Button variant='link' className='dark:hover:text-text-primary'>Explicit dark hover override</Button>
              )}
            </div>
          </section>
        ))}
        <p role='status'>{activation.count ? `${activation.label} activated (${activation.count})` : activation.label}</p>
        <p id='button-link-contrast-target' tabIndex={-1}>In-page anchor destination</p>
      </div>
    </ThemeProvider>
  );
}
