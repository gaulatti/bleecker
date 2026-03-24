import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Popover } from '../../src/components/popover';
import { Button } from '../../src/components/button';
import { Switch } from '../../src/components/switch';

const meta = {
  component: Popover,
  title: 'Components/Popover',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover
      content={
        <div className='p-3'>
          <p className='text-sm font-medium text-text-primary dark:text-text-primary'>Popover content</p>
          <p className='mt-1 text-xs text-text-secondary dark:text-text-secondary'>This is a simple popover with some descriptive text inside.</p>
        </div>
      }
    >
      <Button variant='secondary' size='sm'>
        Open popover
      </Button>
    </Popover>
  )
};

export const WithSettings: Story = {
  render: () => {
    const [notifications, setNotifications] = React.useState(true);
    const [emails, setEmails] = React.useState(false);
    return (
      <Popover
        content={
          <div className='w-60 p-4 space-y-3'>
            <p className='text-sm font-semibold text-text-primary dark:text-text-primary'>Notification settings</p>
            <Switch checked={notifications} onCheckedChange={setNotifications} label='Push notifications' />
            <Switch checked={emails} onCheckedChange={setEmails} label='Email digest' />
          </div>
        }
      >
        <Button size='sm'>Settings</Button>
      </Popover>
    );
  }
};

export const AllSides: Story = {
  render: () => (
    <div className='grid grid-cols-3 items-center gap-8 p-16'>
      <span />
      <Popover side='top' content={<div className='p-2 text-sm'>Top</div>}>
        <Button size='sm' variant='secondary'>
          Top
        </Button>
      </Popover>
      <span />
      <Popover side='left' content={<div className='p-2 text-sm'>Left</div>}>
        <Button size='sm' variant='secondary'>
          Left
        </Button>
      </Popover>
      <span />
      <Popover side='right' content={<div className='p-2 text-sm'>Right</div>}>
        <Button size='sm' variant='secondary'>
          Right
        </Button>
      </Popover>
      <span />
      <Popover side='bottom' content={<div className='p-2 text-sm'>Bottom</div>}>
        <Button size='sm' variant='secondary'>
          Bottom
        </Button>
      </Popover>
      <span />
    </div>
  )
};
