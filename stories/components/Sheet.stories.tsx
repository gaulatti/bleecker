import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Sheet } from '../../src/components/sheet';
import { Button } from '../../src/components/button';

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
        <Sheet isOpen={open} onClose={() => setOpen(false)} side='right' title='Account settings' description='Manage your profile and preferences.'>
          <div className='space-y-4'>
            <p className='text-sm text-text-secondary dark:text-text-secondary'>Sheet content goes here. You can put forms, lists, or any other content.</p>
            <Button variant='secondary' onClick={() => setOpen(false)}>
              Close
            </Button>
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
              <button
                key={item}
                type='button'
                className='flex w-full rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/15'
              >
                {item}
              </button>
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
              <button
                key={item}
                type='button'
                className='flex w-full rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/15'
              >
                {item}
              </button>
            ))}
          </div>
        </Sheet>
      </>
    );
  }
};
