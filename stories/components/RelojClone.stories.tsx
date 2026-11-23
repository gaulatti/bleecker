import type { Meta, StoryObj } from '@storybook/react-vite';

import { RelojClone } from '../../src/components/reloj-clone';

const meta = {
  component: RelojClone,
  title: 'Components/RelojClone',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof RelojClone>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <RelojClone timezone='America/Argentina/Buenos_Aires' />
};

export const Variant: Story = {
  render: () => <RelojClone timezone='UTC' logoUrl='https://cdn.example.test/logo.png' />
};
