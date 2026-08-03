import type { Meta, StoryObj } from '@storybook/react-vite';

import { BarChart } from '../../src/components/bar-chart';

const meta = {
  component: BarChart,
  title: 'Components/Charts/Bar',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { product: 'A', sales: 4000, returns: 200 },
  { product: 'B', sales: 3000, returns: 150 },
  { product: 'C', sales: 5000, returns: 300 },
  { product: 'D', sales: 2780, returns: 90 },
  { product: 'E', sales: 1890, returns: 120 }
];

export const Default: Story = {
  args: {
    data,
    xAxisKey: 'product',
    series: [
      { key: 'sales', name: 'Sales' },
      { key: 'returns', name: 'Returns' }
    ],
    height: 350
  }
};

export const Horizontal: Story = {
  args: {
    ...Default.args,
    layout: 'vertical',
    height: 300
  }
};

export const SingleSeries: Story = {
  args: {
    ...Default.args,
    series: [{ key: 'sales', name: 'Sales' }],
    showLegend: false,
    yAxisTickFormatter: (value) => `$${value / 1000}k`
  }
};

export const Minimal: Story = {
  args: {
    ...Default.args,
    showGrid: false,
    showLegend: false
  }
};
