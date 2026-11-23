import type { Meta, StoryObj } from '@storybook/react-vite';

import { QRCodeWidget } from '../../src/components/qr-code-widget';

const meta = {
  component: QRCodeWidget,
  title: 'Components/QRCodeWidget',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof QRCodeWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <QRCodeWidget content='https://example.test' placeholder={false} />
};

export const Variant: Story = {
  render: () => <QRCodeWidget placeholder />
};
