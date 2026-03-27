import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Accordion } from '../../src/components/accordion';
import { Button } from '../../src/components/button';

const meta = {
  component: Accordion,
  title: 'Components/Accordion',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GroupsStyle: Story = {
  render: () => (
    <Accordion
      items={[
        {
          id: 'rock',
          title: 'Rock Classics',
          subtitle: '12 channels',
          actions: (
            <>
              <Button size='sm' className='rounded-lg px-3 py-1.5 text-xs' onClick={() => undefined}>
                <PlusCircle size={14} />
                Add
              </Button>
              <Button variant='destructive' size='sm' className='rounded-lg px-3 py-1.5 text-xs' aria-label='Delete group' onClick={() => undefined}>
                <Trash2 size={14} />
              </Button>
            </>
          ),
          content: (
            <ul className='divide-y divide-sand/5 dark:divide-sand/10'>
              {['Queen FM', 'Guitar Archive', 'Amplified Live'].map((channel) => (
                <li key={channel} className='flex items-center justify-between px-8 py-3 transition-colors hover:bg-sand/10 dark:hover:bg-sand/10'>
                  <div>
                    <p className='text-sm text-text-primary dark:text-text-primary'>{channel}</p>
                    <p className='text-xs text-text-secondary dark:text-text-secondary'>Music</p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-auto rounded-lg px-2 py-1 text-terracotta hover:translate-y-0 hover:bg-transparent hover:text-terracotta/80 dark:hover:bg-transparent'
                    aria-label={`Remove ${channel}`}
                    onClick={() => undefined}
                  >
                    <MinusCircle size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          )
        },
        {
          id: 'news',
          title: 'News Grid',
          subtitle: '8 channels',
          actions: (
            <Button size='sm' className='rounded-lg px-3 py-1.5 text-xs' onClick={() => undefined}>
              <PlusCircle size={14} />
              Add
            </Button>
          ),
          content: <div className='px-8 py-4 text-sm text-text-secondary dark:text-text-secondary'>Choose a group to reveal its channels and actions.</div>
        }
      ]}
    />
  )
};
