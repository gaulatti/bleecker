import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton, SkeletonCard, SkeletonTable } from '../../src/components/skeleton';

const meta = {
  component: Skeleton,
  title: 'Components/Skeleton',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    height: 16,
    className: 'w-48'
  }
};

export const Card: Story = {
  render: () => <SkeletonCard />
};

export const Table: Story = {
  render: () => <SkeletonTable />
};
