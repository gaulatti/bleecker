import type { Meta, StoryObj } from '@storybook/react-vite';

import { VideoStream } from '../../src/components/video-stream';

const meta = {
  component: VideoStream,
  title: 'Components/VideoStream',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof VideoStream>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <VideoStream sourceUrl='https://example.test/stream.m3u8' />
};

export const Variant: Story = {
  render: () => <VideoStream sourceUrl='https://example.test/stream.m3u8' loop autoPlay />
};
