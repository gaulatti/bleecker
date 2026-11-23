import type { Meta, StoryObj } from '@storybook/react-vite';

import { BroadcastHeader } from '../../src/components/broadcast-header';

const meta = {
  component: BroadcastHeader,
  title: 'Components/BroadcastHeader',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof BroadcastHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { title: 'NEWS', date: '01/02/2027' } };
export const DateOnly: Story = { args: { date: '01/02/2027' } };
