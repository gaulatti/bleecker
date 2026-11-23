import type { Meta, StoryObj } from '@storybook/react-vite';

import { SceneTransitionOverlay } from '../../src/components/scene-transition-overlay';

const meta = {
  component: SceneTransitionOverlay,
  title: 'Components/SceneTransitionOverlay',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof SceneTransitionOverlay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CrescendoPrism: Story = { args: { transition: { id: 'crescendo-prism', durationMs: 1450 } } };
export const HitParade: Story = { args: { transition: { id: 'hit-parade', durationMs: 1450 }, brandMark: <svg aria-label='Brand' width='340' height='120' /> } };
