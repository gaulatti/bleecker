import { Bell, Moon, Search, Settings, Sun } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconButton } from '../../src/components/icon-button';

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
