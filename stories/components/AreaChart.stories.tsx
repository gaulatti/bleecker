import type { Meta, StoryObj } from '@storybook/react-vite';

import { AreaChart } from '../../src/components/area-chart';

const meta = {
  component: AreaChart,
  title: 'Components/Charts/Area',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof AreaChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { day: 'Mon', mobile: 2400, desktop: 1398 },
  { day: 'Tue', mobile: 1398, desktop: 2210 },
  { day: 'Wed', mobile: 9800, desktop: 3908 },
  { day: 'Thu', mobile: 3908, desktop: 4800 },
  { day: 'Fri', mobile: 4800, desktop: 3800 },
  { day: 'Sat', mobile: 3800, desktop: 4300 },
  { day: 'Sun', mobile: 4300, desktop: 2100 }
];

export const Stacked: Story = {
  args: {
    data,
    xAxisKey: 'day',
    series: [
      { key: 'mobile', name: 'Mobile' },
      { key: 'desktop', name: 'Desktop' }
    ],
    height: 350,
    stacked: true
  }
};

export const Overlapping: Story = {
  args: {
    ...Stacked.args,
    stacked: false
  }
};

export const SingleSeries: Story = {
  args: {
    ...Stacked.args,
    series: [{ key: 'mobile', name: 'Mobile' }],
    stacked: false,
    showLegend: false
  }
};

export const Minimal: Story = {
  args: {
    ...Stacked.args,
    showGrid: false,
    showLegend: false,
    height: 220
  }
};
