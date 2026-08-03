import type { Meta, StoryObj } from '@storybook/react-vite';

import { ThemeToggle } from '../../src/components/theme-toggle';

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
