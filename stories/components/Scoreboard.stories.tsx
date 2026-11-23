import type { Meta, StoryObj } from '@storybook/react-vite';

import { Scoreboard } from '../../src/components/scoreboard';

const meta = {
  component: Scoreboard,
  title: 'Components/Scoreboard',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof Scoreboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Halftime: Story = { args: { title: 'FINAL', homeTeam: 'Lions', awayTeam: 'Bears', homeScore: 2, awayScore: 1, period: '2ND', clock: '45:00', status: 'HT' } };
