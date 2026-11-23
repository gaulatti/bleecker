import { Bell, Moon, Search, Settings, Sun, Trash2 } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconButton } from '../../src/components/icon-button';
import { InTheme } from './theme-story';

const meta = {
  component: IconButton,
  title: 'Components/IconButton',
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <IconButton aria-label='Settings'>
      <Settings size={18} />
    </IconButton>
  )
};

export const Variants: Story = {
  render: () => (
    <div className='flex items-center gap-3'>
      <IconButton aria-label='Search'>
        <Search size={18} />
      </IconButton>
      <IconButton aria-label='Notifications'>
        <Bell size={18} />
      </IconButton>
      <IconButton aria-label='Settings'>
        <Settings size={18} />
      </IconButton>
      <IconButton aria-label='Light mode'>
        <Sun size={18} />
      </IconButton>
      <IconButton aria-label='Dark mode'>
        <Moon size={18} />
      </IconButton>
    </div>
  )
};

const Tones = () => (
  <div className='flex items-center gap-3'>
    <IconButton aria-label='Settings (neutral)'>
      <Settings size={18} />
    </IconButton>
    <IconButton tone='danger' aria-label='Delete (danger)'>
      <Trash2 size={18} />
    </IconButton>
    <IconButton tone='danger' variant='ghost' aria-label='Delete, ghost (danger)'>
      <Trash2 size={18} />
    </IconButton>
    <IconButton tone='danger' disabled aria-label='Delete, disabled (danger)'>
      <Trash2 size={18} />
    </IconButton>
  </div>
);

/** The danger tone colours a destructive control on hover and focus; without `tone` nothing changes. */
export const DangerTone: Story = { render: () => <Tones /> };
export const DangerToneLight: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Tones /></InTheme> };
export const DangerToneDark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Tones /></InTheme> };
