import type { Meta, StoryObj } from '@storybook/react-vite';

import { Timeline } from '../../src/components/timeline';

const meta = {
  component: Timeline,
  title: 'Components/Timeline',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: '1', title: 'Order placed', description: 'Customer completed checkout.', timestamp: '2 hours ago', status: 'completed' as const },
  { id: '2', title: 'Payment confirmed', description: 'Stripe charge succeeded.', timestamp: '1 hour ago', status: 'completed' as const },
  { id: '3', title: 'Shipped', description: 'Package left the warehouse.', timestamp: '30 mins ago', status: 'active' as const },
  { id: '4', title: 'Delivered', description: 'Pending final scan.', status: 'pending' as const }
];

export const Default: Story = {
  args: { items }
};

export const SingleEvent: Story = {
  args: {
    items: [{ id: '1', title: 'Workspace created', description: 'The first activity in a new workspace.', status: 'completed' }]
  }
};

export const Empty: Story = {
  args: { items: [] }
};
