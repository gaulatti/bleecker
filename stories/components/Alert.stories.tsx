import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Alert } from '../../src/components/alert';
import { Button } from '../../src/components/button';

const meta = {
  component: Alert,
  title: 'Components/Alert',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true);
    return visible ? (
      <Alert type='info' message='Your session will expire in 5 minutes.' onClose={() => setVisible(false)} duration={0} />
    ) : (
      <Button variant='ghost' size='sm' className='px-0 hover:translate-y-0 hover:bg-transparent hover:underline' onClick={() => setVisible(true)}>
        Show alert
      </Button>
    );
  }
};

export const Success: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true);
    return visible ? (
      <Alert type='success' message='Changes saved successfully.' onClose={() => setVisible(false)} duration={0} />
    ) : (
      <Button variant='ghost' size='sm' className='px-0 hover:translate-y-0 hover:bg-transparent hover:underline' onClick={() => setVisible(true)}>
        Show alert
      </Button>
    );
  }
};

export const Warning: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true);
    return visible ? (
      <Alert type='warning' message='This action may affect other users in your organization.' onClose={() => setVisible(false)} duration={0} />
    ) : (
      <Button variant='ghost' size='sm' className='px-0 hover:translate-y-0 hover:bg-transparent hover:underline' onClick={() => setVisible(true)}>
        Show alert
      </Button>
    );
  }
};

export const Error: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(true);
    return visible ? (
      <Alert type='error' message='Failed to save changes. Please try again.' onClose={() => setVisible(false)} duration={0} />
    ) : (
      <Button variant='ghost' size='sm' className='px-0 hover:translate-y-0 hover:bg-transparent hover:underline' onClick={() => setVisible(true)}>
        Show alert
      </Button>
    );
  }
};

export const AllVariants: Story = {
  render: () => {
    const types = ['info', 'success', 'warning', 'error'] as const;
    const messages = {
      info: 'Your session will expire in 5 minutes.',
      success: 'Changes saved successfully.',
      warning: 'This action may affect other users in your organization.',
      error: 'Failed to save changes. Please try again.'
    };
    return (
      <div className='space-y-3'>
        {types.map((type) => (
          <Alert key={type} type={type} message={messages[type]} onClose={() => undefined} duration={0} />
        ))}
      </div>
    );
  }
};
