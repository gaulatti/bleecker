import type { Meta, StoryObj } from '@storybook/react-vite';

import { SankeyChart } from '../../src/components/sankey-chart';

const meta = {
  component: SankeyChart,
  title: 'Components/Charts/Sankey',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof SankeyChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = {
  nodes: [
    { name: 'Visitors' },
    { name: 'Product' },
    { name: 'Cart' },
    { name: 'Checkout' },
    { name: 'Purchase' }
  ],
  links: [
    { source: 0, target: 1, value: 4000 },
    { source: 0, target: 2, value: 2000 },
    { source: 1, target: 2, value: 2500 },
    { source: 2, target: 3, value: 3500 },
    { source: 3, target: 4, value: 2800 }
  ]
};

export const Default: Story = {
  args: {
    data,
    height: 400
  }
};

export const DenseLinks: Story = {
  args: {
    ...Default.args,
    nodeWidth: 20,
    linkCurvature: 0.2,
    linkOpacity: 0.6
  }
};

export const SubtleLinks: Story = {
  args: {
    ...Default.args,
    linkOpacity: 0.15,
    nodeRadius: 0
  }
};

export const CustomNodePalette: Story = {
  args: {
    ...Default.args,
    nodeColors: ['#0f766e', '#d97706', '#7c3aed', '#dc2626']
  }
};
