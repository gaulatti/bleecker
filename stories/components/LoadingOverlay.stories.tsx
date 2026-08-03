import type { Meta, StoryObj } from '@storybook/react-vite';

import { LoadingOverlay } from '../../src/components/loading-overlay';

const meta = {
  component: LoadingOverlay,
  title: 'Components/LoadingOverlay',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof LoadingOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    visible: true,
    label: 'Loading dashboard...'
  }
};

export const Hidden: Story = {
  args: {
    visible: false,
    label: 'Loading dashboard...'
  },
  render: (args) => (
    <div className='relative min-h-64 rounded-lg border border-dashed border-border p-8'>
      Underlying content remains interactive when the overlay is hidden.
      <LoadingOverlay {...args} />
    </div>
  )
};
