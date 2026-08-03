import type { Meta, StoryObj } from '@storybook/react-vite';

import { DashboardSection } from '../../src/components/dashboard-section';
import { Button } from '../../src/components/button';

const meta = {
  component: DashboardSection,
  title: 'Components/DashboardSection',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DashboardSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Recent Orders',
    description: 'A quick overview of the latest purchases.',
    action: <Button size='sm'>View all</Button>,
    children: <div className='rounded-[var(--radius-ui)] bg-muted p-8 text-center text-sm text-text-secondary'>Section content</div>
  }
};

export const TitleOnly: Story = {
  args: {
    title: 'Overview',
    children: <div className='rounded-[var(--radius-ui)] bg-muted p-8 text-sm text-text-secondary'>Section content without description or actions</div>
  }
};
