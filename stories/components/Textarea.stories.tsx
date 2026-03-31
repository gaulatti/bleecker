import type { Meta, StoryObj } from '@storybook/react-vite';

import { Textarea } from '../../src/components/textarea';

const meta = {
  component: Textarea,
  title: 'Components/Textarea',
  args: {
    placeholder: 'Write a helpful note…'
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className='w-96'>
      <Textarea {...args} />
    </div>
  )
};

export const Error: Story = {
  render: (args) => (
    <div className='w-96'>
      <Textarea {...args} error defaultValue='This field needs a little more love.' />
    </div>
  )
};
