import type { Meta, StoryObj } from '@storybook/react-vite';

import { ClockWidget } from '../../src/components/clock-widget';

const meta = {
  component: ClockWidget,
  title: 'Components/ClockWidget',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof ClockWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ClockWidget timezone='America/New_York' locale='en-US' />
};

export const Variant: Story = {
  render: () => <ClockWidget showIcon={false} formatTime={() => '12:00'} />
};
