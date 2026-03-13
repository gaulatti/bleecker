import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/button';

const meta = {
  component: Button,
  title: 'Components/Button',
  args: {
    children: 'Continue'
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: 'secondary'
  }
};

export const Ghost: Story = {
  args: {
    variant: 'ghost'
  }
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete'
  }
};
