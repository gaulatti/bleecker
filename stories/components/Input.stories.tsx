import { Search, User } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from '../../src/components/input';

const meta = {
  component: Input,
  title: 'Components/Input',
  args: {
    placeholder: 'Search channels...'
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className='w-80'>
      <Input {...args} />
    </div>
  )
};

export const WithIcons: Story = {
  render: (args) => (
    <div className='w-80'>
      <Input {...args} startIcon={<Search size={16} />} endIcon={<User size={16} />} placeholder='Search or assign...' />
    </div>
  )
};

export const Error: Story = {
  render: (args) => (
    <div className='w-80'>
      <Input {...args} error defaultValue='broken-stream-url' />
    </div>
  )
};
