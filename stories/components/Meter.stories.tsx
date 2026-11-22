import type { Meta, StoryObj } from '@storybook/react-vite';

import { Meter } from '../../src/components/meter';
import { InTheme } from './theme-story';

const meta = {
  component: Meter,
  title: 'Components/Meter',
  args: { label: 'Loudness', min: -30, max: 0, unit: 'LUFS', value: -9.8 },
  decorators: [(Story) => <div className='w-72'><Story /></div>],
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

const Meters = () => (
  <div className='w-72 space-y-4'>
    <Meter label='Loudness' unit='LUFS' value={-9.8} min={-30} max={0} />
    <Meter label='True peak' unit='dBTP' value={0.6} min={-12} max={3} warnFrom={0} hold={0.6} />
    <Meter label='Live level' value={0.4} min={0} max={1} peak={0.55} hold={0.8} warnFrom={0.9} />
    <Meter label='No level' value={null} min={0} max={1} />
  </div>
);

export const Default: Story = {};
export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Meters /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Meters /></InTheme> };
