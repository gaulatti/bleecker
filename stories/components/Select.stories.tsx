import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Select, type SelectProps } from '../../src/components/select';
import { Button } from '../../src/components/button';
import { Input } from '../../src/components/input';

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

function ControlledSelectExample({ initialValue, ...args }: SelectStoryArgs) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className='w-80'>
      <Select {...args} value={value} onChange={setValue} />
    </div>
  );
}

const meta = {
  component: ControlledSelectExample,
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
    }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<SelectStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ControlledSelectExample,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.click(trigger);
    await expect(await within(document.body).findByRole('listbox')).toBeVisible();
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

function ControlledEmptyExample({ initialValue, ...args }: SelectStoryArgs) {
  const [value, setValue] = React.useState(initialValue);
  const [changes, setChanges] = React.useState<string[]>([]);
  const [reading, setReading] = React.useState<{ native: string | null; submitted: string | null } | null>(null);

  return (
    <form
      className='w-80 space-y-4'
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const native = form.elements.namedItem('city');
        const submitted = new FormData(form).get('city');
        setReading({
          native: native instanceof HTMLSelectElement ? native.value : null,
          submitted: typeof submitted === 'string' ? submitted : null
        });
      }}
    >
      <div className='space-y-2'>
        <label htmlFor='controlled-empty-city' className='text-sm font-medium'>City</label>
        <Select
          {...args}
          id='controlled-empty-city'
          name='city'
          aria-label='City'
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue);
            setChanges((previous) => [...previous, nextValue]);
          }}
        />
      </div>
      <div className='space-y-2'>
        <label htmlFor='controlled-reset-writing' className='text-sm font-medium'>Retained writing</label>
        <Input id='controlled-reset-writing' defaultValue='Fictional note — café 東京.' />
      </div>
      <p role='status' className='font-secondary text-sm text-text-secondary'>Current choice: {value || 'None'}</p>
      <p className='font-secondary text-sm text-text-secondary'>Selection callbacks: <output aria-label='Selection callbacks'>{changes.length ? changes.map((choice) => choice || 'None').join(' → ') : 'No selections'}</output></p>
      <div className='flex flex-wrap gap-2'>
        <Button type='button' variant='secondary' onClick={() => setValue('')}>Clear choice</Button>
        <Button type='submit'>Read form value</Button>
      </div>
      <p className='font-secondary text-sm text-text-secondary'>Native city: <output aria-label='Native city'>{reading === null ? 'Not read' : reading.native === null ? 'Missing native field' : reading.native || 'None'}</output></p>
      <p className='font-secondary text-sm text-text-secondary'>Submitted city: <output aria-label='Submitted city'>{reading === null ? 'Not read' : reading.submitted === null ? 'Missing form entry' : reading.submitted || 'None'}</output></p>
    </form>
  );
}

// This fixture has no play function and can be exercised with native input.
export const ControlledEmpty: Story = {
  args: { initialValue: '', placeholder: 'Choose a city' },
  render: ControlledEmptyExample
};

export const ControlledEmptyRegression: Story = {
  ...ControlledEmpty,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'City' });
    const writing = canvas.getByRole('textbox', { name: 'Retained writing' });
    await userEvent.type(writing, ' More writing.');
    await expect(trigger).toHaveTextContent('Choose a city');
    await userEvent.click(trigger);
    await userEvent.click(await within(document.body).findByRole('option', { name: 'Madrid' }));
    await expect(trigger).toHaveTextContent('Madrid');
    await userEvent.click(canvas.getByRole('button', { name: 'Read form value' }));
    await expect(canvas.getByLabelText('Native city')).toHaveTextContent('mad');
    await expect(canvas.getByLabelText('Submitted city')).toHaveTextContent('mad');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear choice' }));
    await expect(trigger).toHaveTextContent('Choose a city');
    await userEvent.click(canvas.getByRole('button', { name: 'Read form value' }));
    await expect(canvas.getByLabelText('Native city')).toHaveTextContent('None');
    await expect(canvas.getByLabelText('Submitted city')).toHaveTextContent('None');
    await expect(canvas.getByLabelText('Selection callbacks')).toHaveTextContent('mad');
    await userEvent.click(trigger);
    await userEvent.click(await within(document.body).findByRole('option', { name: 'Tokyo' }));
    await expect(trigger).toHaveTextContent('Tokyo');
    await userEvent.click(canvas.getByRole('button', { name: 'Read form value' }));
    await expect(canvas.getByLabelText('Native city')).toHaveTextContent('tyo');
    await expect(canvas.getByLabelText('Submitted city')).toHaveTextContent('tyo');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear choice' }));
    await expect(trigger).toHaveTextContent('Choose a city');
    await userEvent.click(canvas.getByRole('button', { name: 'Read form value' }));
    await expect(canvas.getByLabelText('Native city')).toHaveTextContent('None');
    await expect(canvas.getByLabelText('Submitted city')).toHaveTextContent('None');
    await expect(canvas.getByLabelText('Selection callbacks')).toHaveTextContent('mad → tyo');
    await expect(writing).toHaveValue('Fictional note — café 東京. More writing.');
  }
};

export const EmptyOptionAndReading: Story = {
  render: () => {
    const [availability, setAvailability] = React.useState('');
    return (
      <div className='w-80 space-y-6'>
        <div className='space-y-2'>
          <label htmlFor='empty-option-availability' className='text-sm font-medium'>Availability</label>
          <Select
            id='empty-option-availability'
            aria-label='Availability'
            value={availability}
            onChange={setAvailability}
            options={[{ label: 'All pieces', value: '' }, { label: 'In stock', value: 'stock' }]}
          />
          <p role='status' className='font-secondary text-sm text-text-secondary'>Availability choice: {availability === '' ? 'All pieces' : 'In stock'}</p>
        </div>
        <div className='space-y-2'>
          <label htmlFor='saved-reading-city' className='text-sm font-medium'>Saved city</label>
          <Select id='saved-reading-city' aria-label='Saved city' disabled value='nyc' onChange={() => {}} options={options} />
        </div>
      </div>
    );
  }
};
