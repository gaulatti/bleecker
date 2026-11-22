import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { SegmentedFilter } from '../../src/components/segmented-filter';
import { InTheme } from './theme-story';

const meta = {
  component: SegmentedFilter,
  title: 'Components/SegmentedFilter',
  args: { label: 'Analysis state', onChange: () => {}, options: [], value: 'all' },
  parameters: { layout: 'centered' }
} satisfies Meta<typeof SegmentedFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

const OPTIONS = [
  { value: 'all', label: 'All', count: 8 },
  { value: 'measured', label: 'Measured', count: 5 },
  { value: 'pending', label: 'Pending', count: 1 },
  { value: 'failed', label: 'Failed', count: 1 }
];

function Demo() {
  const [value, setValue] = React.useState('all');
  return <SegmentedFilter label='Analysis state' options={OPTIONS} value={value} onChange={setValue} />;
}

export const Default: Story = { render: () => <Demo /> };
export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Demo /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Demo /></InTheme> };
