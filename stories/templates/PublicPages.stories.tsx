import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, ArrowUpRight, KeyRound, MapPin, Sparkles } from 'lucide-react';

import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { Eyebrow } from '../../src/components/eyebrow';
import { AppShell } from '../../src/layout/app-shell';
import { Footer } from '../../src/layout/footer';
import { Header } from '../../src/layout/header';
import { PageFrame } from '../../src/layout/page-frame';

const logoSrc = new URL('../../src/assets/logo.svg', import.meta.url).href;
const brand = { href: '#home', logoAlt: 'Bleecker', logoSrc, name: 'bleecker' };

const meta = {
  title: 'Templates/Public Pages',
  parameters: { layout: 'fullscreen' }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function PublicFooter() {
  return (
    <Footer
      bottomLeft='© 2026 Bleecker Private Office'
      brand={{ ...brand, description: 'A private office for considered objects, residences, and journeys.' }}
      sections={[
        { title: 'Office', items: [{ href: '#services', label: 'Services' }, { href: '#journal', label: 'Journal' }, { href: '#residences', label: 'Residences' }] },
        { title: 'Private', items: [{ href: '#access', label: 'Client access' }, { href: '#contact', label: 'Request an introduction' }, { href: '#privacy', label: 'Privacy' }] }
      ]}
      showBottomAccent={false}
    />
  );
}

export const PrivateHouseLanding: Story = {
  render: () => (
    <AppShell
      offsetHeader={false}
      className='bg-[#f7f3ec]'
      header={
        <Header
          position='static'
          className='border-[#8d765d]/15 bg-[#f7f3ec]/95'
          brand={brand}
          navigation={[{ href: '#services', label: 'Services' }, { href: '#residences', label: 'Residences' }, { href: '#journal', label: 'Journal' }]}
          actions={<Button variant='outline'>Request an introduction</Button>}
        />
      }
      footer={<PublicFooter />}
    >
      <section id='home' className='bg-[#f7f3ec] text-text-primary'>
        <PageFrame width='wide' verticalSpacing='none' className='pb-14 pt-8 lg:pb-20'>
        <div className='grid overflow-hidden border-y border-[#8d765d]/20 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)]'>
          <div className='flex min-h-[34rem] flex-col justify-between py-12 pr-0 lg:min-h-[42rem] lg:border-r lg:border-[#8d765d]/20 lg:py-16 lg:pr-16'>
            <Eyebrow rule>Private office · New York & Paris</Eyebrow>
            <div className='my-16'>
              <h1 className='max-w-3xl text-balance text-5xl font-medium leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl'>A more considered way to live well.</h1>
              <p className='font-secondary mt-7 max-w-xl text-pretty text-[15px] leading-7 text-text-secondary'>One trusted office for the objects, places, and journeys that deserve time, judgment, and absolute discretion.</p>
              <div className='mt-10 flex flex-wrap gap-3'><Button size='lg'>Begin a conversation <ArrowRight size={15} /></Button><Button size='lg' variant='ghost'>How the office works</Button></div>
            </div>
            <div className='grid max-w-2xl grid-cols-3 border-t border-[#8d765d]/20 pt-6'>
              {[
                ['One advisor', 'Across every request'],
                ['Three cities', 'New York · Paris · Madrid'],
                ['Always private', 'By introduction only']
              ].map(([value, label]) => <div key={value} className='border-r border-[#8d765d]/20 px-4 first:pl-0 last:border-r-0'><p className='text-sm font-medium'>{value}</p><p className='font-secondary mt-1 text-[11px] leading-4 text-text-secondary'>{label}</p></div>)}
            </div>
          </div>

          <div className='relative min-h-[30rem] overflow-hidden bg-[#294457] p-8 text-white sm:p-12 lg:min-h-[42rem]'>
            <div aria-hidden='true' className='absolute -right-24 -top-20 h-96 w-96 rounded-full border border-white/10' />
            <div aria-hidden='true' className='absolute right-10 top-20 h-64 w-64 rounded-full border border-[#d6b47b]/35' />
            <div aria-hidden='true' className='absolute bottom-24 left-[-4rem] h-52 w-[85%] rotate-[-8deg] bg-[#d9c5a6]/15 blur-2xl' />
            <div className='relative flex h-full min-h-[26rem] flex-col justify-between lg:min-h-[36rem]'>
              <div className='flex items-start justify-between'><Eyebrow tone='inverse'>This month at the office</Eyebrow><Sparkles size={18} className='text-[#d9bd8a]' strokeWidth={1.5} /></div>
              <div>
                <p className='max-w-sm text-balance text-3xl font-medium leading-[1.15] text-white'>The house in Comporta is ready for its first summer.</p>
                <p className='font-secondary mt-4 max-w-sm text-sm leading-6 text-white/65'>Architecture, art, and every arrival detail—composed by one team.</p>
                <Button variant='link' className='mt-7 text-[#e1c494] hover:text-white dark:text-[#e1c494]'>Read the residence story <ArrowUpRight size={14} /></Button>
              </div>
            </div>
          </div>
        </div>
        </PageFrame>
      </section>

      <section id='services' className='bg-white'>
        <PageFrame width='wide' verticalSpacing='spacious'>
          <div className='grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20'>
            <div><Eyebrow>What we hold together</Eyebrow><h2 className='mt-4 text-3xl font-medium tracking-refined'>Fewer relationships.<br />Deeper understanding.</h2></div>
            <div className='grid gap-px overflow-hidden border border-sand/30 bg-sand/30 md:grid-cols-2'>
              {[
                ['01', 'Residences', 'From a first brief to the way the house is prepared before every arrival.'],
                ['02', 'Objects', 'Sourcing, acquisition, care, and provenance for pieces worth keeping.'],
                ['03', 'Journeys', 'The complete itinerary, held by people who know how you prefer to move.'],
                ['04', 'Private matters', 'Quiet coordination for the requests that do not fit neatly into a category.']
              ].map(([number, title, copy]) => (
                <article key={number} className='bg-white p-7 sm:p-8'><p className='font-secondary text-[11px] text-text-secondary'>{number}</p><h3 className='mt-8 text-xl font-medium'>{title}</h3><p className='font-secondary mt-3 text-sm leading-6 text-text-secondary'>{copy}</p><Button variant='link' className='mt-7'>Explore <ArrowRight size={13} /></Button></article>
              ))}
            </div>
          </div>
        </PageFrame>
      </section>
    </AppShell>
  )
};

const journalEntries = [
  { issue: 'No. 08', category: 'Residences', title: 'The quiet intelligence of a room that changes with the day', tone: 'bg-[#c7b49b]' },
  { issue: 'No. 07', category: 'Objects', title: 'On buying once, and caring for what remains', tone: 'bg-[#7b6759]' },
  { issue: 'No. 06', category: 'Journeys', title: 'Forty-eight unhurried hours on the northern coast', tone: 'bg-[#556d72]' }
];

export const EditorialJournalIndex: Story = {
  render: () => (
    <AppShell
      offsetHeader={false}
      header={<Header position='static' brand={brand} navigation={[{ href: '#latest', label: 'Latest' }, { href: '#residences', label: 'Residences' }, { href: '#objects', label: 'Objects' }]} actions={<Button variant='ghost'>Client access <KeyRound size={14} /></Button>} />}
    >
      <main className='bg-white'>
        <PageFrame width='wide' verticalSpacing='comfortable'>
          <header className='grid gap-10 border-b border-sand/30 pb-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-end lg:pb-16'>
            <div><Eyebrow>The Bleecker journal</Eyebrow><p className='font-secondary mt-5 max-w-xs text-sm leading-6 text-text-secondary'>Notes on material, place, ritual, and the value of considered decisions.</p></div>
            <h1 className='max-w-4xl text-balance text-5xl font-medium leading-[1.02] tracking-[-0.035em] sm:text-6xl'>Ideas for living with greater intention.</h1>
          </header>

          <section id='latest' className='mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-12'>
            <article>
              <div className='relative aspect-[1.5] overflow-hidden bg-[#213c4e] p-8 text-white sm:p-10'>
                <div aria-hidden='true' className='absolute -right-14 top-12 h-72 w-72 rounded-full border border-white/10' />
                <div aria-hidden='true' className='absolute bottom-[-6rem] left-[12%] h-72 w-[80%] rotate-[-5deg] bg-[#d1b789]/20 blur-xl' />
                <div className='relative flex h-full flex-col justify-between'><Eyebrow tone='inverse'>Featured essay · No. 09</Eyebrow><div><p className='max-w-2xl text-balance text-3xl font-medium leading-tight text-white sm:text-4xl'>Why hospitality begins before a guest arrives.</p><div className='mt-5 flex items-center gap-2 text-sm text-white/65'><MapPin size={14} /><span className='font-secondary'>Paris · Rue du Bac</span></div></div></div>
              </div>
              <div className='mt-6 flex items-start justify-between gap-8'><p className='font-secondary max-w-xl text-sm leading-6 text-text-secondary'>A study of anticipation, memory, and the small decisions that make a place feel deeply personal.</p><Button variant='link'>Read the essay <ArrowRight size={13} /></Button></div>
            </article>

            <div className='divide-y divide-sand/30 border-y border-sand/30'>
              {journalEntries.map((entry) => (
                <article key={entry.issue} className='grid grid-cols-[5rem_1fr] gap-5 py-6 first:pt-0 lg:grid-cols-[4.5rem_1fr] lg:first:pt-6'>
                  <div className={`aspect-[0.8] ${entry.tone}`} />
                  <div className='flex flex-col justify-between'><div><p className='font-secondary text-[11px] text-text-secondary'>{entry.issue} · {entry.category}</p><h2 className='mt-2 text-lg font-medium leading-6'>{entry.title}</h2></div><Button variant='link' className='mt-4 self-start'>Read <ArrowUpRight size={12} /></Button></div>
                </article>
              ))}
            </div>
          </section>
        </PageFrame>
      </main>
    </AppShell>
  )
};
