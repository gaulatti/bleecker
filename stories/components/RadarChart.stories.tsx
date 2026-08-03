import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadarChart } from '../../src/components/radar-chart';

const meta = {
  component: RadarChart,
  title: 'Components/Charts/Radar',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof RadarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { skill: 'Speed', current: 85, target: 95 },
  { skill: 'Quality', current: 70, target: 85 },
  { skill: 'Cost', current: 60, target: 75 },
  { skill: 'Safety', current: 90, target: 90 },
  { skill: 'Delivery', current: 75, target: 80 }
];

export const Default: Story = {
  args: {
    data,
    subjectKey: 'skill',
    series: [
      { key: 'current', name: 'Current', fill: true },
      { key: 'target', name: 'Target', fill: true }
    ],
    height: 350
  }
};

export const SingleSeries: Story = {
  args: {
    ...Default.args,
    series: [{ key: 'current', name: 'Current', fill: true }],
    showLegend: false
  }
};

export const OutlineOnly: Story = {
  args: {
    ...Default.args,
    series: [
      { key: 'current', name: 'Current' },
      { key: 'target', name: 'Target' }
    ]
  }
};

export const PercentScale: Story = {
  args: {
    ...Default.args,
    tickFormatter: (value) => `${value}%`
  }
};
