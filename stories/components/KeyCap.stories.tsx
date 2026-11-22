import type { Meta, StoryObj } from '@storybook/react-vite';

import { KeyCap } from '../../src/components/key-cap';
import { InTheme } from './theme-story';

const meta = {
  component: KeyCap,
  title: 'Components/KeyCap',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof KeyCap>;

export default meta;
type Story = StoryObj<typeof meta>;

const Caps = () => (
  <div className='flex flex-wrap items-center gap-3'>
    <KeyCap>/</KeyCap>
    <KeyCap>Space</KeyCap>
    <KeyCap keys={['⌘', 'K']} />
    <span className='text-sm'>
      Press <KeyCap>N</KeyCap> to cue, <KeyCap>Space</KeyCap> to take.
    </span>
  </div>
);

export const Single: Story = { render: () => <KeyCap>Esc</KeyCap> };
export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Caps /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Caps /></InTheme> };
