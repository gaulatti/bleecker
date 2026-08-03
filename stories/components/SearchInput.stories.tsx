import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';

import { SearchInput } from '../../src/components/search-input';

const meta = {
  component: SearchInput,
  title: 'Components/SearchInput',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ initialValue = '', disabled = false }: { initialValue?: string; disabled?: boolean }) {
  const [value, setValue] = React.useState(initialValue);
  return (
    <SearchInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onClear={() => setValue('')}
      placeholder='Search...'
      className='w-72'
      disabled={disabled}
    />
  );
}

export const Default: Story = {
  render: () => <Demo />
};

export const WithValue: Story = {
  render: () => <Demo initialValue='quarterly report' />
};

export const Disabled: Story = {
  render: () => <Demo initialValue='Search unavailable' disabled />
};
