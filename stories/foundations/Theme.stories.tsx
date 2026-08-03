import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card } from '../../src/components/card';

const meta = {
  title: 'Foundations/Theme',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const swatches = [
  { name: 'Light Sand', className: 'bg-light-sand text-text-primary border-sand/10' },
  { name: 'Sand', className: 'bg-sand text-text-primary border-sand/10' },
  { name: 'Sea', className: 'bg-sea text-white border-transparent' },
  { name: 'Desert', className: 'bg-desert text-white border-transparent' },
  { name: 'Terracotta', className: 'bg-terracotta text-white border-transparent' },
  { name: 'Deep Sea', className: 'bg-deep-sea text-white border-transparent' }
];

export const Palette: Story = {
  render: () => (
    <div className='min-h-screen bg-light-sand p-8 dark:bg-deep-sea'>
      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {swatches.map((swatch) => (
          <Card key={swatch.name} className='space-y-4'>
            <div className={`h-32 rounded-[20px] border ${swatch.className}`}></div>
            <div>
              <h3 className='text-xl'>{swatch.name}</h3>
              <p className='text-sm text-text-secondary dark:text-text-secondary'>Core Bleecker surface color</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
};

export const Typography: Story = {
  render: () => (
    <div className='mx-auto max-w-4xl space-y-10 bg-background p-8 text-foreground'>
      <div>
        <p className='text-xs uppercase tracking-elegant text-desert'>Eyebrow / Libre Franklin</p>
        <h1 className='mt-2 font-header text-5xl'>Display heading / Encode Sans</h1>
      </div>
      <div className='space-y-4'>
        <h2 className='font-header text-3xl'>Section heading</h2>
        <p className='max-w-2xl text-base leading-relaxed text-text-secondary'>Body copy uses a readable rhythm for product interfaces, documentation, and content-dense dashboard surfaces.</p>
        <p className='text-sm text-text-secondary'>Supporting text at the compact interface size.</p>
        <p className='text-xs uppercase tracking-elegant text-text-secondary'>Label / metadata</p>
      </div>
    </div>
  )
};
