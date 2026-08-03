import type { Meta, StoryObj } from '@storybook/react-vite';

import { ErrorState } from '../../src/components/error-state';

const meta = {
  component: ErrorState,
  title: 'Components/ErrorState',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Failed to load data',
    description: 'Something went wrong while fetching the dashboard metrics.',
    onRetry: () => alert('Retrying...')
  }
};

export const WithoutRetry: Story = {
  args: {
    title: 'Report unavailable',
    description: 'This report has not been generated yet.'
  }
};
