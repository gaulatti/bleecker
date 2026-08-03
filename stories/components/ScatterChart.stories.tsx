import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScatterChart } from '../../src/components/scatter-chart';

const meta = {
  component: ScatterChart,
  title: 'Components/Charts/Scatter',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof ScatterChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = Array.from({ length: 24 }, (_, i) => ({
  x: i * 10,
  y: 12 + ((i * 37) % 89),
  z: 20 + ((i * 83) % 480)
}));

export const Default: Story = {
  args: {
    data,
    series: [{ key: 'a', name: 'Sessions', xKey: 'x', yKey: 'y', zKey: 'z' }],
    height: 350
  }
};

export const FixedPointSize: Story = {
  args: {
    ...Default.args,
    series: [{ key: 'a', name: 'Sessions', xKey: 'x', yKey: 'y' }]
  }
};

export const FormattedAxes: Story = {
  args: {
    ...Default.args,
    xAxisLabel: 'Session duration',
    yAxisLabel: 'Conversion rate',
    xAxisTickFormatter: (value) => `${value}m`,
    yAxisTickFormatter: (value) => `${value}%`,
    tooltipFormatter: (value) => value.toLocaleString()
  }
};

export const IndependentSeries: Story = {
  args: {
    data: [],
    xAxisLabel: 'Components',
    yAxisLabel: 'Duration',
    series: [
      {
        key: 'generation',
        name: 'Generation',
        xKey: 'x',
        yKey: 'y',
        zKey: 'z',
        data: data.slice(0, 12)
      },
      {
        key: 'generation-npm',
        name: 'Generation + NPM',
        xKey: 'x',
        yKey: 'y',
        zKey: 'z',
        data: data.slice(12)
      }
    ],
    height: 350
  }
};

export const Minimal: Story = {
  args: {
    ...Default.args,
    showGrid: false,
    showLegend: false
  }
};
