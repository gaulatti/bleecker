import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../../src/components/label';
import { Input } from '../../src/components/input';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' }
  }
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    htmlFor: 'email',
    children: 'Email Address'
  },
  render: (args) => (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Label {...args} />
      <Input type='email' id='email' placeholder='Email' />
    </div>
  )
};

export const WithError: Story = {
  args: {
    htmlFor: 'username',
    children: 'Username'
  },
  render: (args) => (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Label {...args} className='text-terracotta' />
      <Input type='text' id='username' placeholder='Username' error={true} />
      <p className='text-sm text-terracotta'>Username is required.</p>
    </div>
  )
};
