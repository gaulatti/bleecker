import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, ArrowUpRight, Bell, Bookmark, Boxes, Check, Clock3, Command, CreditCard, Gem, LayoutDashboard, MapPin, PackageCheck, Plane, Search, Settings2, ShieldCheck, Sparkles, UserRound, Users } from 'lucide-react';
import React from 'react';

import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { CollectionFilters } from '../../src/components/collection-filters';
import { DataList } from '../../src/components/data-list';
import { Field } from '../../src/components/field';
import { IconButton } from '../../src/components/icon-button';
import { Input } from '../../src/components/input';
import { Metric } from '../../src/components/metric';
import { Pagination } from '../../src/components/pagination';
import { Select } from '../../src/components/select';
import { StatCard } from '../../src/components/stat-card';
import { StatusBadge } from '../../src/components/status-badge';
import { DataTable } from '../../src/components/table';
import { Tabs } from '../../src/components/tabs';
import { Timeline } from '../../src/components/timeline';

const meta = {
  title: 'Templates/Luxury Pages',
  parameters: { layout: 'fullscreen' }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const CompleteComposition: Story = {
  render: () => {
    const [tab, setTab] = React.useState('collection');
    const [city, setCity] = React.useState('nyc');
    return (
      <main className='min-h-screen bg-light-sand/30 px-6 py-12 text-text-primary dark:bg-deep-sea md:px-10 md:py-16'>
        <div className='mx-auto max-w-6xl space-y-12'>
          <header className='flex flex-col gap-8 border-b border-sand/25 pb-10 dark:border-white/[0.08] md:flex-row md:items-end md:justify-between'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-desert'>Private client services</p>
              <h1 className='mt-3 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-refined'>A considered wardrobe, built over time.</h1>
              <p className='font-secondary mt-4 max-w-xl text-sm leading-6 text-text-secondary'>Quiet materials, clear hierarchy, and exact proportions carry the experience.</p>
            </div>
            <div className='flex gap-3'><Button variant='secondary'><Bookmark size={15} />Save edit</Button><Button>Book consultation <ArrowRight size={15} /></Button></div>
          </header>

          <Tabs
            tabs={[{ id: 'collection', label: 'Collection' }, { id: 'appointments', label: 'Appointments' }, { id: 'profile', label: 'Profile' }]}
            activeTab={tab}
            onChange={setTab}
          />

          <section className='grid gap-5 md:grid-cols-3'>
            <StatCard title='Reserved pieces' value='12' trend={{ direction: 'up', value: '+3', label: 'this season' }} icon={<PackageCheck size={18} />} />
            <Card className='md:col-span-2'>
              <div className='flex items-start justify-between gap-6'><div><p className='text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>Upcoming appointment</p><h2 className='mt-2 text-xl font-medium'>Autumn wardrobe review</h2><p className='font-secondary mt-2 text-sm text-text-secondary'>Madison Avenue · September 18 · 2:30 PM</p></div><StatusBadge label='Confirmed' variant='live' /></div>
              <div className='mt-6 border-t border-sand/20 pt-5 dark:border-white/[0.07]'><Button variant='link'>Review appointment details <ArrowRight size={13} /></Button></div>
            </Card>
          </section>

          <Card variant='outlined' className='grid gap-6 md:grid-cols-2'>
            <div><p className='text-[10px] font-semibold uppercase tracking-[0.1em] text-desert'>Preferences</p><h2 className='mt-2 text-2xl font-medium'>Tailor the experience</h2><p className='font-secondary mt-3 max-w-sm text-sm leading-6 text-text-secondary'>Secondary information remains quiet until it becomes useful.</p></div>
            <div className='space-y-5'>
              <Field label='Preferred showroom'><Select aria-label='Preferred showroom' value={city} onChange={setCity} options={[{ label: 'New York · Madison Avenue', value: 'nyc' }, { label: 'Madrid · Serrano', value: 'mad' }]} /></Field>
              <Field label='Stylist note' optional><Input placeholder='Add a private note' /></Field>
              <div className='flex justify-end gap-3'><Button variant='ghost'>Cancel</Button><Button>Save preferences</Button></div>
            </div>
          </Card>
        </div>
      </main>
    );
  }
};

export const QuietEditorialMoment: Story = {
  render: () => (
    <main className='min-h-screen bg-white px-6 py-16 text-text-primary dark:bg-deep-sea md:px-12 md:py-24'>
      <article className='mx-auto grid max-w-5xl gap-12 border-y border-sand/25 py-12 dark:border-white/[0.08] md:grid-cols-[0.72fr_1.28fr] md:gap-20 md:py-16'>
        <div className='flex flex-col justify-between gap-12'>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-desert'>The autumn edit</p>
            <p className='mt-6 text-sm leading-6 text-text-secondary'>No. 04 / 2026</p>
          </div>
          <StatusBadge label='Private preview' variant='default' />
        </div>
        <div>
          <h1 className='max-w-2xl text-4xl font-medium leading-[1.08] tracking-refined md:text-5xl'>Fewer pieces. Better decisions.</h1>
          <p className='font-secondary mt-6 max-w-xl text-[15px] leading-7 text-text-secondary'>A study in restraint, proportion, and materials that become more personal with time.</p>
          <div className='mt-10 flex flex-wrap items-center gap-3'>
            <Button>Explore the edit <ArrowRight size={15} /></Button>
            <Button variant='link'>Read the journal</Button>
          </div>
        </div>
      </article>
    </main>
  )
};

export const PrivateAviationConcierge: Story = {
  render: () => {
    const [departure, setDeparture] = React.useState('teb');
    const [party, setParty] = React.useState('4');

    return (
      <main className='min-h-screen overflow-hidden bg-deep-sea text-white'>
        <div className='relative isolate min-h-screen px-6 py-8 md:px-12 md:py-10'>
          <div aria-hidden='true' className='absolute -right-40 -top-56 -z-10 h-[44rem] w-[44rem] rounded-full border border-white/[0.06]' />
          <div aria-hidden='true' className='absolute -right-20 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full border border-desert/20' />

          <header className='mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-6'>
            <div className='flex items-center gap-3'>
              <span className='flex h-9 w-9 items-center justify-center rounded-[9px] border border-white/15 bg-white/[0.05]'><Plane size={16} /></span>
              <div><p className='text-sm font-semibold tracking-[0.06em]'>BLEECKER AIR</p><p className='font-secondary mt-0.5 text-[10px] text-white/50'>Private office</p></div>
            </div>
            <Button variant='outline' className='border-white/20 text-white hover:border-white/40 hover:bg-white/[0.06] dark:text-white'>Contact concierge</Button>
          </header>

          <div className='mx-auto grid max-w-7xl gap-14 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-24'>
            <section>
              <div className='flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-desert'><span className='h-px w-8 bg-desert/70' />Tailored departure</div>
              <h1 className='mt-7 max-w-3xl text-5xl font-medium leading-[0.98] tracking-[-0.035em] text-white md:text-7xl'>New York<br /><span className='text-white/38'>to the world.</span></h1>
              <p className='font-secondary mt-8 max-w-lg text-[15px] leading-7 text-white/58'>A dedicated aviation team, one immaculate itinerary, and no unnecessary decisions between here and there.</p>
              <div className='mt-12 grid max-w-2xl grid-cols-3 border-y border-white/10 py-6'>
                {[['18 min', 'Average wheels-up'], ['24 / 7', 'Flight desk'], ['1 call', 'Every detail']].map(([value, label]) => <div key={label} className='border-r border-white/10 px-5 first:pl-0 last:border-0'><p className='text-2xl font-medium text-white'>{value}</p><p className='font-secondary mt-1 text-[10px] text-white/42'>{label}</p></div>)}
              </div>
            </section>

            <Card className='border-white/10 bg-white/[0.055] p-6 text-white shadow-[0_32px_90px_-36px_rgba(0,0,0,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] md:p-8'>
              <div className='flex items-start justify-between'><div><p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-desert'>Request itinerary</p><h2 className='mt-2 text-2xl font-medium text-white'>Where shall we begin?</h2></div><StatusBadge label='Desk online' variant='live' /></div>
              <div className='mt-8 space-y-5'>
                <Field label='Departure airport' className='[&_label]:text-white/70'><Select aria-label='Departure airport' value={departure} onChange={setDeparture} className='border-white/15 bg-black/15 text-white dark:bg-black/15' options={[{ label: 'Teterboro · KTEB', value: 'teb' }, { label: 'Westchester · KHPN', value: 'hpn' }, { label: 'LaGuardia · KLGA', value: 'lga' }]} /></Field>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <Field label='Destination' className='[&_label]:text-white/70'><Input className='border-white/15 bg-black/15 text-white placeholder:text-white/30 dark:bg-black/15' placeholder='City or airport' /></Field>
                  <Field label='Travelers' className='[&_label]:text-white/70'><Select aria-label='Travelers' value={party} onChange={setParty} className='border-white/15 bg-black/15 text-white dark:bg-black/15' options={['2', '4', '6', '8'].map((value) => ({ label: `${value} travelers`, value }))} /></Field>
                </div>
                <Button fullWidth size='lg' className='border-desert bg-desert text-deep-sea hover:border-sand hover:bg-sand'>Build my itinerary <ArrowRight size={16} /></Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    );
  }
};

export const CollectorsCheckout: Story = {
  render: () => (
    <main className='min-h-screen bg-[#f7f2ea] px-5 py-8 text-text-primary md:px-10 md:py-12'>
      <div className='mx-auto max-w-7xl'>
        <header className='flex items-center justify-between border-b border-[#b89a72]/25 pb-6'>
          <p className='text-sm font-semibold tracking-[0.16em]'>ATELIER No. 18</p>
          <p className='font-secondary text-xs text-text-secondary'>Secure private acquisition</p>
        </header>

        <div className='grid gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-16'>
          <section>
            <div className='relative aspect-[1.35] overflow-hidden rounded-[var(--radius-card)] bg-[#c7ad8c]'>
              <div aria-hidden='true' className='absolute inset-[9%] border border-white/25' />
              <div aria-hidden='true' className='absolute left-[17%] top-[12%] h-[76%] w-[48%] rotate-[-7deg] rounded-[48%_48%_42%_42%] bg-[#eadfce] shadow-[0_35px_70px_-30px_rgba(45,31,20,0.45)]' />
              <div aria-hidden='true' className='absolute left-[28%] top-[24%] h-[52%] w-[26%] rounded-[44%] border border-[#6f523d]/20 bg-[#aa7858]/80' />
              <div className='absolute bottom-6 left-6 right-6 flex items-end justify-between text-white'><div><p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65'>One of twelve</p><p className='mt-1 text-xl font-medium'>Hand-finished in Florence</p></div><Gem size={20} /></div>
            </div>
            <div className='mt-6 flex items-start justify-between gap-6'><div><p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-desert'>The archive collection</p><h1 className='mt-2 text-3xl font-medium tracking-refined'>Sella sculptural weekender</h1><p className='font-secondary mt-2 text-sm text-text-secondary'>Vegetable-tanned calfskin · Tobacco</p></div><Metric value={6890} format='currency' className='text-xl font-medium' /></div>
          </section>

          <section className='lg:pt-4'>
            <div className='flex items-center gap-3 border-b border-sand/35 pb-6'><span className='flex h-9 w-9 items-center justify-center rounded-[9px] bg-sea/[0.06] text-sea'><ShieldCheck size={17} /></span><div><p className='text-sm font-medium'>Private acquisition</p><p className='font-secondary mt-0.5 text-xs text-text-secondary'>Insured delivery and lifetime care</p></div></div>
            <div className='mt-7 space-y-5'>
              <Field label='Collector name'><Input placeholder='Full name' /></Field>
              <Field label='Delivery residence'><Input placeholder='Address or private office' /></Field>
              <div className='grid gap-4 sm:grid-cols-2'><Field label='City'><Input placeholder='New York' /></Field><Field label='Postal code'><Input placeholder='10021' /></Field></div>
            </div>
            <Card variant='subtle' className='mt-7'>
              <DataList items={[{ id: 'piece', label: 'Edition', value: '08 / 12' }, { id: 'care', label: 'Care program', value: 'Lifetime' }, { id: 'delivery', label: 'White-glove delivery', value: 'Included' }]} />
            </Card>
            <Button fullWidth size='lg' className='mt-7'>Complete acquisition <CreditCard size={16} /></Button>
            <p className='font-secondary mt-4 text-center text-[11px] leading-5 text-text-secondary'>A private advisor will confirm delivery details within one business hour.</p>
          </section>
        </div>
      </div>
    </main>
  )
};

export const ExecutiveLedger: Story = {
  render: () => {
    const [tab, setTab] = React.useState('overview');
    return (
      <main className='min-h-screen bg-white px-6 py-8 text-text-primary md:px-10 md:py-12'>
        <div className='mx-auto max-w-7xl'>
          <header className='flex flex-col gap-7 border-b border-sand/25 pb-8 md:flex-row md:items-end md:justify-between'>
            <div><p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-desert'>Family office · Q3 2026</p><h1 className='mt-3 text-4xl font-medium tracking-refined'>Capital, without noise.</h1><p className='font-secondary mt-3 text-sm text-text-secondary'>Consolidated holdings across seven entities and four currencies.</p></div>
            <div className='flex gap-3'><Button variant='secondary'>Export statement</Button><Button>Review allocation <ArrowUpRight size={15} /></Button></div>
          </header>

          <Tabs className='mt-8' tabs={[{ id: 'overview', label: 'Overview' }, { id: 'holdings', label: 'Holdings' }, { id: 'documents', label: 'Documents' }]} activeTab={tab} onChange={setTab} />

          <section className='mt-9 grid gap-5 md:grid-cols-4'>
            {[['Net asset value', 284600000, '+4.8%'], ['Liquid capital', 42180000, '+1.2%'], ['Private markets', 96700000, '+7.1%'], ['Commitments', 18400000, '–2.4%']].map(([label, value, change], index) => (
              <Card key={label as string} variant={index === 0 ? 'elevated' : 'surface'}><p className='text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>{label}</p><Metric value={value as number} format='currency' className='mt-4 block text-2xl font-medium' /><p className={`mt-3 text-xs font-medium ${String(change).startsWith('–') ? 'text-terracotta' : 'text-sea'}`}>{change as string} <span className='font-secondary font-normal text-text-secondary'>year to date</span></p></Card>
            ))}
          </section>

          <section className='mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]'>
            <Card>
              <div className='flex items-end justify-between'><div><p className='text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>Portfolio composition</p><h2 className='mt-2 text-xl font-medium'>Allocation by mandate</h2></div><StatusBadge label='Within policy' variant='live' /></div>
              <div className='mt-9 space-y-5'>
                {[['Public equity', '34%', 34, 'bg-sea'], ['Private equity', '26%', 26, 'bg-desert'], ['Real assets', '18%', 18, 'bg-dusk'], ['Fixed income', '14%', 14, 'bg-sand'], ['Cash', '8%', 8, 'bg-terracotta']].map(([label, value, width, color]) => <div key={label as string} className='grid grid-cols-[8rem_1fr_3rem] items-center gap-4'><span className='text-sm'>{label}</span><div className='h-1.5 overflow-hidden rounded-full bg-light-sand'><div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} /></div><span className='text-right text-sm tabular-nums'>{value}</span></div>)}
              </div>
            </Card>
            <Card variant='subtle'><p className='text-[10px] font-semibold uppercase tracking-[0.1em] text-desert'>Principal note</p><blockquote className='mt-5 text-xl font-medium leading-8 tracking-refined'>“Preserve optionality. Deploy only when the asymmetry is unmistakable.”</blockquote><div className='mt-8 flex items-center gap-3 border-t border-sand/25 pt-5'><span className='flex h-9 w-9 items-center justify-center rounded-[9px] bg-white text-sea shadow-[var(--shadow-surface)]'><UserRound size={16} /></span><div><p className='text-sm font-medium'>A. Bleecker</p><p className='font-secondary text-xs text-text-secondary'>Investment committee</p></div></div></Card>
          </section>
        </div>
      </main>
    );
  }
};

export const GrandHotelArrival: Story = {
  render: () => (
    <main className='min-h-screen bg-light-sand/45 px-5 py-10 text-text-primary md:px-10 md:py-16'>
      <div className='mx-auto max-w-6xl overflow-hidden rounded-[var(--radius-dialog)] border border-sand/30 bg-white shadow-[var(--shadow-raised)]'>
        <section className='grid lg:grid-cols-[0.9fr_1.1fr]'>
          <div className='relative flex min-h-[32rem] flex-col justify-between overflow-hidden bg-[#765b48] p-8 text-white md:p-12'>
            <div aria-hidden='true' className='absolute -right-24 top-16 h-80 w-80 rounded-full border border-white/10' />
            <div aria-hidden='true' className='absolute -right-8 top-32 h-52 w-52 rounded-full bg-desert/25 blur-3xl' />
            <div className='relative'><p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e7c99d]'>Maison Bleecker · Paris</p><h1 className='mt-6 text-5xl font-medium leading-[1.02] tracking-[-0.03em] text-white'>Your suite<br />is expecting you.</h1><p className='font-secondary mt-6 max-w-sm text-sm leading-7 text-white/65'>Every preference remembered. Every arrival made effortless.</p></div>
            <div className='relative flex items-center gap-3 border-t border-white/15 pt-6'><MapPin size={16} className='text-[#e7c99d]' /><p className='text-sm'>18 Rue du Bac · 7e arrondissement</p></div>
          </div>

          <div className='p-7 md:p-12'>
            <div className='flex items-start justify-between gap-5'><div><p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-desert'>Arrival itinerary</p><h2 className='mt-2 text-2xl font-medium'>Thursday, 17 September</h2></div><StatusBadge label='Suite prepared' variant='live' /></div>
            <Timeline className='mt-9' items={[
              { id: 'car', title: 'Private car at CDG', description: 'Your driver, Marc, will meet you beyond customs.', timestamp: '10:40', status: 'completed', icon: <Check size={14} /> },
              { id: 'arrival', title: 'Private arrival', description: 'Proceed directly to Suite 704. No front desk required.', timestamp: '11:35', status: 'active', icon: <Clock3 size={14} /> },
              { id: 'dinner', title: 'Dinner at L’Orangerie', description: 'Corner table, terrace side. Jacket preferred.', timestamp: '20:00', status: 'pending' }
            ]} />
            <Card variant='subtle' className='mt-9 flex items-start gap-4'><span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-white text-desert shadow-[var(--shadow-surface)]'><Sparkles size={17} /></span><div><p className='text-sm font-medium'>A small detail, remembered</p><p className='font-secondary mt-1 text-xs leading-5 text-text-secondary'>Fresh gardenias and still water are waiting in the suite.</p></div></Card>
            <div className='mt-8 flex flex-wrap gap-3'><Button>Message your host</Button><Button variant='secondary'>View suite details</Button></div>
          </div>
        </section>
      </div>
    </main>
  )
};

export const NocturneControlRoom: Story = {
  render: () => (
    <main className='min-h-screen bg-[#101923] px-5 py-8 text-white md:px-10 md:py-12'>
      <div className='mx-auto max-w-7xl'>
        <header className='flex flex-col gap-6 border-b border-white/[0.08] pb-7 md:flex-row md:items-end md:justify-between'><div><div className='flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d5ad69]'><span className='h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)]' />Residence secure</div><h1 className='mt-3 text-4xl font-medium tracking-refined text-white'>Nocturne</h1><p className='font-secondary mt-2 text-sm text-white/48'>18 East 72nd Street · New York</p></div><div className='flex gap-3'><Button variant='ghost' className='text-white hover:bg-white/[0.06] dark:text-white'>House log</Button><Button className='border-[#d5ad69] bg-[#d5ad69] text-[#15202b] hover:bg-[#e3c58e]'>Contact steward</Button></div></header>

        <section className='mt-10 grid gap-4 md:grid-cols-3'>
          {[['Interior climate', '21.5°', 'Balanced throughout'], ['Perimeter', 'Secure', 'All zones armed'], ['Cellar', '12.8°', 'Humidity 61%']].map(([label, value, detail], index) => <div key={label} className={`rounded-[var(--radius-card)] border p-6 ${index === 1 ? 'border-emerald-400/20 bg-emerald-400/[0.04]' : 'border-white/[0.08] bg-white/[0.025]'}`}><p className='text-[10px] font-semibold uppercase tracking-[0.11em] text-white/42'>{label}</p><p className='mt-4 text-3xl font-medium tracking-refined text-white'>{value}</p><p className='font-secondary mt-2 text-xs text-white/40'>{detail}</p></div>)}
        </section>

        <section className='mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]'>
          <div className='rounded-[var(--radius-card)] border border-white/[0.08] bg-white/[0.025] p-6 md:p-8'>
            <div className='flex items-start justify-between'><div><p className='text-[10px] font-semibold uppercase tracking-[0.11em] text-[#d5ad69]'>Evening sequence</p><h2 className='mt-2 text-xl font-medium text-white'>The house settles at 22:30</h2></div><StatusBadge label='Scheduled' variant='info' /></div>
            <div className='mt-9 grid gap-3 sm:grid-cols-2'>
              {[['Lighting', 'Warm · 28%'], ['Climate', 'Night setback'], ['Shades', 'Lowered'], ['Security', 'Perimeter + garden']].map(([label, value]) => <button key={label} className='flex items-center justify-between rounded-[var(--radius-ui)] border border-white/[0.07] bg-black/10 px-4 py-4 text-left transition-[background-color,border-color,transform] duration-[var(--motion-control)] ease-premium hover:border-white/15 hover:bg-white/[0.04] active:scale-[0.99]'><span className='text-sm text-white/55'>{label}</span><span className='text-sm font-medium text-white'>{value}</span></button>)}
            </div>
          </div>
          <div className='rounded-[var(--radius-card)] border border-white/[0.08] bg-white/[0.025] p-6 md:p-8'><p className='text-[10px] font-semibold uppercase tracking-[0.11em] text-white/42'>Steward’s note</p><p className='mt-5 text-xl font-medium leading-8 text-white'>The library fire is prepared. Your 1996 Barolo has been opened and is resting.</p><div className='mt-8 border-t border-white/[0.08] pt-5'><Button variant='link' className='text-[#d5ad69] hover:text-[#e3c58e] dark:text-[#d5ad69]'>Acknowledge note <ArrowRight size={14} /></Button></div></div>
        </section>
      </div>
    </main>
  )
};

export const ExecutiveAdminOverview: Story = {
  render: () => {
    const [section, setSection] = React.useState('overview');
    const nav = [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'inventory', label: 'Inventory', icon: Boxes },
      { id: 'settings', label: 'Settings', icon: Settings2 }
    ];
    const activity = [
      { id: '01', client: 'Eleanor Whitmore', event: 'Private preview confirmed', owner: 'M. Laurent', value: '$28,400', status: 'Confirmed' },
      { id: '02', client: 'Rossi Family Office', event: 'Acquisition awaiting approval', owner: 'A. Chen', value: '$164,000', status: 'Review' },
      { id: '03', client: 'James Ainsworth', event: 'Wardrobe edit delivered', owner: 'S. Okafor', value: '$46,250', status: 'Complete' },
      { id: '04', client: 'Maison Calder', event: 'Allocation request received', owner: 'M. Laurent', value: '$72,800', status: 'New' }
    ];

    return (
      <main className='min-h-screen bg-[#f5f2ec] text-text-primary'>
        <div className='grid min-h-screen lg:grid-cols-[15rem_1fr]'>
          <aside className='flex flex-col border-r border-sand/30 bg-[#173247] px-5 py-7 text-white'>
            <div className='flex items-center gap-3 border-b border-white/10 pb-7'><span className='flex h-9 w-9 items-center justify-center rounded-[9px] border border-white/15 bg-white/[0.06]'><Command size={16} /></span><div><p className='text-sm font-semibold tracking-[0.08em]'>BLEECKER</p><p className='font-secondary text-[10px] text-white/45'>Private administration</p></div></div>
            <nav className='mt-7 space-y-1.5'>{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setSection(id)} className={`flex h-10 w-full items-center gap-3 rounded-[8px] px-3 text-left text-sm transition-[background-color,color,transform] duration-[var(--motion-control)] ease-premium active:scale-[0.99] ${section === id ? 'bg-white/[0.1] text-white' : 'text-white/52 hover:bg-white/[0.055] hover:text-white/85'}`}><Icon size={15} /><span>{label}</span>{section === id ? <span className='ml-auto h-1.5 w-1.5 rounded-full bg-desert' /> : null}</button>)}</nav>
            <div className='mt-auto border-t border-white/10 pt-6'><p className='text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35'>Operating office</p><p className='mt-2 text-sm text-white/75'>Madison Avenue</p><p className='font-secondary mt-1 text-xs text-white/40'>New York · 09:42 EDT</p></div>
          </aside>

          <section className='min-w-0 px-5 py-6 md:px-9 md:py-8'>
            <header className='flex flex-wrap items-center justify-between gap-5 border-b border-sand/30 pb-7'><div><p className='text-[10px] font-semibold uppercase tracking-[0.13em] text-desert'>Saturday, 8 August</p><h1 className='mt-2 text-3xl font-medium tracking-refined'>Good morning, Alexandra.</h1></div><div className='flex items-center gap-2'><div className='relative hidden md:block'><Search className='absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary' size={15} /><Input aria-label='Search administration' className='w-56 pl-9' placeholder='Search clients, orders…' /></div><IconButton aria-label='Notifications'><Bell size={16} /></IconButton><Button>New client <ArrowRight size={14} /></Button></div></header>

            <div className='mt-7 grid gap-4 md:grid-cols-4'>{[
              ['Private clients', 284, '+12 this quarter'], ['Active acquisitions', 48, '$1.28m in progress'], ['Appointments', 19, '7 today'], ['Service standard', 0.984, 'Within target']
            ].map(([label, value, detail], index) => <Card key={label as string} variant={index === 0 ? 'elevated' : 'surface'} className='p-5'><p className='text-[10px] font-semibold uppercase tracking-[0.09em] text-text-secondary'>{label}</p><Metric value={value as number} format={index === 3 ? 'percent' : 'number'} className='mt-3 block text-2xl font-medium' /><p className='font-secondary mt-2 text-[11px] text-text-secondary'>{detail}</p></Card>)}</div>

            <section className='mt-5'><div className='mb-4 flex items-end justify-between'><div><p className='text-[10px] font-semibold uppercase tracking-[0.11em] text-desert'>Client activity</p><h2 className='mt-1.5 text-xl font-medium'>Requiring attention</h2></div><Button variant='link'>View all activity <ArrowRight size={13} /></Button></div><DataTable data={activity} getRowKey={(row) => row.id} columns={[
              { key: 'client', header: 'Client', cell: (row) => <div><p className='font-medium'>{row.client}</p><p className='font-secondary mt-0.5 text-[11px] text-text-secondary'>{row.event}</p></div> },
              { key: 'owner', header: 'Relationship owner' },
              { key: 'value', header: 'Value', align: 'right', className: 'font-medium tabular-nums' },
              { key: 'status', header: 'Status', align: 'right', cell: (row) => <StatusBadge label={row.status} variant={row.status === 'Complete' || row.status === 'Confirmed' ? 'live' : row.status === 'Review' ? 'warning' : 'info'} /> }
            ]} /></section>
          </section>
        </div>
      </main>
    );
  }
};

export const CommerceOperationsDesk: Story = {
  render: () => {
    const [filters, setFilters] = React.useState<Record<string, boolean | string>>({ status: 'attention' });
    const [sort, setSort] = React.useState({ field: 'placed', order: 'desc' as const });
    const [page, setPage] = React.useState(1);
    const orders = [
      { id: 'BL-28491', client: 'Olivia Hart', market: 'New York', placed: '8 Aug · 09:18', total: '$18,650', status: 'Review' },
      { id: 'BL-28488', client: 'The Calder Residence', market: 'London', placed: '8 Aug · 08:46', total: '$42,200', status: 'Ready' },
      { id: 'BL-28479', client: 'Elias Romero', market: 'Madrid', placed: '7 Aug · 17:12', total: '$9,840', status: 'Hold' },
      { id: 'BL-28474', client: 'Amelia Laurent', market: 'Paris', placed: '7 Aug · 15:30', total: '$26,100', status: 'Ready' },
      { id: 'BL-28469', client: 'North & Finch', market: 'Los Angeles', placed: '7 Aug · 14:05', total: '$14,375', status: 'Review' }
    ];
    return (
      <main className='min-h-screen bg-white px-5 py-7 text-text-primary md:px-10 md:py-10'>
        <div className='mx-auto max-w-7xl'>
          <header className='flex flex-col gap-6 border-b border-sand/25 pb-8 md:flex-row md:items-end md:justify-between'><div><div className='flex items-center gap-2'><p className='text-[10px] font-semibold uppercase tracking-[0.13em] text-desert'>Commerce operations</p><StatusBadge label='All systems normal' variant='live' /></div><h1 className='mt-3 text-4xl font-medium tracking-refined'>Orders, composed.</h1><p className='font-secondary mt-2 text-sm text-text-secondary'>One precise view of acquisition, payment, and white-glove delivery.</p></div><div className='flex gap-3'><Button variant='secondary'>Export queue</Button><Button>Create order</Button></div></header>
          <section className='mt-7 grid gap-4 md:grid-cols-3'><StatCard title='Gross volume today' value='$284,620' trend={{ direction: 'up', value: '+18.4%', label: 'vs. prior Saturday' }} /><StatCard title='Orders in review' value='12' trend={{ direction: 'neutral', value: '3', label: 'over two hours' }} /><StatCard title='Dispatch standard' value='96.8%' trend={{ direction: 'up', value: '+1.6%', label: 'this month' }} /></section>
          <section className='mt-8'><div className='mb-4 flex items-end justify-between'><div><p className='text-[10px] font-semibold uppercase tracking-[0.11em] text-text-secondary'>Operational queue</p><h2 className='mt-1.5 text-xl font-medium'>58 open orders</h2></div><p className='font-secondary text-xs text-text-secondary'>Refreshed moments ago</p></div>
            <CollectionFilters currentFilters={filters} currentSort={sort} onFilterChange={setFilters} onSortChange={setSort} defaultExpanded filterOptions={[{ field: 'status', label: 'Status', type: 'select', options: [{ label: 'Needs attention', value: 'attention' }, { label: 'Ready to dispatch', value: 'ready' }, { label: 'On hold', value: 'hold' }] }, { field: 'market', label: 'Market', type: 'select', options: [{ label: 'New York', value: 'nyc' }, { label: 'London', value: 'lon' }, { label: 'Paris', value: 'par' }] }, { field: 'priority', label: 'Priority client', type: 'boolean' }]} sortOptions={[{ field: 'placed', label: 'Recently placed' }, { field: 'total', label: 'Order value' }, { field: 'client', label: 'Client name' }]} />
            <DataTable selectable data={orders} getRowKey={(row) => row.id} sort={sort} onSortChange={setSort} columns={[
              { key: 'id', header: 'Order', cell: (row) => <span className='font-medium tabular-nums'>{row.id}</span> },
              { key: 'client', header: 'Client', cell: (row) => <div><p className='font-medium'>{row.client}</p><p className='font-secondary mt-0.5 text-[11px] text-text-secondary'>{row.market}</p></div> },
              { key: 'placed', header: 'Placed' },
              { key: 'total', header: 'Total', align: 'right', className: 'font-medium tabular-nums' },
              { key: 'status', header: 'Fulfillment', align: 'right', cell: (row) => <StatusBadge label={row.status} variant={row.status === 'Ready' ? 'live' : row.status === 'Hold' ? 'warning' : 'info'} /> }
            ]} />
            <Pagination currentPage={page} totalPages={8} hasPrevPage={page > 1} hasNextPage={page < 8} onPageChange={setPage} />
          </section>
        </div>
      </main>
    );
  }
};

export const GovernanceAndAccess: Story = {
  render: () => {
    const [tab, setTab] = React.useState('access');
    const people = [
      { id: '01', name: 'Alexandra Bleecker', initials: 'AB', role: 'Principal administrator', scope: 'Global', seen: 'Now', status: 'Protected' },
      { id: '02', name: 'Marcus Laurent', initials: 'ML', role: 'Client services director', scope: 'Americas', seen: '8 min ago', status: 'Protected' },
      { id: '03', name: 'Sofia Okafor', initials: 'SO', role: 'Senior advisor', scope: 'New York', seen: '42 min ago', status: 'Protected' },
      { id: '04', name: 'Theo Morgan', initials: 'TM', role: 'Operations partner', scope: 'Fulfillment', seen: 'Yesterday', status: 'Review' }
    ];
    return (
      <main className='min-h-screen bg-[#111c26] px-5 py-8 text-white md:px-10 md:py-11'>
        <div className='mx-auto max-w-7xl'>
          <header className='flex flex-col gap-6 border-b border-white/[0.08] pb-8 md:flex-row md:items-end md:justify-between'><div><div className='flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d6ae6c]'><ShieldCheck size={14} />Administration · Trust center</div><h1 className='mt-3 text-4xl font-medium tracking-refined text-white'>Access, without ambiguity.</h1><p className='font-secondary mt-3 max-w-xl text-sm leading-6 text-white/48'>Identity, authority, and every sensitive action—quietly accounted for.</p></div><Button className='border-[#d6ae6c] bg-[#d6ae6c] text-[#17232d] hover:bg-[#e2c38b]'>Invite administrator</Button></header>
          <Tabs className='mt-7 [&_button]:text-white/55 [&_button:hover]:text-white [&_[aria-selected=true]]:text-white' tabs={[{ id: 'access', label: 'People & access' }, { id: 'roles', label: 'Roles' }, { id: 'audit', label: 'Audit log' }, { id: 'policies', label: 'Policies' }]} activeTab={tab} onChange={setTab} />
          <section className='mt-8 grid gap-4 md:grid-cols-[1.35fr_0.65fr]'>
            <div className='overflow-hidden rounded-[var(--radius-card)] border border-white/[0.09] bg-white/[0.035]'><div className='flex items-center justify-between border-b border-white/[0.08] px-6 py-5'><div><p className='text-[10px] font-semibold uppercase tracking-[0.11em] text-white/38'>Authorized people</p><h2 className='mt-1.5 text-xl font-medium text-white'>Four administrators</h2></div><div className='relative'><Search className='absolute left-3 top-1/2 -translate-y-1/2 text-white/35' size={14} /><Input aria-label='Search administrators' className='w-48 border-white/10 bg-black/10 pl-9 text-white placeholder:text-white/28 dark:bg-black/10' placeholder='Search people' /></div></div><div className='divide-y divide-white/[0.07]'>{people.map((person) => <div key={person.id} className='grid items-center gap-4 px-6 py-4 transition-colors duration-[var(--motion-surface)] ease-premium hover:bg-white/[0.035] sm:grid-cols-[1.3fr_0.75fr_0.55fr_auto]'><div className='flex items-center gap-3'><span className='flex h-9 w-9 items-center justify-center rounded-[9px] border border-white/10 bg-white/[0.06] text-[11px] font-semibold text-white/80'>{person.initials}</span><div><p className='text-sm font-medium text-white'>{person.name}</p><p className='font-secondary mt-0.5 text-[11px] text-white/38'>{person.role}</p></div></div><p className='text-sm text-white/58'>{person.scope}</p><p className='font-secondary text-xs text-white/36'>{person.seen}</p><StatusBadge label={person.status} variant={person.status === 'Protected' ? 'live' : 'warning'} /></div>)}</div></div>
            <div className='space-y-4'><div className='rounded-[var(--radius-card)] border border-emerald-400/15 bg-emerald-400/[0.045] p-6'><div className='flex h-10 w-10 items-center justify-center rounded-[10px] border border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300'><ShieldCheck size={18} /></div><p className='mt-5 text-[10px] font-semibold uppercase tracking-[0.11em] text-emerald-300/70'>Security posture</p><p className='mt-2 text-2xl font-medium text-white'>Strong</p><p className='font-secondary mt-2 text-xs leading-5 text-white/40'>Every administrator is protected by phishing-resistant authentication.</p></div><div className='rounded-[var(--radius-card)] border border-white/[0.08] bg-white/[0.03] p-6'><p className='text-[10px] font-semibold uppercase tracking-[0.11em] text-[#d6ae6c]'>Latest sensitive action</p><p className='mt-4 text-lg font-medium leading-7 text-white'>Export permission granted to Finance · Global</p><p className='font-secondary mt-3 text-xs text-white/38'>Approved by Alexandra Bleecker · 09:18 EDT</p><Button variant='link' className='mt-5 text-[#d6ae6c] hover:text-[#e2c38b] dark:text-[#d6ae6c]'>Review audit trail <ArrowRight size={13} /></Button></div></div>
          </section>
        </div>
      </main>
    );
  }
};
