import type { Meta, StoryObj } from '@storybook/react-vite';

import { BrandLockup } from '../../src/components/brand-lockup';

const meta = {
  component: BrandLockup,
  title: 'Components/BrandLockup',
  args: {
    href: '/',
    name: 'Bleecker'
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof BrandLockup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLogo: Story = {
  args: {
    logoSrc: 'https://placehold.co/32x32/1a1a2e/ffffff?text=B',
    logoAlt: 'Bleecker logo'
  }
};

export const LongName: Story = {
  args: {
    name: 'Bleecker Design System',
    logoSrc: 'https://placehold.co/32x32/1a1a2e/ffffff?text=BD'
  }
};
