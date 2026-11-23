import type { Meta, StoryObj } from '@storybook/react-vite';

import { RelojLoopClock } from '../../src/components/reloj-loop-clock';

const meta = {
  component: RelojLoopClock,
  title: 'Components/RelojLoopClock',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof RelojLoopClock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <RelojLoopClock timezone='Europe/Madrid' />
};

export const Variant: Story = {
  render: () => <RelojLoopClock timezone='America/New_York' />
};
