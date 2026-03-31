import type { Meta, StoryObj } from '@storybook/react-vite';

import { ActivityItem } from '../../src/components/activity-item';

const meta = {
  title: 'Components/ActivityItem',
  component: ActivityItem,
  parameters: {
    layout: 'padded'
  },
  args: {
    title: 'Deploy successful build #44',
    time: '2m ago',
    init: 'DB'
  }
} satisfies Meta<typeof ActivityItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SessionExample: Story = {
  args: {
    title: 'Jordan (Madrid, ES)',
    time: 'IP: 10.0.0.45',
    init: 'J'
  }
};
