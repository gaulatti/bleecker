import type { Meta, StoryObj } from '@storybook/react-vite';

import { LiveIndicator } from '../../src/components/live-indicator';

const meta = {
  component: LiveIndicator,
  title: 'Components/LiveIndicator',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof LiveIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <LiveIndicator />
};

export const Variant: Story = {
  render: () => <LiveIndicator animate={false} />
};
