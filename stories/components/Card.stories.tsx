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
