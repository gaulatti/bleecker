import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search, GripVertical, Plus } from 'lucide-react';
import { Panel } from '../../src/components/panel';
import { PanelLayout } from '../../src/layout/panel-layout';
import { Card } from '../../src/components/card';
import { Input } from '../../src/components/input';
import { Button } from '../../src/components/button';
import { ActivityItem } from '../../src/components/activity-item';
import { FeedItem } from '../../src/components/feed-item';

const meta = {
  title: 'Layout/PanelLayout',
  component: PanelLayout,
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    mode: 'scroll',
    padding: 'p-6'
  },
  argTypes: {
    mode: {
      control: 'radio',
      options: ['scroll', 'expand', 'monitor']
    }
  }
} satisfies Meta<typeof PanelLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className='h-screen w-full bg-light-sand/30 dark:bg-deep-sea'>
      <div className='flex h-full flex-col'>
        {/* Mock App Header */}
        <header className='flex h-16 shrink-0 items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-deep-sea/90 px-6 shadow-[0_4px_24px_rgba(26,55,77,0.02)] z-10 backdrop-blur-md'>
          <div className='flex items-center gap-4'>
            <span className='text-lg font-bold text-sea'>BLEECKER</span>
            <span className='text-sm text-text-secondary'>/ Command Center</span>
          </div>
          <Button variant='primary' size='sm'>
            <Plus className='w-4 h-4 mr-2' /> New Metric
          </Button>
        </header>

        {/* Panel Layout */}
        <div className='flex flex-1 min-h-0 bg-transparent'>
          <PanelLayout {...args}>
            <Panel
              title='Realtime Logs'
              accent='var(--color-terracotta)'
              count={142}
              width={340}
              dragHandle={<GripVertical className='h-4 w-4' />}
              filter={
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary' />
                  <Input placeholder='Filter logs...' className='pl-9 h-8 text-xs bg-white dark:bg-deep-sea' />
                </div>
              }
            >
              <ActivityItem title='Deploy successful build #44' time='2m ago' init='DB' />
              <ActivityItem title='Worker node auto-scaled' time='5m ago' init='WN' />
              <ActivityItem title='Cache invalidated by user' time='15m ago' init='CI' />
              <ActivityItem title='Deploy started via webhook' time='22m ago' init='DW' />
              <ActivityItem title='Database schema migration' time='1h ago' init='DB' />
              <ActivityItem title='Payment gateway timeout' time='3h ago' init='PG' />
            </Panel>

            <Panel
              title='Active Sessions'
              accent='var(--color-sea)'
              count={24}
              width={340}
              dragHandle={<GripVertical className='h-4 w-4' />}
              toolbar={
                <Button variant='outline' size='sm' className='w-full text-xs h-7'>
                  End All Sessions
                </Button>
              }
            >
              <ActivityItem title='Alex (Berlin, DE)' time='IP: 192.168.0.1' init='A' />
              <ActivityItem title='Jordan (Madrid, ES)' time='IP: 10.0.0.45' init='J' />
              <ActivityItem title='Taylor (London, UK)' time='IP: 172.16.0.8' init='T' />
            </Panel>

            <Panel title='Processing Queue' accent='var(--color-desert)' width={340} dragHandle={<GripVertical className='h-4 w-4' />}>
              <div className='p-6 flex flex-col gap-6'>
                <Card className='shadow-none border-dashed ring-0 bg-transparent text-center py-8'>
                  <span className='text-sm text-text-secondary block'>Queue is currently empty.</span>
                </Card>
              </div>
            </Panel>

            <Panel title='Anomaly Detection' accent='var(--color-terracotta)' count={3} width={340} dragHandle={<GripVertical className='h-4 w-4' />}>
              <ActivityItem title='Spike in 500 errors' time='EU-West region' init='500' />
              <ActivityItem title='Unusual login velocity' time='Admin accounts' init='SEC' />
            </Panel>
          </PanelLayout>
        </div>
      </div>
    </div>
  )
};

export const ExpandMode: Story = {
  args: {
    mode: 'expand',
    padding: 'p-6'
  },
  render: Default.render
};

export const MonitorVariant: Story = {
  args: {
    mode: 'monitor'
  },
  render: (args) => (
    <div className='h-screen w-full bg-white dark:bg-deep-sea text-text-primary flex'>
      {/* Main Flow layout representing columns */}
      <div className='flex flex-col flex-1 h-full min-h-0 overflow-hidden bg-light-sand/30 dark:bg-black/20'>
        <PanelLayout {...args} className='h-full'>
          {/* Column 1: Home/Timeline */}
          <Panel title='Home' accent='var(--color-sea)' width={380} dragHandle={<GripVertical className='h-4 w-4 text-text-secondary' />}>
            <FeedItem
              author='CloudNode'
              handle='@cloudnode'
              time='2m'
              init='C'
              verified
              content='We are deploying the next generation of cloud infrastructure. Experience it today. ⚡️'
            />
            <FeedItem
              author='Alex Maker'
              handle='@alexmaker'
              time='15m'
              init='AM'
              verified
              content='The latency on this new feature is absolutely incredible. Awwwards worthy!'
            />
            <FeedItem author='Orbit' handle='@orbitapp' time='1h' init='O' verified content='Announcing Orbit Insights. Build custom dashboards for your teams.' />
            <FeedItem
              author='PayFlow'
              handle='@payflow'
              time='3h'
              init='P'
              verified
              content='Increased authorization rates globally with the new Machine Learning upgrade.'
            />
            <FeedItem
              author='CloudNode'
              handle='@cloudnode'
              time='5h'
              init='C'
              verified
              content='We are seeing increased performance across all regions with our new edge network. Scaling seamlessly as always! ⚡️'
            />
            <FeedItem
              author='Jamie'
              handle='@jamiedesign'
              time='6h'
              init='J'
              content='Adding continuous scrolling feeds requires properly managing flex constraints so panels correctly respect the 100vh bound. Fixed!'
            />
          </Panel>

          {/* Column 2: Notifications */}
          <Panel title='Notifications' accent='var(--color-sea)' width={380} count={3} dragHandle={<GripVertical className='h-4 w-4 text-text-secondary' />}>
            <div className='p-4 border-b border-black/[0.04] dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.02]'>
              <span className='text-2xl mb-2 block'>❤️</span>
              <p className='text-sm font-semibold text-text-primary mb-1'>Alex Maker liked your reply</p>
              <p className='text-xs text-text-secondary'>"The new shadows and spring animations on the component library look unbelievable."</p>
            </div>
            <div className='p-4 border-b border-black/[0.04] dark:border-white/[0.04]'>
              <span className='text-2xl mb-2 block'>👤</span>
              <p className='text-sm font-semibold text-text-primary mb-1'>Bleecker UI followed you</p>
            </div>
            <div className='p-4 border-b border-black/[0.04] dark:border-white/[0.04] bg-black/[0.02] dark:bg-white/[0.02]'>
              <span className='text-2xl mb-2 block'>🔄</span>
              <p className='text-sm font-semibold text-text-primary mb-1'>PayFlow reposted your component</p>
              <p className='text-xs text-text-secondary'>"Check out this flawless implementation of the datatable using radix."</p>
            </div>
          </Panel>

          {/* Column 3: Search / Hashtag */}
          <Panel
            title='#designsystems'
            accent='var(--color-terracotta)'
            width={380}
            dragHandle={<GripVertical className='h-4 w-4 text-text-secondary' />}
            filter={
              <div className='relative mb-2 mt-1 mx-3'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary' />
                <Input
                  placeholder='Search within column'
                  className='pl-9 h-9 text-sm bg-black/5 dark:bg-white/5 border-transparent text-text-primary focus:ring-sea/50'
                />
              </div>
            }
          >
            <FeedItem
              author='Jamie'
              handle='@jamiedesign'
              time='22m'
              init='J'
              content='Just ripped out all standard tailwind colors and replaced them with sand, sea, terracotta. Massive upgrade. #designsystems'
            />
            <FeedItem
              author='Component Guru'
              handle='@components'
              time='1d'
              init='CG'
              content='Rounded corners vs straight edges in enterprise apps: the ultimate showdown. Read my article below. 🧵 #designsystems'
            />
          </Panel>

          {/* Column 4: Mentions */}
          <Panel title='Mentions' accent='var(--color-sea)' width={380} dragHandle={<GripVertical className='h-4 w-4 text-text-secondary' />}>
            <div className='flex flex-col items-center justify-center h-64 text-center px-6'>
              <span className='text-4xl mb-4'>🔔</span>
              <h3 className='font-bold text-lg mb-2 text-text-primary'>No new mentions</h3>
              <p className='text-sm text-text-secondary'>When someone mentions you, you'll see it here first in your custom column.</p>
            </div>
          </Panel>
        </PanelLayout>
      </div>
    </div>
  )
};
