import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatePill, type StatePillTone } from '../../src/components/state-pill';
import { InTheme } from './theme-story';

const meta = {
  component: StatePill,
  title: 'Components/StatePill',
  args: { label: 'Measured', tone: 'ok' },
  argTypes: { tone: { control: 'select', options: ['live', 'ok', 'warn', 'bad', 'arm', 'info', 'idle'] } },
  parameters: { layout: 'centered' }
} satisfies Meta<typeof StatePill>;

export default meta;
type Story = StoryObj<typeof meta>;

const TONES: Array<[StatePillTone, string]> = [
  ['live', 'On air'],
  ['ok', 'Measured'],
  ['warn', 'Measuring'],
  ['bad', 'Failed'],
  ['arm', 'Armed'],
  ['info', 'Preview'],
  ['idle', 'Not analysed']
];

const Tones = () => (
  <div className='flex flex-wrap gap-2'>
    {TONES.map(([tone, label]) => (
      <StatePill key={tone} tone={tone} label={label} pulse={tone === 'live'} />
    ))}
  </div>
);

export const Default: Story = {};
export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Tones /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Tones /></InTheme> };
