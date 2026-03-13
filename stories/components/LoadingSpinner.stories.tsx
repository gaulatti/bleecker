import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from '../../src/components/card';
import { LoadingSpinner } from '../../src/components/loading-spinner';

const meta = {
  component: LoadingSpinner,
  title: 'Components/LoadingSpinner',
  args: {
    size: 'md'
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg']
    }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof LoadingSpinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnCard: Story = {
  render: (args) => (
    <Card className='flex min-w-72 flex-col items-center gap-4 p-10 text-center'>
      <LoadingSpinner {...args} />
      <div>
        <h3 className='text-xl'>Syncing changes</h3>
        <p className='text-sm text-text-secondary dark:text-text-secondary'>Reusable loading state imported from the product frontends.</p>
      </div>
    </Card>
  )
};
