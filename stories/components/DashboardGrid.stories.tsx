import type { Meta, StoryObj } from '@storybook/react-vite';

import { DashboardGrid, DashboardSpan } from '../../src/components/dashboard-grid';
import { Card } from '../../src/components/card';

const meta = {
  component: DashboardGrid,
  title: 'Components/DashboardGrid',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DashboardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DashboardGrid columns={3}>
      <Card className='h-24'>Span 1</Card>
      <Card className='h-24'>Span 1</Card>
      <Card className='h-24'>Span 1</Card>
      <DashboardSpan span={2}>
        <Card className='h-24'>Span 2</Card>
      </DashboardSpan>
      <Card className='h-24'>Span 1</Card>
    </DashboardGrid>
  )
};

export const TwoColumns: Story = {
  render: () => (
    <DashboardGrid columns={2}>
      <Card className='h-24'>Metric A</Card>
      <Card className='h-24'>Metric B</Card>
      <DashboardSpan span={2}>
        <Card className='h-32'>Full-width chart</Card>
      </DashboardSpan>
    </DashboardGrid>
  )
};
