import type { Meta, StoryObj } from '@storybook/react-vite';

import { DataList } from '../../src/components/data-list';

const meta = {
  component: DataList,
  title: 'Components/DataList',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof DataList>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: 'name', label: 'Full name', value: 'Jane Doe' },
  { id: 'email', label: 'Email', value: 'jane@example.com', description: 'Verified email address' },
  { id: 'role', label: 'Role', value: 'Administrator' },
  { id: 'joined', label: 'Joined', value: 'Jan 15, 2024' }
];

export const Default: Story = {
  args: { items }
};

export const Striped: Story = {
  args: { items, striped: true }
};
