import type { Meta, StoryObj } from '@storybook/react-vite';

import { PodcastPlayer } from '../../src/components/podcast-player';

const meta = {
  component: PodcastPlayer,
  title: 'Components/PodcastPlayer',
  args: {
    episodeTitle: 'Harbor Lights',
    showName: 'The Paper Hours',
    coverUrl: '',
    audioUrl: '',
    masterGain: 1,
    show: true
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 540, width: '100%' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof PodcastPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const WithCover: Story = {
  args: { coverUrl: 'https://picsum.photos/seed/bleecker-podcast/800/800' }
};

export const Hidden: Story = {
  args: { show: false }
};
