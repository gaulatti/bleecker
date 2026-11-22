import type { Meta, StoryObj } from '@storybook/react-vite';

import { OnAirStrip } from '../../src/components/on-air-strip';
import { InTheme } from './theme-story';

const meta = {
  component: OnAirStrip,
  title: 'Components/OnAirStrip',
  args: { state: 'live' },
  parameters: { layout: 'padded' }
} satisfies Meta<typeof OnAirStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

const Strips = () => (
  <div className='space-y-3'>
    <OnAirStrip
      state='live'
      now={{ title: 'Harbor Lights', detail: 'Marisol Vega · Intro played · 1:12 / 3:34' }}
      next={{ title: 'Copper Season', detail: 'The Paper Hours · 4:01' }}
      pills={[
        { tone: 'ok', label: 'Stream verified' },
        { tone: 'ok', label: 'Engine ready' },
        { tone: 'idle', label: 'Monitor off' }
      ]}
      clock='13:14:48'
    />
    <OnAirStrip state='armed' now={{ title: 'Station ID · Morning' }} pills={[{ tone: 'warn', label: 'Stream unverified' }]} clock='13:14:48' />
    <OnAirStrip state='idle' clock='13:14:48' />
  </div>
);

export const Live: Story = { args: { now: { title: 'Harbor Lights', detail: 'Marisol Vega' }, clock: '13:14:48' } };
export const Idle: Story = { args: { state: 'idle' } };
export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Strips /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Strips /></InTheme> };
