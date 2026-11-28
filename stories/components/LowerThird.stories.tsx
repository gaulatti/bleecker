import type { Meta, StoryObj } from '@storybook/react-vite';

import { LowerThird } from '../../src/components/lower-third';

// Drawn inside the program's 1920x1080 frame, which places it.
const meta = {
  component: LowerThird,
  title: 'Components/LowerThird',
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
} satisfies Meta<typeof LowerThird>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
export const WithText: Story = { args: { text: 'Maria Rossi, host' } };
