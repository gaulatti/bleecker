import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stepper } from '../../src/components/stepper';

const meta = {
  component: Stepper,
  title: 'Components/Stepper',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [
  { id: '1', label: 'Account', description: 'Login details' },
  { id: '2', label: 'Profile', description: 'Personal info' },
  { id: '3', label: 'Billing', description: 'Payment method' },
  { id: '4', label: 'Review', description: 'Confirm' }
];

export const Horizontal: Story = {
  args: {
    steps,
    activeStep: '2'
  }
};

export const Vertical: Story = {
  args: {
    steps,
    activeStep: '2',
    orientation: 'vertical'
  }
};
