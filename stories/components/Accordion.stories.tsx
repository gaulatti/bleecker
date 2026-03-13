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
              <button className='inline-flex items-center rounded-lg bg-terracotta px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90'>
                <Trash2 size={14} />
              </button>
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
                  <button className='text-terracotta transition-opacity hover:opacity-80'>
                    <MinusCircle size={16} />
                  </button>
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
