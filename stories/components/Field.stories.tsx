import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Field } from '../../src/components/field';
import { Input } from '../../src/components/input';

const meta = {
  component: Field,
  title: 'Components/Field',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Input placeholder='name@example.com' />,
    description: 'Used for account and security notifications.',
    label: 'Email address'
  },
  render: (args) => <Field {...args} className='w-80' />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Email address' });
    await expect(input).toHaveAccessibleDescription('Used for account and security notifications.');
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  }
};

export const Invalid: Story = {
  args: {
    children: <Input defaultValue='not-an-email' error />,
    error: 'Enter a valid email address.',
    label: 'Email address',
    required: true
  },
  render: (args) => <Field {...args} className='w-80' />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Email address' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Enter a valid email address.');
  }
};
