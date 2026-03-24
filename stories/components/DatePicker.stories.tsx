import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DatePicker, Calendar } from '../../src/components/date-picker';

const meta = {
  component: DatePicker,
  title: 'Components/DatePicker',
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(null);
    return (
      <div className='flex flex-col gap-2'>
        <DatePicker value={date} onChange={setDate} />
        <p className='text-xs text-text-secondary dark:text-text-secondary'>Selected: {date ? date.toDateString() : 'none'}</p>
      </div>
    );
  }
};

export const WithPreselectedDate: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(new Date());
    return <DatePicker value={date} onChange={setDate} />;
  }
};

export const WithMinMax: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(null);
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 7);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    return (
      <div className='flex flex-col gap-2'>
        <DatePicker value={date} onChange={setDate} minDate={minDate} maxDate={maxDate} placeholder='Within next 30 days' />
        <p className='text-xs text-text-secondary dark:text-text-secondary'>Range: last 7 days to +30 days</p>
      </div>
    );
  }
};

export const Disabled: Story = {
  render: () => <DatePicker value={new Date()} onChange={() => undefined} disabled />
};

export const CalendarOnly: Story = {
  render: () => {
    const [date, setDate] = React.useState<Date | null>(new Date());
    return (
      <div className='w-72 rounded-2xl border border-sand/10 bg-white p-4 shadow-md dark:border-sand/20 dark:bg-dark-sand'>
        <Calendar value={date} onChange={setDate} />
      </div>
    );
  }
};
