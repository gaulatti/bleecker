import type { Meta, StoryObj } from '@storybook/react-vite';

import { AttentionSurface } from '../../src/components/attention-surface';
import { Input } from '../../src/components/input';
import { FeedColumn } from '../../src/layout/feed-column';
import { FeedGrid } from '../../src/layout/feed-grid';
import { PanelLayout } from '../../src/layout/panel-layout';

const meta = {
  title: 'Patterns/Attention Feeds',
  component: AttentionSurface,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs']
} satisfies Meta<typeof AttentionSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

function StoryCard({ hue, intensity, title }: { hue: number; intensity: number; title: string }) {
  return (
    <AttentionSurface className='min-h-[142px]' hue={hue} intensity={intensity}>
      <div className='flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>
        <span>{title}</span>
        <span className='ml-auto tabular-nums'>Intensity {intensity}</span>
      </div>
      <p className='mt-4 text-[13px] leading-[1.58] text-text-primary'>
        Category identity remains visible while urgency changes both the hue mix and the distance traveled by the gradient.
      </p>
    </AttentionSurface>
  );
}

export const IntensityScale: Story = {
  args: { hue: 275, intensity: 2 },
  render: () => (
    <div className='min-h-screen bg-deep-sea p-6 text-white'>
      <FeedGrid minColumnWidth={240}>
        {[2, 4, 6, 8, 10].map((intensity) => (
          <StoryCard hue={275} intensity={intensity} key={intensity} title='Purple column' />
        ))}
      </FeedGrid>
    </div>
  )
};

export const MultiColumnMonitor: Story = {
  args: { hue: 190, intensity: 3 },
  render: () => (
    <div className='h-screen bg-[#0d1821] p-3 text-white'>
      <PanelLayout className='h-full [&>div]:gap-3'>
        {[
          { accent: 'hsl(195 70% 64%)', hue: 195, title: 'All', values: [3, 2, 4] },
          { accent: 'hsl(18 74% 66%)', hue: 18, title: 'Relevant', values: [8, 7, 9] },
          { accent: 'hsl(108 62% 64%)', hue: 108, title: 'World', values: [2, 4, 3] },
          { accent: 'hsl(285 64% 66%)', hue: 285, title: 'Business', values: [2, 6, 8] }
        ].map((column) => (
          <FeedColumn
            accent={column.accent}
            count={50}
            filter={<Input inputSize='sm' placeholder={`Search ${column.title}...`} />}
            key={column.title}
            title={column.title}
          >
            <div className='space-y-3'>
              {column.values.map((intensity, index) => (
                <StoryCard hue={column.hue} intensity={intensity} key={`${column.title}-${index}`} title='News desk' />
              ))}
            </div>
          </FeedColumn>
        ))}
      </PanelLayout>
    </div>
  )
};

export const OperationalGrid: Story = {
  args: { hue: 212, intensity: 5 },
  render: () => (
    <div className='min-h-screen bg-[#0d1821] text-white'>
      <div className='border-b border-white/[0.07] p-5'>
        <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-sea'>Events</p>
        <Input className='mt-4' inputSize='sm' placeholder='Search events...' />
      </div>
      <FeedGrid minColumnWidth={360}>
        {[2, 3, 5, 7, 8, 10].map((intensity) => (
          <StoryCard hue={212} intensity={intensity} key={intensity} title='Open event' />
        ))}
      </FeedGrid>
    </div>
  )
};
