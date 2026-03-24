import { Slash } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Breadcrumb } from '../../src/components/breadcrumb';

const items = [
  { href: '/', label: 'Home' },
  { href: '/components', label: 'Components' },
  { href: '/components/navigation', label: 'Navigation' },
  { href: '/components/navigation/breadcrumb', label: 'Breadcrumb' }
];

const meta = {
  component: Breadcrumb,
  title: 'Components/Breadcrumb',
  args: {
    items
  },
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collapsed: Story = {
  args: {
    collapsedAfter: 1
  }
};

export const CustomSeparator: Story = {
  args: {
    separator: <Slash size={12} className='text-text-secondary' aria-hidden='true' />
  }
};

export const ShortPath: Story = {
  args: {
    items: [
      { href: '/', label: 'Home' },
      { href: '/components', label: 'Components' }
    ]
  }
};
