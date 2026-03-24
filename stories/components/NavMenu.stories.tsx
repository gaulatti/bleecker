import type { Meta, StoryObj } from '@storybook/react-vite';

import { NavMenu } from '../../src/components/nav-menu';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/components', label: 'Components' },
  { href: '/docs', label: 'Documentation' },
  { href: 'https://github.com', label: 'GitHub', external: true }
];

const meta = {
  component: NavMenu,
  title: 'Components/NavMenu',
  args: {
    items: navItems
  },
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof NavMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    direction: 'horizontal'
  }
};

export const Vertical: Story = {
  args: {
    direction: 'vertical'
  }
};
