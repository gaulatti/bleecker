import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Drawer } from '../../src/components/drawer';
import { Button } from '../../src/components/button';

const meta = {
  component: Drawer,
  title: 'Components/Drawer',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer isOpen={open} onClose={() => setOpen(false)} title='Quick actions' description='Choose an action to perform.'>
          <div className='space-y-2'>
            {['Edit profile', 'Change password', 'Export data', 'Delete account'].map((item) => (
              <button
                key={item}
                type='button'
                className='flex w-full rounded-xl px-4 py-3 text-sm text-text-primary hover:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/15'
              >
                {item}
              </button>
            ))}
          </div>
        </Drawer>
      </>
    );
  }
};

export const WithContent: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Filter results</Button>
        <Drawer isOpen={open} onClose={() => setOpen(false)} title='Filters'>
          <div className='space-y-6'>
            <div>
              <p className='mb-2 text-sm font-medium text-text-primary dark:text-text-primary'>Category</p>
              <div className='flex flex-wrap gap-2'>
                {['Music', 'News', 'Sports', 'Technology', 'Science'].map((cat) => (
                  <button
                    key={cat}
                    type='button'
                    className='rounded-full border border-sand/20 px-3 py-1 text-xs text-text-secondary hover:border-sea hover:text-sea dark:border-sand/40 dark:hover:border-accent-blue dark:hover:text-accent-blue'
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <Button className='w-full'>Apply filters</Button>
          </div>
        </Drawer>
      </>
    );
  }
};
