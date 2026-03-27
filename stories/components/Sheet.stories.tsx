import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Sheet } from '../../src/components/sheet';
import { Button } from '../../src/components/button';
import { SectionHeader } from '../../src/components/section-header';

const meta = {
  component: Sheet,
  title: 'Components/Sheet',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open right sheet</Button>
        <Sheet isOpen={open} onClose={() => setOpen(false)} side='right' title='Publish changes'>
          <div className='space-y-6'>
            <SectionHeader
              title='Review before publishing'
              description='This sheet now uses the same shared action patterns as the modal so the button styling is directly comparable.'
            />
            <div className='flex flex-wrap gap-3'>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
              <Button variant='secondary' onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Sheet>
      </>
    );
  }
};

export const Left: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open left sheet</Button>
        <Sheet isOpen={open} onClose={() => setOpen(false)} side='left' title='Navigation'>
          <nav className='space-y-1'>
            {['Dashboard', 'Projects', 'Reports', 'Settings'].map((item) => (
              <Button key={item} variant='ghost' className='w-full justify-start rounded-lg px-3 py-2'>
                {item}
              </Button>
            ))}
          </nav>
        </Sheet>
      </>
    );
  }
};

export const Bottom: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open bottom sheet</Button>
        <Sheet isOpen={open} onClose={() => setOpen(false)} side='bottom' title='Options'>
          <div className='space-y-2'>
            {['Edit', 'Duplicate', 'Share', 'Archive'].map((item) => (
              <Button key={item} variant='ghost' className='w-full justify-start rounded-lg px-3 py-2'>
                {item}
              </Button>
            ))}
          </div>
        </Sheet>
      </>
    );
  }
};
