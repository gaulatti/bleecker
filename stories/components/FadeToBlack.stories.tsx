import type { Meta, StoryObj } from '@storybook/react-vite';

import { FadeToBlack } from '../../src/components/fade-to-black';

// Drawn inside the program's 1920x1080 frame, which places it.
const meta = {
  component: FadeToBlack,
  title: 'Components/FadeToBlack',
  parameters: {
    layout: 'padded'
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '1920px', height: '1080px', overflow: 'hidden', background: '#334155' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof FadeToBlack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { active: true, animate: false } };
export const Inactive: Story = { args: { active: false, animate: false } };
export const Fading: Story = { args: { active: true, animate: true } };
