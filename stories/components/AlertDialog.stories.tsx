import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AlertDialog } from '../../src/components/alert-dialog';
import { Button } from '../../src/components/button';

const meta = {
  component: AlertDialog,
  title: 'Components/AlertDialog',
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof AlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <AlertDialog
          isOpen={open}
          title='Are you sure?'
          description='This will save your changes and notify all team members. This action cannot be undone.'
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  }
};

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant='destructive' onClick={() => setOpen(true)}>
          Delete item
        </Button>
        <AlertDialog
          isOpen={open}
          variant='destructive'
          title='Delete this item?'
          description='This action is permanent and cannot be undone. All associated data will be removed immediately.'
          cancelLabel='Keep it'
          confirmLabel='Yes, delete'
          onCancel={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  }
};
