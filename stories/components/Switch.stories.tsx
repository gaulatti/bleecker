import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from '../../src/components/switch';

const meta = {
  component: Switch,
  title: 'Components/Switch',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    return <Switch checked={checked} onCheckedChange={setChecked} label='Enable notifications' />;
  }
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);
    return <Switch checked={checked} onCheckedChange={setChecked} label='Dark mode' />;
  }
};

export const Disabled: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      <Switch checked={false} onCheckedChange={() => undefined} label='Off (disabled)' disabled />
      <Switch checked={true} onCheckedChange={() => undefined} label='On (disabled)' disabled />
    </div>
  )
};

export const WithoutLabel: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    return <Switch checked={checked} onCheckedChange={setChecked} aria-label='Toggle feature' />;
  }
};
