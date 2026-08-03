import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressStack } from '../../src/components/progress-stack';

const meta = {
  component: ProgressStack,
  title: 'Components/ProgressStack',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof ProgressStack>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { label: 'Direct', value: 40, color: 'var(--color-sea)' },
  { label: 'Social', value: 30, color: 'var(--color-desert)' },
  { label: 'Organic', value: 20, color: 'var(--color-terracotta)' },
  { label: 'Referral', value: 10, color: 'var(--color-sunset)' }
];

export const Default: Story = {
  args: {
    items
  }
};

export const SingleSegment: Story = {
  args: {
    items: [{ label: 'Complete', value: 100, color: 'var(--color-sea)' }]
  }
};

export const UnevenValues: Story = {
  args: {
    items: [
      { label: 'Primary', value: 875, color: 'var(--color-sea)' },
      { label: 'Secondary', value: 125, color: 'var(--color-desert)' }
    ]
  }
};
