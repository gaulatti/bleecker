import React from 'react';
import { Plus } from 'lucide-react';

import { Button } from '../../src/components/button';
import { DialogCloseButton } from '../../src/components/dialog-close-button';
import { IconButton } from '../../src/components/icon-button';
import { ThemeProvider } from '../../src/theme/theme-provider';
import type { ThemeMode } from '../../src/theme/types';

export function ControlFocusContrastFixture({ theme }: { theme: Exclude<ThemeMode, 'system'> }) {
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
      <div className='space-y-5 p-6 text-text-primary'>
        <h2>Control keyboard focus · {theme}</h2>
        <p>Use Tab to compare the shared controls with the existing dialog close indicator.</p>
        <button type='button' data-focus-start>Begin focus sequence</button>
        {surfaces.map(surface => (
          <section
            key={surface.label}
            data-focus-surface={surface.label}
            className='space-y-4 rounded-[var(--radius-card)] border border-border p-6'
            style={{ backgroundColor: `var(${surface.token})` }}
          >
            <h3>{surface.label}</h3>
            <div className='flex flex-wrap items-center gap-6'>
              <Button variant='link' onClick={() => activate(`${surface.label} button`)}>{surface.label} button</Button>
              <Button as='a' href='#control-focus-target' variant='link' onClick={() => activate(`${surface.label} anchor`)}>{surface.label} anchor</Button>
              <IconButton variant='ghost' aria-label={`${surface.label} icon`} onClick={() => activate(`${surface.label} icon`)}><Plus size={18} aria-hidden='true' /></IconButton>
              <DialogCloseButton aria-label={`${surface.label} close`} onClick={() => activate(`${surface.label} close`)} />
              {surface.label === 'Card' && (
                <Button variant='link' className='focus-visible:ring-text-primary dark:focus-visible:ring-text-primary'>Explicit focus override</Button>
              )}
            </div>
          </section>
        ))}
        <p role='status'>{activation.count ? `${activation.label} activated (${activation.count})` : activation.label}</p>
        <p id='control-focus-target' tabIndex={-1}>In-page anchor destination</p>
      </div>
    </ThemeProvider>
  );
}
