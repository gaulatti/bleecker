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
    <DateRangePicker
      value={range}
      onChange={setRange}
      presets={[
        { label: '7d', days: 7 },
        { label: '30d', days: 30 }
      ]}
    />
  );
}

export const Default: Story = {
  render: () => <Demo />
};

export const WithInitialRange: Story = {
  render: () => <Demo initialValue={{ from: new Date(2026, 6, 1), to: new Date(2026, 6, 31) }} />
};
