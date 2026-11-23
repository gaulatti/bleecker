import type { Meta, StoryObj } from '@storybook/react-vite';

import { Slideshow } from '../../src/components/slideshow';

const meta = {
  component: Slideshow,
  title: 'Components/Slideshow',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof Slideshow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Slideshow images={[]} />
};

export const Variant: Story = {
  render: () => <Slideshow images={['https://example.test/a.jpg']} />
};
