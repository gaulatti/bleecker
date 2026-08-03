import type { Meta, StoryObj } from '@storybook/react-vite';

import { NotificationBadge } from '../../src/components/notification-badge';

const meta = {
  component: NotificationBadge,
  title: 'Components/NotificationBadge',
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
} satisfies Meta<typeof NotificationBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 3,
    items: [
      { id: '1', title: 'New order', description: 'Order #1234 received', timestamp: '2m ago', unread: true },
      { id: '2', title: 'Payment failed', description: 'Order #1230', timestamp: '1h ago', unread: true },
      { id: '3', title: 'Weekly report ready', timestamp: '3h ago' }
    ],
    onMarkAllRead: () => {}
  }
};

export const Empty: Story = {
  args: {
    count: 0,
    items: [],
    onMarkAllRead: () => {}
  }
};

export const OverflowCount: Story = {
  args: {
    ...Default.args,
    count: 120
  }
};
