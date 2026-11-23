import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Fader, type FaderProps } from '../../src/components/fader';
import { InTheme } from './theme-story';

/** Keeps the value as a page would, so the story can be played with. */
function Held({ value: initial, ...props }: Omit<FaderProps, 'onValueChange'>) {
  const [value, setValue] = React.useState(initial);
  return <Fader {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  component: Fader,
  title: 'Components/Fader',
  args: { label: 'Music', unit: 'db', min: -60, max: 10, unity: 0, value: -6, onValueChange: () => {} },
  render: (args) => <Held {...args} />,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A console fader. Arrows step by `step` (0.5 dB or 1 % by default), Shift with an arrow or Page Up / Page Down by `coarseStep`, Home and End go to the limits, and **0** (or a double-click) returns to `unity`. Mute and solo are separate controls.'
      }
    }
  }
} satisfies Meta<typeof Fader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A vertical dB fader with a unity mark. */
export const Vertical: Story = {};

/** A horizontal fader, for a narrow row such as a preset fade. */
export const Horizontal: Story = { args: { label: 'Preset fade', orientation: 'horizontal', min: -30, max: 0, unity: undefined, value: -12, length: '16rem' } };

/** Percent instead of dB. */
export const Percent: Story = { args: { label: 'Cartwall', unit: 'percent', min: 0, max: 100, unity: 80, value: 65 } };

/** With a level meter beside it, on the same scale, including the warning zone and a held peak. */
export const WithMeter: Story = { args: { meter: { value: -18, peak: -9, hold: -4, warnFrom: -6 } } };

/** Disabled while the mixer loads. */
export const Disabled: Story = { args: { disabled: true } };

/** The keyboard path a screen-reader user takes: step, coarse step, back to unity. */
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const fader = within(canvasElement).getByRole('slider', { name: 'Music' });
    fader.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(fader).toHaveAttribute('aria-valuetext', '−5.5 dB');
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
    await expect(fader).toHaveAttribute('aria-valuetext', '−10.5 dB');
    await userEvent.keyboard('0');
    await expect(fader).toHaveAttribute('aria-valuetext', '0.0 dB');
  }
};

const Bank = () => (
  <div className='flex gap-6 rounded-[var(--radius-card)] bg-card p-4'>
    <Held label='Music' unit='db' min={-60} max={10} unity={0} value={-6} meter={{ value: -14, peak: -8, hold: -5, warnFrom: -6 }} />
    <Held label='Cartwall' unit='db' min={-60} max={10} unity={0} value={-25} meter={{ value: null }} />
    <Held label='Stream' unit='percent' min={0} max={100} unity={100} value={40} />
    <Held label='Fade' unit='db' min={-30} max={0} value={-12} orientation='horizontal' length='12rem' />
  </div>
);

export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Bank /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Bank /></InTheme> };
