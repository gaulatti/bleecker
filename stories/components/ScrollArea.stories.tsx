import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea } from '../../src/components/scroll-area';

const meta = {
  component: ScrollArea,
  title: 'Components/ScrollArea',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = Array.from({ length: 40 }, (_, i) => `Item ${i + 1}`);

export const Vertical: Story = {
  render: () => (
    <div className='w-64 rounded-xl border border-sand/20 dark:border-sand/30'>
      <ScrollArea maxHeight='240px'>
        {items.map((item) => (
          <div
            key={item}
            className='flex h-9 items-center border-b border-sand/10 px-4 text-sm text-text-primary last:border-0 dark:border-sand/20 dark:text-text-primary'
          >
            {item}
          </div>
        ))}
      </ScrollArea>
    </div>
  )
};

export const Horizontal: Story = {
  render: () => (
    <div className='w-72 rounded-xl border border-sand/20 dark:border-sand/30'>
      <ScrollArea orientation='horizontal'>
        <div className='flex gap-3 p-3' style={{ width: '900px' }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className='flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-sand/10 text-sm text-text-secondary dark:bg-sand/15'>
              Card {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
};
