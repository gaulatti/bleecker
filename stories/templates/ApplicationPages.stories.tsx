import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, BriefcaseBusiness, Building2, CalendarDays, FileText, Gem, LayoutDashboard, Settings2, ShieldCheck, Users } from 'lucide-react';

import { Avatar } from '../../src/components/avatar';
import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { DataList } from '../../src/components/data-list';
import { Eyebrow } from '../../src/components/eyebrow';
import { Metric } from '../../src/components/metric';
import { PageHeader } from '../../src/components/page-header';
import { Sidebar, type SidebarItem } from '../../src/components/sidebar';
import { StatusBadge } from '../../src/components/status-badge';
import { Timeline } from '../../src/components/timeline';
import { AdminShell } from '../../src/layout/admin-shell';
import { DetailLayout } from '../../src/layout/detail-layout';

const meta = {
  title: 'Templates/Application Pages',
  parameters: { layout: 'fullscreen' }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const navigation: SidebarItem[] = [
  { id: 'overview', label: 'Overview', href: '#overview', icon: <LayoutDashboard size={17} />, active: true },
  { id: 'clients', label: 'Private clients', href: '#clients', icon: <Users size={17} /> },
  { id: 'portfolio', label: 'Portfolio', href: '#portfolio', icon: <BriefcaseBusiness size={17} /> },
  { id: 'documents', label: 'Documents', href: '#documents', icon: <FileText size={17} /> },
  { id: 'settings', label: 'Administration', href: '#settings', icon: <Settings2 size={17} /> }
];

function WorkspaceSidebar({ active = 'overview' }: { active?: string }) {
  return (
    <Sidebar
      className='bg-[#fbfaf7] dark:bg-deep-sea'
      header={
        <div className='flex items-center gap-3 px-1'>
          <span className='flex h-9 w-9 items-center justify-center rounded-[9px] bg-deep-sea text-white dark:bg-white dark:text-deep-sea'>
            <Gem size={16} strokeWidth={1.6} />
          </span>
          <div>
            <p className='text-sm font-semibold tracking-[0.08em]'>BLEECKER</p>
            <p className='font-secondary text-[11px] text-text-secondary'>Private office</p>
          </div>
        </div>
      }
      items={navigation.map((item) => ({ ...item, active: item.id === active }))}
      footer={
        <div className='flex items-center gap-3 px-1'>
          <Avatar fallback='Alexandra Bleecker' size='sm' />
          <div className='min-w-0'>
            <p className='truncate text-xs font-medium'>Alexandra Bleecker</p>
            <p className='font-secondary truncate text-[10px] text-text-secondary'>Principal</p>
          </div>
        </div>
      }
    />
  );
}

export const ExecutiveBriefing: Story = {
  render: () => (
    <AdminShell sidebar={<WorkspaceSidebar />} contentClassName='bg-[#f7f4ee] dark:bg-background'>
      <PageHeader
        breadcrumbs={<Eyebrow>Saturday briefing · 12 August</Eyebrow>}
        title='Good morning, Alexandra.'
        description='The position is composed. Three decisions require your attention before Monday.'
        actions={
          <>
            <Button variant='secondary'>Download brief</Button>
            <Button>Review decisions <ArrowRight size={14} /></Button>
          </>
        }
      />

      <section className='mt-10 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]'>
        <Card variant='elevated' className='flex min-h-72 flex-col justify-between bg-deep-sea p-8 text-white dark:bg-[#132331]'>
          <div className='flex items-start justify-between gap-6'>
            <Eyebrow tone='inverse' rule>Consolidated position</Eyebrow>
            <StatusBadge label='Within mandate' variant='live' />
          </div>
          <div className='mt-16'>
            <Metric value={284600000} format='currency' className='text-4xl font-medium text-white sm:text-5xl' />
            <div className='mt-6 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-3'>
              {[
                ['Quarter to date', '+3.8%'],
                ['Liquidity', '$42.1m'],
                ['Commitments', '$18.4m']
              ].map(([label, value]) => (
                <div key={label}>
                  <p className='font-secondary text-[11px] text-white/60'>{label}</p>
                  <p className='mt-1.5 text-lg font-medium text-white'>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card variant='subtle' className='p-7'>
          <Eyebrow>Principal decisions</Eyebrow>
          <div className='mt-5 divide-y divide-sand/30 dark:divide-white/10'>
            {[
              ['01', 'Approve the Northbank allocation', '$12.0m'],
              ['02', 'Extend the Valencia credit line', '$4.5m'],
              ['03', 'Confirm Q4 liquidity reserve', '$8.0m']
            ].map(([number, title, value]) => (
              <button key={number} className='group flex w-full items-center gap-4 py-4 text-left first:pt-0 last:pb-0'>
                <span className='font-secondary text-[11px] text-text-secondary'>{number}</span>
                <span className='flex-1 text-sm font-medium'>{title}</span>
                <span className='text-sm tabular-nums text-text-secondary'>{value}</span>
                <ArrowRight size={13} className='text-text-secondary transition-transform group-hover:translate-x-0.5' />
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className='mt-8 grid gap-5 lg:grid-cols-3'>
        {[
          ['Public markets', 96700000, '+4.1%'],
          ['Private capital', 142800000, '+6.8%'],
          ['Real assets', 45100000, '–0.7%']
        ].map(([label, value, change]) => (
          <Card key={label as string} variant='outlined' className='p-6'>
            <p className='font-secondary text-xs text-text-secondary'>{label}</p>
            <Metric value={value as number} format='currency' className='mt-3 block text-2xl font-medium' />
            <p className='mt-4 text-xs font-medium text-accent-text'>{change as string} <span className='font-secondary font-normal text-text-secondary'>year to date</span></p>
          </Card>
        ))}
      </section>
    </AdminShell>
  )
};

export const PrivateClientRecord: Story = {
  render: () => (
    <AdminShell sidebar={<WorkspaceSidebar active='clients' />} contentClassName='bg-[#fbfaf7] dark:bg-background'>
      <PageHeader
        breadcrumbs={<Eyebrow>Private clients · BL-0184</Eyebrow>}
        title='Eleanor Whitmore'
        description='New York · Client since 2018 · Relationship led by Marcus Laurent'
        actions={
          <>
            <Button variant='secondary'>Add private note</Button>
            <Button>Arrange appointment</Button>
          </>
        }
      />

      <DetailLayout
        className='mt-10'
        ratio='primary'
        side='end'
        sideRailLabel='Private client profile and advisor note'
        sideRail={
          <div className='space-y-5'>
            <Card variant='subtle' className='p-6'>
              <div className='flex items-center gap-3'><ShieldCheck size={17} className='text-sea' /><h2 className='text-base font-medium'>Private profile</h2></div>
              <DataList className='mt-4' items={[
                { id: 'advisor', label: 'Advisor', value: 'Marcus Laurent' },
                { id: 'office', label: 'Preferred office', value: 'Madison Avenue' },
                { id: 'contact', label: 'Contact window', value: '10:00–16:00 ET' },
                { id: 'service', label: 'Service level', value: 'Private office' }
              ]} />
            </Card>
            <Card variant='outlined' className='p-6'>
              <Eyebrow>Advisor note</Eyebrow>
              <blockquote className='mt-4 text-lg font-medium leading-7'>Prefers a complete point of view and very few options. Reserve the north salon.</blockquote>
              <p className='font-secondary mt-5 border-t border-sand/25 pt-4 text-xs text-text-secondary'>Marcus Laurent · updated yesterday</p>
            </Card>
          </div>
        }
      >
        <div className='space-y-8'>
          <Card variant='outlined' className='p-7'>
            <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-4'>
                <Avatar fallback='Eleanor Whitmore' size='xl' className='rounded-[var(--radius-card)]' />
                <div>
                  <div className='flex items-center gap-2'><h2 className='text-xl font-medium'>Private client</h2><StatusBadge label='In good standing' variant='live' /></div>
                  <p className='font-secondary mt-1.5 text-sm text-text-secondary'>Wardrobe, objects, and private travel</p>
                </div>
              </div>
              <p className='text-left sm:text-right'><span className='block text-2xl font-medium'>$428,600</span><span className='font-secondary text-[11px] text-text-secondary'>twelve-month relationship value</span></p>
            </div>
          </Card>

          <section>
            <div className='mb-5 flex items-end justify-between'><div><Eyebrow>Relationship history</Eyebrow><h2 className='mt-2 text-xl font-medium'>Recent and upcoming moments</h2></div><Button variant='link'>View full history</Button></div>
            <Card variant='surface' className='p-7'>
              <Timeline items={[
                { id: 'preview', title: 'Autumn private preview', description: 'Madison Avenue salon · Marcus Laurent attending', timestamp: '18 Sep', status: 'active', icon: <CalendarDays size={14} /> },
                { id: 'delivery', title: 'Florence acquisition delivered', description: 'White-glove delivery completed at the Fifth Avenue residence.', timestamp: '2 Aug', status: 'completed' },
                { id: 'residence', title: 'Paris residence confirmed', description: 'Seasonal profile and arrival preferences updated.', timestamp: '14 Jul', status: 'completed', icon: <Building2 size={14} /> }
              ]} />
            </Card>
          </section>
        </div>
      </DetailLayout>
    </AdminShell>
  )
};
