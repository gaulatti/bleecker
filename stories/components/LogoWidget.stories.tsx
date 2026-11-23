import type { Meta, StoryObj } from '@storybook/react-vite';

import { LogoWidget } from '../../src/components/logo-widget';

const meta = {
  component: LogoWidget,
  title: 'Components/LogoWidget',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof LogoWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <LogoWidget logoUrl='https://example.test/logo.png' />
};

export const Variant: Story = {
  render: () => <LogoWidget logoUrl='https://example.test/logo.png' position='top-right' />
};
