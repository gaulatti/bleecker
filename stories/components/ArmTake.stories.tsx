import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { ArmTake } from '../../src/components/arm-take';
import { InTheme } from './theme-story';

const meta = {
  component: ArmTake,
  title: 'Components/ArmTake',
  args: { label: 'Hold to take', onTake: () => {} },
  parameters: { layout: 'centered' }
} satisfies Meta<typeof ArmTake>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const [taken, setTaken] = React.useState(0);
  return (
    <div className='space-y-3'>
      <ArmTake label='Hold to take' onTake={() => setTaken((count) => count + 1)} />
      <p role='status' className='text-xs text-text-secondary'>
        {taken === 0 ? 'Hold for 0.8 s, or press twice. One click never takes.' : `Taken ${taken} time${taken === 1 ? '' : 's'}.`}
      </p>
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };
export const Disabled: Story = { args: { disabled: true } };
// An action that is not a take says what the second press does (gaulatti/bleecker#597).
export const ArmedLabel: Story = { args: { label: 'Fade to black', armedLabel: 'Press again to fade' } };
export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Demo /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Demo /></InTheme> };
