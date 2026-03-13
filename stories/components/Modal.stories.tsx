import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Button } from '../../src/components/button';
import { Modal } from '../../src/components/modal';
import { SectionHeader } from '../../src/components/section-header';

const meta = {
  component: Modal,
  title: 'Components/Modal',
  args: {
    title: 'Publish changes'
  },
  argTypes: {
    children: {
      control: false
    },
    isOpen: {
      control: false
    },
    onClose: {
      control: false
    }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className='min-h-[20rem]'>
        <Button onClick={() => setIsOpen(true)}>Open modal</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className='space-y-6'>
            <SectionHeader
              title='Review before publishing'
              description='This modal comes from the shared patterns already used in the product frontends and now lives in Bleecker.'
            />
            <div className='flex gap-3'>
              <Button onClick={() => setIsOpen(false)}>Confirm</Button>
              <Button variant='secondary' onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
};
