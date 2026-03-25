import type { Meta, StoryObj } from '@storybook/react-vite';

import { Panel } from '../../src/components/panel';
import { PanelLayout } from '../../src/layout/panel-layout';

const meta = {
  title: 'Layout/PanelLayout',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const SampleFeed = ({ count = 5, label = 'Item' }: { count?: number; label?: string }) => (
  <div>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className='border-b border-white/5 p-4 text-sm text-text-secondary last:border-0 hover:bg-white/2 dark:text-text-secondary'>
        {label} #{i + 1} — sample content row
      </div>
    ))}
  </div>
);

export const Scroll: Story = {
  render: () => (
    <div className='flex h-screen flex-col bg-[#0f1419]'>
      <div className='flex flex-1 min-h-0'>
        <PanelLayout mode='scroll' padding='p-6'>
          <Panel title='All' count={42} accent='#6b7280' width={320}>
            <SampleFeed count={20} label='Post' />
          </Panel>
          <Panel title='Relevant' count={12} accent='#8b5cf6' width={320}>
            <SampleFeed count={12} label='Post' />
          </Panel>
          <Panel title='World' count={8} accent='#3b82f6' width={320}>
            <SampleFeed count={8} label='Post' />
          </Panel>
          <Panel title='Technology' count={5} accent='#06b6d4' width={320}>
            <SampleFeed count={5} label='Post' />
          </Panel>
        </PanelLayout>
      </div>
    </div>
  )
};

export const Expand: Story = {
  render: () => (
    <div className='flex h-screen flex-col bg-[#0f1419]'>
      <div className='flex flex-1 min-h-0'>
        <PanelLayout mode='expand' padding='p-6'>
          <Panel title='All' count={42} accent='#6b7280'>
            <SampleFeed count={10} label='Post' />
          </Panel>
          <Panel title='Relevant' count={12} accent='#8b5cf6'>
            <SampleFeed count={10} label='Post' />
          </Panel>
          <Panel title='World' count={8} accent='#3b82f6'>
            <SampleFeed count={10} label='Post' />
          </Panel>
        </PanelLayout>
      </div>
    </div>
  )
};
