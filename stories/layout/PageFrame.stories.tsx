import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowUpRight, MapPin } from 'lucide-react';

import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { Eyebrow } from '../../src/components/eyebrow';
import { Separator } from '../../src/components/separator';
import { PageFrame } from '../../src/layout/page-frame';

const meta = {
  component: PageFrame,
  title: 'Layout/PageFrame',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    as: 'main',
    children: null,
    gutter: 'comfortable',
    verticalSpacing: 'spacious',
    width: 'content'
  }
} satisfies Meta<typeof PageFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EditorialFeature: Story = {
  args: { width: 'reading' },
  render: (args) => (
    <div className='min-h-screen bg-background'>
      <PageFrame {...args}>
        <article>
          <div className='mb-12 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary'>
            <span>Journal</span>
            <span className='text-sand' aria-hidden='true'>/</span>
            <span>Volume 07</span>
          </div>

          <header className='space-y-7'>
            <Eyebrow>Material studies</Eyebrow>
            <h1 className='max-w-2xl text-4xl font-semibold leading-[1.05] tracking-refined text-text-primary sm:text-6xl'>
              The quiet architecture of a lasting object
            </h1>
            <p className='font-secondary max-w-2xl text-lg leading-8 text-text-secondary'>
              A measured editorial template for long-form launches, studio journals, and stories that deserve room to unfold.
            </p>
          </header>

          <div className='relative my-12 aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-deep-sea sm:my-16 sm:aspect-[16/10]'>
            <div className='absolute inset-x-[10%] bottom-0 h-[72%] rounded-t-full border border-white/20 bg-sand/80' />
            <div className='absolute left-[18%] top-[18%] size-20 rounded-full border border-white/35 bg-desert sm:size-28' />
            <p className='absolute bottom-5 left-5 font-secondary text-xs text-white/70'>Form No. 12 · Limestone and bronze</p>
          </div>

          <div className='grid gap-8 sm:grid-cols-[9rem_1fr] sm:gap-12'>
            <div className='space-y-2 text-xs text-text-secondary'>
              <p className='font-semibold uppercase tracking-[0.12em] text-text-primary'>Field notes</p>
              <p className='font-secondary leading-5'>Florence, Italy<br />Spring 2026</p>
            </div>
            <div className='font-secondary space-y-6 text-[17px] leading-8 text-text-primary'>
              <p>
                Luxury rarely announces itself. It is found in the satisfying weight of a handle, a seam aligned by hand, and the pause created by generous negative space.
              </p>
              <p>
                This composition preserves that restraint: a narrow reading measure, one confident image, and a hierarchy built from proportion instead of decoration.
              </p>
              <blockquote className='border-l border-accent-gold pl-6 font-[family-name:var(--font-display)] text-2xl leading-9 tracking-refined'>
                “Precision becomes warmth when every decision has a reason.”
              </blockquote>
            </div>
          </div>
        </article>
      </PageFrame>
    </div>
  )
};

const collection = [
  { code: '01', title: 'Travertine Study', detail: 'Edition of 24', color: 'bg-sand' },
  { code: '02', title: 'Oxblood Vessel', detail: 'Edition of 12', color: 'bg-accent-oxblood' },
  { code: '03', title: 'Deep Sea Form', detail: 'Open edition', color: 'bg-deep-sea' }
];

export const CuratedCollection: Story = {
  args: { width: 'wide', verticalSpacing: 'comfortable' },
  render: (args) => (
    <div className='min-h-screen bg-light-sand/35 dark:bg-background'>
      <PageFrame {...args}>
        <header className='flex flex-col gap-8 border-b border-sand/30 pb-10 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-4'>
            <Eyebrow>The permanent collection</Eyebrow>
            <h1 className='text-4xl font-semibold tracking-refined sm:text-5xl'>Objects with provenance</h1>
            <p className='font-secondary max-w-xl text-base leading-7 text-text-secondary'>A wide gallery template for collections, portfolios, and considered commerce.</p>
          </div>
          <Button variant='outline'>View catalogue <ArrowUpRight className='size-4' aria-hidden='true' /></Button>
        </header>

        <div className='grid gap-6 py-10 md:grid-cols-3 lg:gap-8 lg:py-14'>
          {collection.map((item, index) => (
            <Card key={item.code} padding='none' className='group bg-background'>
              <div className='relative aspect-[4/5] overflow-hidden bg-light-sand/70 dark:bg-white/[0.03]'>
                <div className={`absolute left-1/2 top-1/2 h-[54%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-t-full ${item.color} opacity-90 transition-transform duration-600 ease-premium group-hover:-translate-y-[52%]`} />
                <span className='absolute left-5 top-5 text-[10px] font-semibold tracking-[0.14em] text-text-secondary'>BLEECKER / {item.code}</span>
              </div>
              <div className='space-y-5 p-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <h2 className='text-xl font-medium'>{item.title}</h2>
                    <p className='font-secondary mt-1 text-sm text-text-secondary'>{item.detail}</p>
                  </div>
                  <span className='font-secondary text-xs text-text-secondary'>0{index + 1}</span>
                </div>
                <Separator />
                <div className='flex items-center justify-between text-xs text-text-secondary'>
                  <span className='inline-flex items-center gap-1.5'><MapPin className='size-3.5' aria-hidden='true' /> New York</span>
                  <a href='#' className='font-medium text-sea hover:underline dark:text-accent-blue'>Details</a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageFrame>
    </div>
  )
};
