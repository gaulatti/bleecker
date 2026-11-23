import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChyronHolder } from '../../src/components/chyron-holder';

const meta = {
  component: ChyronHolder,
  title: 'Components/ChyronHolder',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof ChyronHolder>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ChyronHolder text='Fictional chyron' show />
};

export const Variant: Story = {
  render: () => <ChyronHolder text='' show={false} />
};
