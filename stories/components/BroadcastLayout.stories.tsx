import type { Meta, StoryObj } from '@storybook/react-vite';

import { BroadcastLayout } from '../../src/components/broadcast-layout';

const meta = {
  component: BroadcastLayout,
  title: 'Components/BroadcastLayout',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof BroadcastLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { headerTitle: 'NEWS', headerDate: '01/02/2027', hashtag: '#live', url: 'example.test', clock: <div style={{ position: 'absolute', top: 70, left: 38, color: 'white' }}>12:00</div> } };
export const WithoutChyron: Story = { args: { headerDate: '01/02/2027', showLiveIndicator: false } };
