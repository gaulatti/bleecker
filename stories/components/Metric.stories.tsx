import type { Meta, StoryObj } from '@storybook/react-vite';

import { Metric } from '../../src/components/metric';

const meta = {
  component: Metric,
  title: 'Components/Metric',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Metric>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Currency: Story = {
  args: {
    value: 45231.89,
    format: 'currency'
  }
};

export const Compact: Story = {
  args: {
    value: 1234567,
    format: 'compact'
  }
};

export const Percent: Story = {
  args: {
    value: 0.254,
    format: 'percent'
  }
};
