import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Check, Clock3, MapPin } from 'lucide-react';

import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { Eyebrow } from '../../src/components/eyebrow';
import { Separator } from '../../src/components/separator';
import { DetailLayout } from '../../src/layout/detail-layout';
import { PageFrame } from '../../src/layout/page-frame';

const meta = {
  component: DetailLayout,
  title: 'Layout/DetailLayout',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { children: null }
} satisfies Meta<typeof DetailLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrivateViewing: Story = {
  render: () => (
    <div className='min-h-screen bg-background'>
      <PageFrame as='main' width='wide' verticalSpacing='spacious'>
        <DetailLayout
          ratio='primary'
          side='end'
          sideRailLabel='Private viewing details'
          sideRail={
            <Card variant='elevated' padding='lg' className='space-y-7'>
              <div className='space-y-2'>
                <Eyebrow>Private viewing</Eyebrow>
                <p className='text-3xl font-semibold tracking-refined'>$4,800</p>
                <p className='font-secondary text-sm leading-6 text-text-secondary'>Includes insured white-glove delivery within the continental US.</p>
              </div>
              <Separator />
              <dl className='font-secondary space-y-4 text-sm'>
                <div className='flex items-center justify-between gap-5'><dt className='text-text-secondary'>Edition</dt><dd>07 / 24</dd></div>
                <div className='flex items-center justify-between gap-5'><dt className='text-text-secondary'>Material</dt><dd>Cast bronze</dd></div>
                <div className='flex items-center justify-between gap-5'><dt className='text-text-secondary'>Lead time</dt><dd>2–3 weeks</dd></div>
              </dl>
              <Button fullWidth size='lg'>Request a viewing <ArrowRight className='size-4' aria-hidden='true' /></Button>
              <p className='font-secondary flex items-center justify-center gap-2 text-xs text-text-secondary'><Check className='size-3.5 text-sea' aria-hidden='true' /> Certificate of authenticity</p>
            </Card>
          }
        >
          <article>
            <header className='mb-10 max-w-3xl space-y-5'>
              <Eyebrow>Atelier collection · 2026</Eyebrow>
              <h1 className='text-4xl font-semibold tracking-refined sm:text-6xl'>Arc No. 07</h1>
              <p className='font-secondary text-lg leading-8 text-text-secondary'>A study in balance, cast in bronze and finished by hand in our Brooklyn atelier.</p>
            </header>

            <div className='relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-light-sand/70 dark:bg-white/[0.04]'>
              <div className='absolute left-1/2 top-[56%] h-[62%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-t-full bg-accent-bronze shadow-[var(--shadow-raised)]' />
              <div className='absolute bottom-[13%] left-[17%] right-[17%] h-px bg-deep-sea/15 dark:bg-white/15' />
              <span className='absolute bottom-5 right-5 font-secondary text-[11px] text-text-secondary'>42 × 31 × 18 cm</span>
            </div>

            <div className='grid gap-8 py-10 sm:grid-cols-3 sm:py-14'>
              <div className='flex gap-3'><MapPin className='mt-0.5 size-4 shrink-0 text-desert' aria-hidden='true' /><div><p className='text-sm font-medium'>Made in Brooklyn</p><p className='font-secondary mt-1 text-xs leading-5 text-text-secondary'>Formed and finished locally</p></div></div>
              <div className='flex gap-3'><Clock3 className='mt-0.5 size-4 shrink-0 text-desert' aria-hidden='true' /><div><p className='text-sm font-medium'>Twenty-two hours</p><p className='font-secondary mt-1 text-xs leading-5 text-text-secondary'>Handwork in every edition</p></div></div>
              <div className='flex gap-3'><Check className='mt-0.5 size-4 shrink-0 text-desert' aria-hidden='true' /><div><p className='text-sm font-medium'>Signed and numbered</p><p className='font-secondary mt-1 text-xs leading-5 text-text-secondary'>Recorded provenance</p></div></div>
            </div>
          </article>
        </DetailLayout>
      </PageFrame>
    </div>
  )
};

export const EditorialWithContents: Story = {
  render: () => (
    <div className='min-h-screen bg-light-sand/25 dark:bg-background'>
      <PageFrame as='main' width='content' verticalSpacing='spacious'>
        <DetailLayout
          ratio='balanced'
          side='start'
          sideRailLabel='Article contents'
          sideRail={
            <div className='border-t border-sand/40 pt-6'>
              <Eyebrow className='mb-5' tone='muted'>In this essay</Eyebrow>
              <nav aria-label='Article sections' className='flex flex-col'>
                {['01 — Material honesty', '02 — The value of pause', '03 — A lasting system'].map((item, index) => (
                  <a key={item} href={`#section-${index + 1}`} className='border-b border-sand/25 py-4 text-sm text-text-secondary transition-colors hover:text-sea'>
                    {item}
                  </a>
                ))}
              </nav>
              <p className='font-secondary mt-6 text-xs leading-5 text-text-secondary'>Eight minute read<br />Design notes · No. 14</p>
            </div>
          }
        >
          <article className='max-w-2xl'>
            <header className='space-y-6 border-t border-accent-gold pt-6'>
              <Eyebrow>Design intelligence</Eyebrow>
              <h1 className='text-4xl font-semibold leading-[1.08] tracking-refined sm:text-5xl'>Restraint is a feature, not an absence</h1>
              <p className='font-secondary text-lg leading-8 text-text-secondary'>A balanced editorial layout for guides, thought leadership, and documentation with a calm navigational rail.</p>
            </header>

            <div className='font-secondary mt-12 space-y-10 text-[17px] leading-8'>
              <section id='section-1' className='space-y-4'>
                <h2 className='font-[family-name:var(--font-display)] text-2xl'>Material honesty</h2>
                <p>Clean interfaces reveal their structure. Borders are hairlines, shadows describe elevation, and color appears only where it carries meaning.</p>
              </section>
              <section id='section-2' className='space-y-4'>
                <h2 className='font-[family-name:var(--font-display)] text-2xl'>The value of pause</h2>
                <p>Generous rhythm slows the eye just enough to clarify hierarchy. The result feels composed because each block has room to hold its own weight.</p>
              </section>
              <section id='section-3' className='space-y-4'>
                <h2 className='font-[family-name:var(--font-display)] text-2xl'>A lasting system</h2>
                <p>When proportions are encoded as reusable primitives, refinement becomes repeatable rather than dependent on one-off art direction.</p>
              </section>
            </div>
          </article>
        </DetailLayout>
      </PageFrame>
    </div>
  )
};
