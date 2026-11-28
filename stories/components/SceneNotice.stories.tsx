import type { Meta, StoryObj } from '@storybook/react-vite';

import { SceneNotice } from '../../src/components/scene-notice';

// Drawn inside the program's 1920x1080 frame, which places it.
const meta = {
  component: SceneNotice,
  title: 'Components/SceneNotice',
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
} satisfies Meta<typeof SceneNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoActiveScene: Story = { args: { message: 'No Active Scene' } };
export const UnknownComponent: Story = { args: { message: 'Unknown component: retired-widget', variant: 'component' } };
