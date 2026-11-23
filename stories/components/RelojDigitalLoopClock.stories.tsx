import type { Meta, StoryObj } from '@storybook/react-vite';

import { RelojDigitalLoopClock } from '../../src/components/reloj-digital-loop-clock';

const meta = {
  component: RelojDigitalLoopClock,
  title: 'Components/RelojDigitalLoopClock',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof RelojDigitalLoopClock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <RelojDigitalLoopClock timezone='Europe/Rome' titleText='Titular de ejemplo' ctaText='Sintonizá' />
};

export const Variant: Story = {
  render: () => <RelojDigitalLoopClock mode='countdown' countdownDuration={300} />
};
