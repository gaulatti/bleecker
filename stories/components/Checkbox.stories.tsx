import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from '../../src/components/checkbox';

const meta = {
  component: Checkbox,
  title: 'Components/Checkbox',
  args: {
    label: 'Enable notifications',
    description: 'Send alerts when a device starts playback.'
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = React.useState(true);
    return <Checkbox {...args} checked={checked} onChange={(event) => setChecked(event.target.checked)} />;
  }
};

export const Bare: Story = {
  render: () => <Checkbox aria-label='Select row' defaultChecked />
};
