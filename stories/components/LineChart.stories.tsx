import type { Meta, StoryObj } from '@storybook/react-vite';

import { LineChart } from '../../src/components/line-chart';

const meta = {
  component: LineChart,
  title: 'Components/Charts/Line',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { month: 'Jan', revenue: 12000, profit: 4000 },
  { month: 'Feb', revenue: 19000, profit: 7000 },
  { month: 'Mar', revenue: 16000, profit: 5200 },
  { month: 'Apr', revenue: 24000, profit: 9800 },
  { month: 'May', revenue: 21000, profit: 8300 },
  { month: 'Jun', revenue: 28000, profit: 11500 }
];

export const Default: Story = {
  args: {
    data,
    xAxisKey: 'month',
    series: [
      { key: 'revenue', name: 'Revenue' },
      { key: 'profit', name: 'Profit' }
    ],
    height: 350,
    yAxisTickFormatter: (v) => `$${v / 1000}k`
  }
};

export const SingleSeries: Story = {
  args: {
    ...Default.args,
    series: [{ key: 'revenue', name: 'Revenue' }],
    showLegend: false
  }
};

export const Minimal: Story = {
  args: {
    ...Default.args,
    height: 220,
    showGrid: false,
    showLegend: false
  }
};

export const EmptyData: Story = {
  args: {
    ...Default.args,
    data: []
  }
};
