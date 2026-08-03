import type { Meta, StoryObj } from '@storybook/react-vite';

import { Sparkline } from '../../src/components/sparkline';

const meta = {
  component: Sparkline,
  title: 'Components/Charts/Sparkline',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { i: 1, v: 10 },
  { i: 2, v: 25 },
  { i: 3, v: 18 },
  { i: 4, v: 40 },
  { i: 5, v: 33 },
  { i: 6, v: 55 },
  { i: 7, v: 48 }
];

export const Default: Story = {
  args: {
    data,
    dataKey: 'v',
    height: 60,
    showArea: true
  }
};

export const LineOnly: Story = {
  args: {
    data,
    dataKey: 'v',
    height: 60
  }
};

export const CustomColor: Story = {
  args: {
    ...Default.args,
    color: 'var(--color-desert)'
  }
};

export const InMetricCard: Story = {
  args: {
    ...Default.args,
    className: 'max-w-64 rounded-lg bg-card p-3'
  }
};
