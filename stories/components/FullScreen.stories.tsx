import type { Meta, StoryObj } from '@storybook/react-vite';

import { FullScreen } from '../../src/components/full-screen';

// Drawn inside the program's 1920x1080 frame, which places it.
const meta = {
  component: FullScreen,
  title: 'Components/FullScreen',
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
} satisfies Meta<typeof FullScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithText: Story = { args: { text: 'Back after the break' } };
