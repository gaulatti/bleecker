import type { Meta, StoryObj } from '@storybook/react-vite';

import { PieChart } from '../../src/components/pie-chart';

const meta = {
  component: PieChart,
  title: 'Components/Charts/Pie',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { name: 'Direct', value: 400 },
  { name: 'Social', value: 300 },
  { name: 'Email', value: 300 },
  { name: 'Organic', value: 200 }
];

export const Default: Story = {
  args: {
    data,
    height: 350
  }
};

export const WithoutLegend: Story = {
  args: {
    ...Default.args,
    showLegend: false
  }
};

export const CustomColors: Story = {
  args: {
    ...Default.args,
    data: data.map((item, index) => ({
      ...item,
      color: ['var(--color-sea)', 'var(--color-desert)', 'var(--color-clay)', 'var(--color-sage)'][index]
    }))
  }
};

export const EmptyData: Story = {
  args: {
    ...Default.args,
    data: []
  }
};
