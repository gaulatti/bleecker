import type { Meta, StoryObj } from '@storybook/react-vite';

import { Ticker } from '../../src/components/ticker';

const meta = {
  component: Ticker,
  title: 'Components/Ticker',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof Ticker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Ticker hashtag='#fictional' url='https://example.test' />
};

export const Variant: Story = {
  render: () => <Ticker />
};
