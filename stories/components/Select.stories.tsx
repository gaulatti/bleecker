import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

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
  }
};
