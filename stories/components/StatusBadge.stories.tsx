import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusBadge, type StatusBadgeProps } from '../../src/components/status-badge';

const meta = {
  component: StatusBadge,
  title: 'Components/StatusBadge',
  args: {
    label: 'LIVE',
    variant: 'live'
  },
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    variant: {
      control: 'select',
      options: ['live', 'offline', 'warning', 'info', 'default']
    }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<StatusBadgeProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Live: Story = {
  args: {
    label: 'LIVE',
    variant: 'live',
    description: 'Real-time updates active'
  }
};

export const Offline: Story = {
  args: {
    label: 'OFFLINE',
    variant: 'offline',
    description: 'Last update: 12:34:56'
  }
};

export const Warning: Story = {
  args: {
    label: 'DEGRADED',
    variant: 'warning',
    description: 'Partial connectivity'
  }
};

export const Info: Story = {
  args: {
    label: 'EVENTS',
    variant: 'info'
  }
};

export const Default: Story = {
  args: {
    label: 'UNKNOWN',
    variant: 'default'
  }
};
