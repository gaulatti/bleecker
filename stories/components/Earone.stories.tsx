import type { Meta, StoryObj } from '@storybook/react-vite';

import { Earone } from '../../src/components/earone';

const meta = {
  component: Earone,
  title: 'Components/Earone',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof Earone>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { rank: 3, spins: 12840, logoUrl: '/partner.svg' } };
export const WithoutLogo: Story = { args: { rank: 12, spins: 640, label: 'PARTNER' } };
