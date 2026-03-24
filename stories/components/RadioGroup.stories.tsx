import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadioGroup } from '../../src/components/radio-group';

const meta = {
  component: RadioGroup,
  title: 'Components/RadioGroup',
  parameters: { layout: 'padded' }
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const planOptions = [
  { value: 'free', label: 'Free', description: 'Up to 3 projects, 1 GB storage.' },
  { value: 'pro', label: 'Pro', description: 'Unlimited projects, 100 GB storage.' },
  { value: 'enterprise', label: 'Enterprise', description: 'Custom limits, SLA, priority support.' }
];

export const Vertical: Story = {
  render: () => {
    const [value, setValue] = React.useState('pro');
    return <RadioGroup options={planOptions} value={value} onChange={setValue} />;
  }
};

export const Horizontal: Story = {
  render: () => {
    const [value, setValue] = React.useState('monthly');
    return (
      <RadioGroup
        orientation='horizontal'
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' }
        ]}
        value={value}
        onChange={setValue}
      />
    );
  }
};

export const WithDisabled: Story = {
  render: () => {
    const [value, setValue] = React.useState('free');
    return (
      <RadioGroup
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro (disabled)', disabled: true },
          { value: 'enterprise', label: 'Enterprise' }
        ]}
        value={value}
        onChange={setValue}
      />
    );
  }
};
