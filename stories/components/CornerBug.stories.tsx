import type { Meta, StoryObj } from '@storybook/react-vite';

import { CornerBug } from '../../src/components/corner-bug';

// Drawn inside the program's 1920x1080 frame, which places it.
const meta = {
  component: CornerBug,
  title: 'Components/CornerBug',
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
} satisfies Meta<typeof CornerBug>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithText: Story = { args: { text: 'REPLAY' } };
