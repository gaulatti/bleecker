import type { Meta, StoryObj } from '@storybook/react-vite';

import { FilterChip, FilterGroup } from '../../src/components/filter-chip';

const meta = {
  component: FilterChip,
  title: 'Components/FilterChip',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof FilterChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Status',
    value: 'Active',
    onRemove: () => {}
  }
};

export const Group: Story = {
  render: () => (
    <FilterGroup
      filters={[
        { label: 'Status', value: 'Active', onRemove: () => {} },
        { label: 'Role', value: 'Admin', onRemove: () => {} }
      ]}
      onClearAll={() => {}}
    />
  )
};
