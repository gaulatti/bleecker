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
    init: 'C',
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    content: 'We are deploying the next generation of cloud infrastructure. Experience it today.',
    relevance: 8.4,
    sourceUrl: 'https://cloudnode.example.com/news/deployment',
    language: 'en',
    categories: ['technology', 'world']
  }
} satisfies Meta<typeof FeedItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OlderThanTwelveHours: Story = {
  args: {
    author: 'Jamie',
    postedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    init: 'J',
    content: 'Continuous scrolling feeds need strict flex constraints to respect the viewport height.',
    relevance: 6.7,
    sourceUrl: 'https://design.example.com/notes/scrolling-feeds',
    language: 'en',
    categories: ['design']
  }
};

export const MonitorColumnStyle: Story = {
  args: {
    author: 'USGS Feed',
    postedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    init: 'U',
    content: 'Magnitude 5.1 earthquake detected near San Diego. Depth 12km.',
    relevance: 8.2,
    sourceUrl: 'https://earthquake.usgs.gov/earthquakes/eventpage/ci12345678',
    language: 'en',
    categories: ['world', 'weather']
  }
};
