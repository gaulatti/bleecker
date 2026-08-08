import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

import { DateRangePicker, type DateRange } from '../../src/components/date-range-picker';

const meta = {
  component: DateRangePicker,
  title: 'Components/DateRangePicker',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ initialValue = {} }: { initialValue?: DateRange }) {
  const [range, setRange] = React.useState<DateRange>(initialValue);
  return (
    <div className='max-w-3xl rounded-[var(--radius-card)] border border-sand/25 bg-light-sand/25 p-6 dark:border-white/10 dark:bg-white/[0.025]'>
      <p className='text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>Reporting period</p>
      <p className='font-secondary mb-5 mt-1.5 text-sm text-text-secondary'>Compare performance within a precise date window.</p>
      <DateRangePicker
        value={range}
        onChange={setRange}
        presets={[
          { label: '7 days', days: 7 },
          { label: '30 days', days: 30 }
        ]}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <Demo />
};

export const WithInitialRange: Story = {
  render: () => <Demo initialValue={{ from: '2026-07-01', to: '2026-07-31' }} />
};
