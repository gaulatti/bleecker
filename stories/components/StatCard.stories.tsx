import type { Meta, StoryObj } from '@storybook/react-vite';
import { DollarSign, Users } from 'lucide-react';

import { StatCard } from '../../src/components/stat-card';

const meta = {
  component: StatCard,
  title: 'Components/StatCard',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sparkData = [
  { i: 1, v: 10 },
  { i: 2, v: 25 },
  { i: 3, v: 18 },
  { i: 4, v: 40 },
  { i: 5, v: 33 },
  { i: 6, v: 55 }
];

export const Default: Story = {
  args: {
    title: 'Total Revenue',
    value: '$45,231.89',
    description: 'Monthly recurring revenue',
    icon: <DollarSign size={20} />,
    trend: { value: '+20.1%', direction: 'up', label: 'from last month' }
  }
};

export const WithSparkline: Story = {
  args: {
    title: 'Active Users',
    value: '2,345',
    icon: <Users size={20} />,
    trend: { value: '+12.5%', direction: 'up', label: 'from last week' },
    sparklineData: sparkData,
    sparklineDataKey: 'v'
  }
};
