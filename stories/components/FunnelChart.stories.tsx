import type { Meta, StoryObj } from '@storybook/react-vite';

import { FunnelChart } from '../../src/components/funnel-chart';

const meta = {
  component: FunnelChart,
  title: 'Components/Charts/Funnel',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof FunnelChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { name: 'Impressions', value: 5000 },
  { name: 'Clicks', value: 2300 },
  { name: 'Signups', value: 1200 },
  { name: 'Purchases', value: 540 }
];

export const Default: Story = {
  args: {
    data,
    height: 350
  }
};

export const WithoutLabels: Story = {
  args: {
    ...Default.args,
    showLabels: false
  }
};

export const FormattedValues: Story = {
  args: {
    ...Default.args,
    valueFormatter: (value) => value.toLocaleString()
  }
};

export const TwoStage: Story = {
  args: {
    ...Default.args,
    data: data.slice(0, 2),
    height: 240
  }
};
