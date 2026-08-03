import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutDashboard, Users, Settings, FileText } from 'lucide-react';

import { AdminShell } from '../../src/layout/admin-shell';
import { Sidebar } from '../../src/components/sidebar';
import { PageHeader } from '../../src/components/page-header';

const meta = {
  component: AdminShell,
  title: 'Layout/AdminShell',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof AdminShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', href: '#', icon: <LayoutDashboard size={18} />, active: true },
  { id: 'users', label: 'Users', href: '#', icon: <Users size={18} /> },
  { id: 'reports', label: 'Reports', href: '#', icon: <FileText size={18} /> },
  { id: 'settings', label: 'Settings', href: '#', icon: <Settings size={18} /> }
];

export const Default: Story = {
  render: () => (
    <AdminShell sidebar={<Sidebar items={sidebarItems} />}>
      <PageHeader title='Dashboard' description='Overview of your admin panel.' />
      <div className='mt-6 rounded-[var(--radius-card)] border border-dashed border-border p-12 text-center text-sm text-text-secondary'>
        Main content area
      </div>
    </AdminShell>
  )
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <AdminShell
      header={<div className='border-b border-border bg-card px-6 py-4 font-semibold'>Operations</div>}
      sidebar={<Sidebar items={sidebarItems} />}
      footer={<span className='text-xs text-text-secondary'>Last synced just now</span>}
    >
      <PageHeader title='Reports' description='Header, sidebar, content, and footer slots together.' />
    </AdminShell>
  )
};
