import type { Meta, StoryObj } from '@storybook/react-vite';

import { FeedItem } from '../../src/components/feed-item';

const meta = {
  title: 'Components/FeedItem',
  component: FeedItem,
  parameters: {
    layout: 'padded'
  },
  args: {
    author: 'CloudNode',
    handle: '@cloudnode',
    time: '2m',
    init: 'C',
    verified: true,
    content: 'We are deploying the next generation of cloud infrastructure. Experience it today.'
  }
} satisfies Meta<typeof FeedItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Unverified: Story = {
  args: {
    author: 'Jamie',
    handle: '@jamiedesign',
    time: '22m',
    init: 'J',
    verified: false,
    content: 'Continuous scrolling feeds need strict flex constraints to respect the viewport height.'
  }
};
