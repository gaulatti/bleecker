import type { Meta, StoryObj } from '@storybook/react-vite';

import { Progress } from '../../src/components/progress';

const meta = {
  component: Progress,
  title: 'Components/Progress',
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 65 }
};

export const WithLabel: Story = {
  args: { value: 72, showLabel: true }
};

export const Sizes: Story = {
  render: () => (
    <div className='w-80 space-y-4'>
      <Progress value={40} size='sm' showLabel />
      <Progress value={60} size='md' showLabel />
      <Progress value={80} size='lg' showLabel />
    </div>
  )
};

export const Variants: Story = {
  render: () => (
    <div className='w-80 space-y-4'>
      <Progress value={75} variant='default' showLabel />
      <Progress value={55} variant='success' showLabel />
      <Progress value={40} variant='warning' showLabel />
      <Progress value={20} variant='destructive' showLabel />
    </div>
  )
};
