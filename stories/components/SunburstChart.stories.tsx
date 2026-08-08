import type { Meta, StoryObj } from '@storybook/react-vite';

import { SunburstChart } from '../../src/components/sunburst-chart';

const meta = {
  component: SunburstChart,
  title: 'Components/Charts/Sunburst',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof SunburstChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = {
  name: 'Revenue',
  children: [
    {
      name: 'Product A',
      children: [
        { name: 'Basic', value: 120 },
        { name: 'Pro', value: 240 }
      ]
    },
    {
      name: 'Product B',
      children: [
        { name: 'Basic', value: 90 },
        { name: 'Pro', value: 180 }
      ]
    },
    {
      name: 'Services',
      children: [
        { name: 'Consulting', value: 160 },
        { name: 'Support', value: 80 }
      ]
    }
  ]
};

export const Default: Story = {
  args: {
    data,
    height: 350
  }
};

export const Compact: Story = {
  args: {
    ...Default.args,
    height: 240,
    className: 'max-w-md'
  }
};

export const SingleLevel: Story = {
  args: {
    ...Default.args,
    data: {
      name: 'Traffic',
      children: [
        { name: 'Direct', value: 420 },
        { name: 'Organic', value: 310 },
        { name: 'Referral', value: 170 }
      ]
    }
  }
};

export const CustomColors: Story = {
  args: {
    ...Default.args,
    data: {
      ...data,
      children: data.children.map((child, index) => ({
        ...child,
        fill: ['#0f766e', '#d97706', '#7c3aed'][index]
      }))
    }
  }
};
