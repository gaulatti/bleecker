import { Tv } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { HeaderSelect, type HeaderSelectProps } from '../../src/components/header-select';

type HeaderSelectStoryArgs = Omit<HeaderSelectProps, 'icon' | 'onChange' | 'value'> & {
  initialValue: string;
  showIcon: boolean;
};

const meta = {
  component: HeaderSelect,
  title: 'Components/HeaderSelect',
  args: {
    initialValue: 'studio-b',
    options: [
      { label: 'Studio A', value: 'studio-a' },
      { label: 'Studio B', value: 'studio-b' },
      { label: 'Studio C', value: 'studio-c' }
    ],
    placeholder: 'Select TV',
    showIcon: true
  },
  argTypes: {
    initialValue: {
      control: 'text'
    },
    options: {
      control: 'object'
    },
    onChange: {
      control: false
    },
    value: {
      control: false
    },
    showIcon: {
      control: 'boolean'
    }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<HeaderSelectStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ initialValue, showIcon, ...args }) => {
    const [value, setValue] = React.useState(initialValue);

    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return <HeaderSelect {...args} icon={showIcon ? <Tv size={15} strokeWidth={1.5} /> : null} onChange={setValue} value={value} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Select TV' });
    await userEvent.click(trigger);
    const menu = within(document.body);
    await expect(menu.getByRole('listbox')).toBeVisible();
    await userEvent.click(menu.getByRole('option', { name: 'Studio C' }));
    await expect(trigger).toHaveTextContent('Studio C');
  }
};

export const WithoutIcon: Story = {
  ...Default,
  args: {
    ...meta.args,
    initialValue: '',
    showIcon: false
  }
};
