import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Calendar, DatePicker } from '../../src/components/date-picker';
import { DateRangePicker, type DateRange } from '../../src/components/date-range-picker';
import { click, render } from './helpers';

const day = (label: string) => document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
const heading = () => document.querySelector('span.text-\\[13px\\]')!.textContent;
const buttonByLabel = (label: string) => document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

describe('Calendar', () => {
  test('navigates across year boundaries in both directions', async () => {
    await render(<Calendar value={new Date(2024, 0, 15)} />);
    expect(heading()).toBe('January 2024');
    await click(buttonByLabel('Previous month'));
    expect(heading()).toBe('December 2023');
    await click(buttonByLabel('Previous month'));
    expect(heading()).toBe('November 2023');
    await click(buttonByLabel('Next month'));
    await click(buttonByLabel('Next month'));
    expect(heading()).toBe('January 2024');
    await click(buttonByLabel('Next month'));
    expect(heading()).toBe('February 2024');
  });

  test('marks the selected day, reports clicks and tolerates a missing handler', async () => {
    const onChange = vi.fn();
    const view = await render(<Calendar value={new Date(2024, 0, 15)} onChange={onChange} />);
    expect(day('Mon Jan 15 2024').getAttribute('aria-pressed')).toBe('true');
    expect(day('Tue Jan 16 2024').getAttribute('aria-pressed')).toBe('false');
    await click(day('Tue Jan 16 2024'));
    expect(onChange).toHaveBeenCalledWith(new Date(2024, 0, 16));
    await view.rerender(<Calendar value={new Date(2024, 0, 15)} />);
    await click(day('Tue Jan 16 2024'));
  });

  test('disables days outside the min/max range or rejected by the predicate', async () => {
    await render(
      <Calendar
        value={new Date(2024, 0, 15)}
        minDate={new Date(2024, 0, 10)}
        maxDate={new Date(2024, 0, 20)}
        disabled={date => date.getDate() === 15 ? false : date.getDate() === 12}
      />
    );
    expect(day('Tue Jan 09 2024').disabled).toBe(true);
    expect(day('Wed Jan 10 2024').disabled).toBe(false);
    expect(day('Fri Jan 12 2024').disabled).toBe(true);
    expect(day('Sat Jan 20 2024').disabled).toBe(false);
    expect(day('Sun Jan 21 2024').disabled).toBe(true);
    expect(day('Fri Jan 12 2024').className).toContain('opacity-30');
  });

  test('highlights today and defaults to the current month without a value', async () => {
    await render(<Calendar />);
    const today = new Date();
    expect(day(today.toDateString()).className).toContain('ring-sea');
    expect(heading()).toContain(String(today.getFullYear()));
  });
});

describe('DatePicker', () => {
  test('shows the placeholder, opens a labelled dialog and selects a date', async () => {
    const onChange = vi.fn();
    await render(<DatePicker aria-label='Due' placeholder='Choose' onChange={onChange} />);
    expect(document.body.textContent).toContain('Choose');
    await click(buttonByLabel('Due'));
    await expect.poll(() => document.querySelector('[role=dialog][aria-label=Due]')).not.toBeNull();
    expect(document.body.textContent).not.toContain('Clear date');
    const today = new Date();
    await click(day(new Date(today.getFullYear(), today.getMonth(), 15).toDateString()));
    expect(onChange).toHaveBeenCalledWith(new Date(today.getFullYear(), today.getMonth(), 15));
    await expect.poll(() => document.querySelector('[role=dialog][aria-label=Due]')).toBeNull();
  });

  test('shows the formatted value, can clear it, and falls back to the placeholder as dialog label', async () => {
    const onChange = vi.fn();
    await render(<DatePicker value={new Date(2024, 0, 15)} onChange={onChange} placeholder='Pick me' minDate={new Date(2024, 0, 1)} maxDate={new Date(2024, 0, 31)} disabledDates={date => date.getDate() === 3} />);
    expect(document.body.textContent).toContain('Jan 15, 2024');
    await click(document.querySelector('button[data-state]')!);
    await expect.poll(() => document.querySelector('[role=dialog][aria-label="Pick me"]')).not.toBeNull();
    expect(day('Wed Jan 03 2024').disabled).toBe(true);
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Clear date')!);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  test('a disabled picker has a disabled trigger; handlers are optional', async () => {
    await render(<DatePicker disabled triggerClassName='custom' className='outer' />);
    const trigger = document.querySelector<HTMLButtonElement>('button.custom')!;
    expect(trigger.disabled).toBe(true);
    expect(trigger.className).toContain('opacity-50');
    await render(<DatePicker value={new Date(2024, 0, 15)} />);
    const trigger2 = Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-state]')).at(-1)!;
    await click(trigger2);
    await expect.poll(() => document.querySelector('[role=dialog]')).not.toBeNull();
    await click(day('Tue Jan 16 2024'));
    await expect.poll(() => document.querySelector('[role=dialog]')).toBeNull();
    await click(trigger2);
    await expect.poll(() => document.querySelector('[role=dialog]')).not.toBeNull();
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Clear date')!);
    await expect.poll(() => document.querySelector('[role=dialog]')).toBeNull();
  });
});

describe('DateRangePicker', () => {
  test('shows both ends, reports each change merged into the range and clears', async () => {
    const onChange = vi.fn();
    const value: DateRange = { from: '2024-01-10', to: '2024-01-20' };
    await render(<DateRangePicker value={value} onChange={onChange} />);
    expect(document.body.textContent).toContain('Jan 10, 2024');
    expect(document.body.textContent).toContain('Jan 20, 2024');
    await click(buttonByLabel('Start date'));
    await expect.poll(() => day('Wed Jan 10 2024')).not.toBeNull();
    expect(day('Sun Jan 21 2024').disabled).toBe(true);
    await click(day('Mon Jan 08 2024'));
    expect(onChange).toHaveBeenLastCalledWith({ from: '2024-01-08', to: '2024-01-20' });
    await expect.poll(() => document.querySelector('[role=dialog]')).toBeNull();
    await click(buttonByLabel('End date'));
    await expect.poll(() => day('Wed Jan 10 2024')).not.toBeNull();
    expect(day('Tue Jan 09 2024').disabled).toBe(true);
    await click(day('Mon Jan 22 2024'));
    expect(onChange).toHaveBeenLastCalledWith({ from: '2024-01-10', to: '2024-01-22' });
    await click(buttonByLabel('Clear date range'));
    expect(onChange).toHaveBeenLastCalledWith({});
  });

  test('clearing a picker removes only that end', async () => {
    const onChange = vi.fn();
    await render(<DateRangePicker value={{ from: '2024-01-10' }} onChange={onChange} placeholder='Window' />);
    expect(document.querySelector('[role=group]')!.getAttribute('aria-label')).toBe('Window');
    await click(buttonByLabel('Start date'));
    await expect.poll(() => document.querySelector('[role=dialog]')).not.toBeNull();
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Clear date')!);
    expect(onChange).toHaveBeenLastCalledWith({ from: undefined });
  });

  test('presets set a trailing window ending today; no value means no clear button', async () => {
    const onChange = vi.fn();
    await render(<DateRangePicker value={{}} onChange={onChange} presets={[{ label: 'Last 7 days', days: 7 }, { label: 'Last 30 days', days: 30 }]} />);
    expect(document.querySelector('button[aria-label="Clear date range"]')).toBeNull();
    await click(Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Last 7 days')!);
    const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 7);
    expect(onChange).toHaveBeenLastCalledWith({ from: iso(from), to: iso(to) });
  });

  test('renders without presets', async () => {
    await render(<DateRangePicker value={{ to: '2024-02-02' }} onChange={() => undefined} presets={[]} className='extra' />);
    expect(document.querySelector('.extra')).not.toBeNull();
    expect(document.querySelector('button[aria-label="Clear date range"]')).not.toBeNull();
  });
});
