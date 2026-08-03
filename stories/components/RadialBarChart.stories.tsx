import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadialBarChart } from '../../src/components/radial-bar-chart';

const meta = {
  component: RadialBarChart,
  title: 'Components/Charts/Radial Bar',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof RadialBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { name: 'Desktop', value: 78 },
  { name: 'Mobile', value: 62 },
  { name: 'Tablet', value: 45 },
  { name: 'Other', value: 23 }
];

export const Default: Story = {
  args: {
    data,
    height: 350
  }
};

export const Semicircle: Story = {
  args: {
    ...Default.args,
    startAngle: 180,
    endAngle: 0,
    height: 260
  }
};

export const WithoutLegend: Story = {
  args: {
    ...Default.args,
    showLegend: false
  }
};

export const CustomRadii: Story = {
  args: {
    ...Default.args,
    innerRadius: '30%',
    outerRadius: '95%'
  }
};
