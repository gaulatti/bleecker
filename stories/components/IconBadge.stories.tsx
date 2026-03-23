import { Bell, RadioTower } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconBadge } from '../../src/components/icon-badge';

const meta = {
  component: IconBadge,
  title: 'Components/IconBadge',
  args: {
    size: 'lg'
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['md', 'lg']
    }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof IconBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className='flex items-center gap-6'>
      <IconBadge {...args}>
        <Bell className='h-7 w-7' />
      </IconBadge>
      <IconBadge {...args}>
        <RadioTower className='h-7 w-7' />
      </IconBadge>
    </div>
  )
};
