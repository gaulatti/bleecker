import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Select, type SelectProps } from '../../src/components/select';

const options = [
  { label: 'New York', value: 'nyc' },
  { label: 'Madrid', value: 'mad' },
  { label: 'Montevideo', value: 'mvd' },
  { label: 'Sanremo', value: 'sanremo' },
  { label: 'Santiago', value: 'scl' },
  { label: 'Tokyo', value: 'tyo' }
];

type SelectStoryArgs = Omit<SelectProps, 'onChange' | 'value'> & {
  initialValue: string;
};

const meta = {
  component: Select,
  title: 'Components/Select',
  args: {
    initialValue: 'nyc',
    options,
    placeholder: 'Select a city'
  },
  argTypes: {
    options: {
      control: 'object'
    },
    initialValue: {
      control: 'text'
    },
    onChange: {
      control: false
    },
    value: {
      control: false
    }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<SelectStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ initialValue, ...args }) => {
    const [value, setValue] = React.useState(initialValue);

    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return (
      <div className='w-80'>
        <Select {...args} value={value} onChange={setValue} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.click(trigger);
    await expect(within(document.body).getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(trigger).toHaveTextContent('Madrid');
  }
};

export const Placeholder: Story = {
  ...Default,
  args: {
    ...meta.args,
    initialValue: ''
  }
};

export const Disabled: Story = {
  ...Default,
  args: {
    ...meta.args,
    disabled: true
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('combobox')).toBeDisabled();
  }
};

export const InContext: Story = {
  render: () => {
    const [value, setValue] = React.useState('mvd');
    const [availability, setAvailability] = React.useState('');
    return (
      <div className='grid w-[720px] grid-cols-2 gap-8 rounded-[var(--radius-card)] border border-sand/25 bg-white p-8 shadow-[var(--shadow-surface)] dark:border-white/10 dark:bg-deep-sea'>
        <div className='space-y-2.5'>
          <label className='text-[13px] font-medium'>Showroom</label>
          <Select aria-label='Showroom' value={value} onChange={setValue} options={options} />
          <p className='font-secondary text-xs leading-5 text-text-secondary'>Choose the showroom handling this appointment.</p>
        </div>
        <div className='space-y-2.5'>
          <label className='text-[13px] font-medium'>Availability</label>
          <Select
            aria-label='Availability'
            value={availability}
            onChange={setAvailability}
            options={[{ label: 'All pieces', value: '' }, { label: 'In stock', value: 'stock' }, { label: 'Pre-order', value: 'preorder' }]}
          />
          <p className='font-secondary text-xs leading-5 text-text-secondary'>Empty-value options remain stable and selectable.</p>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const availability = canvas.getByRole('combobox', { name: 'Availability' });
    await userEvent.click(availability);
    await userEvent.click(within(document.body).getByRole('option', { name: 'In stock' }));
    await expect(availability).toHaveTextContent('In stock');
    await userEvent.click(availability);
    await userEvent.click(within(document.body).getByRole('option', { name: 'All pieces' }));
    await expect(availability).toHaveTextContent('All pieces');
  }
};
