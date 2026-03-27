import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { HoverCard } from '../../src/components/hover-card';
import { Avatar } from '../../src/components/avatar';
import { Button } from '../../src/components/button';

const meta = {
  component: HoverCard,
  title: 'Components/HoverCard',
  parameters: { layout: 'padded' }
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard
      content={
        <div>
          <p className='text-sm font-medium text-text-primary dark:text-text-primary'>@gaulatti</p>
          <p className='mt-1 text-xs text-text-secondary dark:text-text-secondary'>
            Building design systems that bridge code and design. Open to collaboration.
          </p>
          <p className='mt-2 text-xs text-text-secondary dark:text-text-secondary'>
            <span className='font-medium text-text-primary dark:text-text-primary'>128</span> following ·{' '}
            <span className='font-medium text-text-primary dark:text-text-primary'>3.4k</span> followers
          </p>
        </div>
      }
    >
      <Button
        variant='ghost'
        size='sm'
        className='h-auto rounded-none border-0 px-0 py-0 font-medium text-sea hover:translate-y-0 hover:bg-transparent hover:text-sea hover:underline dark:text-accent-blue dark:hover:bg-transparent dark:hover:text-accent-blue'
      >
        @gaulatti
      </Button>
    </HoverCard>
  )
};

export const WithAvatar: Story = {
  render: () => (
    <HoverCard
      content={
        <div className='flex gap-3'>
          <Avatar src='https://i.pravatar.cc/150?img=5' alt='Alice' size='lg' />
          <div>
            <p className='text-sm font-semibold text-text-primary dark:text-text-primary'>Alice Martin</p>
            <p className='text-xs text-text-secondary dark:text-text-secondary'>Product Designer</p>
            <p className='mt-2 text-xs leading-relaxed text-text-secondary dark:text-text-secondary'>
              Crafting delightful interfaces at the intersection of form and function.
            </p>
          </div>
        </div>
      }
    >
      <Avatar src='https://i.pravatar.cc/150?img=5' alt='Alice' size='sm' className='cursor-pointer' />
    </HoverCard>
  )
};
