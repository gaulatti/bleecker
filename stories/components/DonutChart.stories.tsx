import type { Meta, StoryObj } from '@storybook/react-vite';

import { DonutChart } from '../../src/components/donut-chart';

const meta = {
  component: DonutChart,
  title: 'Components/Charts/Donut',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { name: 'Completed', value: 72 },
  { name: 'Remaining', value: 28 }
];

export const Default: Story = {
  args: {
    data,
    height: 300,
    centerLabel: 'Completion',
    centerValue: '72%'
  }
};

export const WithoutCenterLabel: Story = {
  args: {
    data,
    height: 300
  }
};

export const CompactKpi: Story = {
  args: {
    data,
    height: 200,
    showLegend: false,
    centerLabel: 'Complete',
    centerValue: '72%'
  }
};

export const EmptyData: Story = {
  args: {
    data: [],
    height: 300,
    centerLabel: 'No data',
    centerValue: '—'
  }
};
