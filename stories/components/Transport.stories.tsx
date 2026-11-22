import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Transport } from '../../src/components/transport';
import { InTheme } from './theme-story';

const meta = {
  component: Transport,
  title: 'Components/Transport',
  args: { duration: 214, onToggle: () => {}, playing: false, position: 72, subtitle: 'Song · -9.8 LUFS', title: 'Harbor Lights' },
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Transport>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ duration = 214 }: { duration?: number | null }) {
  const [position, setPosition] = React.useState(72);
  const [playing, setPlaying] = React.useState(false);
  return (
    <div className='w-[720px]'>
      <Transport
        title='Harbor Lights'
        subtitle='Song · -9.8 LUFS'
        duration={duration}
        position={position}
        playing={playing}
        cues={duration === null ? [] : [{ at: 0.42, label: 'In 0:00.4' }, { at: 209.8, label: 'Out 3:29.8' }]}
        onToggle={() => setPlaying((value) => !value)}
        onSeek={setPosition}
        onPrev={() => setPosition(0)}
        onNext={() => setPosition(0)}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };
export const NoLength: Story = { render: () => <Demo duration={null} /> };
export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Demo /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Demo /></InTheme> };
