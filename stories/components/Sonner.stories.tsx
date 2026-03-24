import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Sonner, toast } from '../../src/components/sonner';
import { Button } from '../../src/components/button';

const meta = {
  component: Sonner,
  title: 'Components/Sonner',
  parameters: { layout: 'padded' },
  decorators: [
    (Story: React.ComponentType) => (
      <>
        <Story />
        <Sonner position='bottom-right' duration={4000} />
      </>
    )
  ]
} satisfies Meta<typeof Sonner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div className='flex flex-wrap gap-3'>
      <Button onClick={() => toast.show({ title: 'Default notification', description: 'Something happened.' })}>Default</Button>
      <Button variant='secondary' onClick={() => toast.success('Saved successfully', { description: 'Your changes have been saved.' })}>
        Success
      </Button>
      <Button variant='secondary' onClick={() => toast.error('An error occurred', { description: 'Please try again later.' })}>
        Error
      </Button>
      <Button variant='secondary' onClick={() => toast.warning('Heads up', { description: 'This action may have side effects.' })}>
        Warning
      </Button>
      <Button variant='secondary' onClick={() => toast.info('Did you know?', { description: 'You can undo this action within 5 seconds.' })}>
        Info
      </Button>
    </div>
  )
};

export const WithAction: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.show({
          title: 'Message deleted',
          description: 'The message has been moved to trash.',
          action: { label: 'Undo', onClick: () => toast.info('Restored') }
        })
      }
    >
      Delete with undo
    </Button>
  )
};

export const Persistent: Story = {
  render: () => (
    <Button
      onClick={() =>
        toast.show({
          title: 'Processing upload...',
          description: 'Please wait while your file is uploaded.',
          duration: 0,
          variant: 'info'
        })
      }
    >
      Show persistent toast
    </Button>
  )
};
