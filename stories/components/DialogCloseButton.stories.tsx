import type { Meta, StoryObj } from '@storybook/react-vite';

import { DialogCloseButton } from '../../src/components/dialog-close-button';

const meta = {
  component: DialogCloseButton,
  title: 'Components/DialogCloseButton',
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof DialogCloseButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DialogCloseButton aria-label='Close dialog' />
};

export const LargeIcon: Story = {
  render: () => <DialogCloseButton aria-label='Close dialog' iconSize={24} />
};
