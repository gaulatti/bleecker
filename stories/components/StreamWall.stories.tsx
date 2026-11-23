import type { Meta, StoryObj } from '@storybook/react-vite';

import { StreamWall } from '../../src/components/stream-wall';

const meta = {
  component: StreamWall,
  title: 'Components/StreamWall',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof StreamWall>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <StreamWall urls={[]} title='Fictional wall' />
};

export const Variant: Story = {
  render: () => <StreamWall urls={['https://example.test/a.m3u8']} maxStreams={1} suspended />
};
