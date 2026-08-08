import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { SectionHeader } from '../../src/components/section-header';

const meta = {
  title: 'Components/Card',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Editorial: Story = {
  render: () => (
    <div className='min-h-screen bg-light-sand p-8 dark:bg-deep-sea'>
      <Card className='max-w-xl space-y-6'>
        <SectionHeader eyebrow='System' title='Shared product shell' description='A soft container style for dashboards, onboarding surfaces, and overview pages.' />
        <div className='flex gap-3'>
          <Button>Open workspace</Button>
          <Button variant='secondary'>Review docs</Button>
        </div>
      </Card>
    </div>
  )
};

export const ContentDensity: Story = {
  render: () => (
    <div className='grid max-w-4xl gap-4 md:grid-cols-3'>
      <Card className='p-3'>Compact card</Card>
      <Card>Default card</Card>
      <Card className='space-y-4 p-8'>Spacious card with room for richer content.</Card>
    </div>
  )
};

export const SurfaceHierarchy: Story = {
  render: () => (
    <div className='grid max-w-5xl gap-5 bg-light-sand/25 p-8 md:grid-cols-2 dark:bg-deep-sea'>
      {(['surface', 'outlined', 'elevated', 'subtle'] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <p className='text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>{variant}</p>
          <h3 className='mt-3 text-lg font-medium capitalize'>{variant} surface</h3>
          <p className='font-secondary mt-2 text-sm leading-6 text-text-secondary'>A distinct level of hierarchy without introducing a new color or decorative effect.</p>
        </Card>
      ))}
    </div>
  )
};
