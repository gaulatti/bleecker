import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { ThemeToggle } from '../../src/components/theme-toggle';
import { ThemeProvider, useTheme } from '../../src/theme/theme-provider';
import type { ThemeMode } from '../../src/theme/types';
import { Button } from '../../src/components/button';

const meta = {
  component: ThemeToggle,
  title: 'Components/ThemeToggle',
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InToolbar: Story = {
  render: () => (
    <div className='flex w-80 items-center justify-between rounded-lg border border-border bg-card p-3'>
      <span className='text-sm text-text-secondary'>Appearance</span>
      <ThemeToggle />
    </div>
  )
};

function ControlledReading() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <div className='space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground'>
      <p role='status'>Provider mode: {theme}; resolved: {resolvedTheme}</p>
      <ThemeToggle />
    </div>
  );
}

// Inert fixture for native input. The parent can deliberately reject requests.
export const Controlled: Story = {
  parameters: { themeProvider: 'story' },
  render: () => {
    const [theme, setTheme] = React.useState<ThemeMode>('light');
    const [accept, setAccept] = React.useState(true);
    const [requests, setRequests] = React.useState<ThemeMode[]>([]);
    return (
      <ThemeProvider theme={theme} onThemeChange={(next) => {
        setRequests((previous) => [...previous, next]);
        if (accept) setTheme(next);
      }}>
        <div className='w-80 space-y-4'>
          <ControlledReading />
          <p>Parent theme: {theme}</p>
          <p>Requests: {requests.join(' → ') || 'None'}</p>
          <Button variant='secondary' onClick={() => setAccept(!accept)}>
            {accept ? 'Reject theme requests' : 'Accept theme requests'}
          </Button>
          <Button variant='secondary' onClick={() => setTheme('dark')}>Parent sets dark</Button>
        </div>
      </ThemeProvider>
    );
  }
};
