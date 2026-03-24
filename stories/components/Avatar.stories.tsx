import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar, AvatarGroup } from '../../src/components/avatar';

const meta = {
  component: Avatar,
  title: 'Components/Avatar',
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=3',
    alt: 'Jane Doe',
    size: 'md'
  }
};

export const WithFallback: Story = {
  args: {
    fallback: 'Jane Doe',
    size: 'md'
  }
};

export const NoContent: Story = {
  args: {
    size: 'md'
  }
};

export const Sizes: Story = {
  render: () => (
    <div className='flex items-end gap-4'>
      <Avatar size='xs' fallback='XS' />
      <Avatar size='sm' fallback='SM' />
      <Avatar size='md' fallback='MD' />
      <Avatar size='lg' fallback='LG' />
      <Avatar size='xl' fallback='XL' />
    </div>
  )
};

export const Group: Story = {
  render: () => (
    <AvatarGroup
      size='md'
      avatars={[
        { src: 'https://i.pravatar.cc/150?img=1', alt: 'Alice' },
        { src: 'https://i.pravatar.cc/150?img=2', alt: 'Bob' },
        { fallback: 'Charlie D' },
        { fallback: 'Eve F' },
        { fallback: 'George H' },
        { fallback: 'Iris J' }
      ]}
      max={4}
    />
  )
};
