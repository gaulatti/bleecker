import type { Meta, StoryObj } from '@storybook/react-vite';

import { Eyebrow } from '../../src/components/eyebrow';

const meta = {
  component: Eyebrow,
  title: 'Components/Eyebrow',
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accent: Story = {
  args: {
    children: 'Private client services',
    tone: 'accent'
  }
};

export const WithRule: Story = {
  args: {
    children: 'The autumn edit',
    rule: true,
    tone: 'muted'
  }
};

export const Inverse: Story = {
  decorators: [
    (Story) => (
      <div className='bg-deep-sea px-8 py-6'>
        <Story />
      </div>
    )
  ],
  args: {
    children: 'Residence secure',
    tone: 'inverse'
  }
};
