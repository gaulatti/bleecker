import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator } from '../../src/components/separator';

const meta = {
  component: Separator,
  title: 'Components/Separator',
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className='w-80 space-y-4'>
      <p className='text-sm text-text-secondary'>Before</p>
      <Separator />
      <p className='text-sm text-text-secondary'>After</p>
    </div>
  )
};

export const Vertical: Story = {
  render: () => (
    <div className='flex h-24 items-center gap-4'>
      <span className='text-sm text-text-secondary'>Left</span>
      <Separator orientation='vertical' className='h-16' />
      <span className='text-sm text-text-secondary'>Right</span>
    </div>
  )
};
