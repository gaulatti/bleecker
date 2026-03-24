import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { OtpInput } from '../../src/components/otp-input';

const meta = {
  component: OtpInput,
  title: 'Components/OtpInput',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div className='flex flex-col items-center gap-4'>
        <OtpInput value={value} onChange={setValue} />
        <p className='text-sm text-text-secondary dark:text-text-secondary'>
          Value: <span className='font-mono font-semibold text-text-primary'>{value || '—'}</span>
        </p>
      </div>
    );
  }
};

export const FourDigit: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return <OtpInput length={4} value={value} onChange={setValue} />;
  }
};

export const Secure: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return <OtpInput secure value={value} onChange={setValue} />;
  }
};

export const Prefillled: Story = {
  render: () => <OtpInput value='482' onChange={() => undefined} />
};
