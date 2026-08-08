import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Bookmark, Check, Plus, ShoppingBag } from 'lucide-react';

import { Button } from '../../src/components/button';

const meta = {
  component: Button,
  title: 'Components/Button',
  args: {
    children: 'Continue'
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'subtle', 'ghost', 'link', 'destructive'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Destructive: Story = { args: { children: 'Delete record', variant: 'destructive' } };

export const CompleteHierarchy: Story = {
  render: () => (
    <div className='w-[760px] space-y-8 rounded-[var(--radius-card)] border border-sand/25 bg-white p-8 shadow-[var(--shadow-surface)] dark:border-white/10 dark:bg-deep-sea'>
      <div>
        <p className='text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>Action hierarchy</p>
        <p className='font-secondary mt-2 max-w-xl text-sm leading-6 text-text-secondary'>One visual treatment for each level of intent, from decisive action to quiet utility.</p>
      </div>
      <div className='flex flex-wrap items-center gap-3'>
        <Button><ShoppingBag size={16} />Add to bag</Button>
        <Button variant='secondary'>Save for later</Button>
        <Button variant='outline'>Request details</Button>
        <Button variant='subtle'><Bookmark size={15} />Bookmark</Button>
        <Button variant='ghost'>Dismiss</Button>
        <Button variant='link'>View collection <ArrowRight size={14} /></Button>
      </div>
      <div className='flex flex-wrap items-center gap-3 border-t border-sand/20 pt-6 dark:border-white/10'>
        <Button size='xs'><Plus size={13} />Add</Button>
        <Button size='sm'><Check size={14} />Confirm</Button>
        <Button size='md'>Continue</Button>
        <Button size='lg'>Complete purchase</Button>
        <Button loading>Processing</Button>
        <Button disabled>Unavailable</Button>
      </div>
    </div>
  )
};

export const CommerceActions: Story = {
  render: () => (
    <div className='w-96 space-y-3 rounded-[var(--radius-card)] border border-sand/30 bg-white p-6 shadow-[var(--shadow-raised)] dark:border-white/10 dark:bg-deep-sea'>
      <p className='text-sm font-medium text-text-primary'>The Cashmere Edit</p>
      <p className='font-secondary text-sm leading-6 text-text-secondary'>Reserved in your size for the next 20 minutes.</p>
      <Button size='lg' fullWidth><ShoppingBag size={17} />Add to bag</Button>
      <Button size='lg' variant='secondary' fullWidth>Schedule a fitting</Button>
    </div>
  )
};
