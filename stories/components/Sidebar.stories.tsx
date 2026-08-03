import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDashboard, Users, Settings, FileText, ChevronDown } from 'lucide-react';

import { Sidebar } from '../../src/components/sidebar';

const meta = {
  component: Sidebar,
  title: 'Components/Sidebar',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: 'dashboard', label: 'Dashboard', href: '#', icon: <LayoutDashboard size={18} />, active: true },
  {
    id: 'users',
    label: 'Users',
    icon: <Users size={18} />,
    items: [
      { id: 'customers', label: 'Customers', href: '#' },
      { id: 'team', label: 'Team', href: '#' }
    ]
  },
  { id: 'reports', label: 'Reports', href: '#', icon: <FileText size={18} /> },
  { id: 'settings', label: 'Settings', href: '#', icon: <Settings size={18} /> }
];

export const Default: Story = {
  render: () => (
    <div className='h-screen'>
      <Sidebar items={items} className='h-full' />
    </div>
  )
};

export const Collapsed: Story = {
  render: () => (
    <div className='h-screen'>
      <Sidebar items={items} collapsed className='h-full' />
    </div>
  )
};
