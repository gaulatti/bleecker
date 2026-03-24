import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Empty } from '../../src/components/empty';
import { Button } from '../../src/components/button';
import { FolderOpen, Inbox, Search } from 'lucide-react';

const meta = {
  component: Empty,
  title: 'Components/Empty',
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Nothing here yet'
  }
};

export const WithDescription: Story = {
  args: {
    title: 'No results found',
    description: "Try adjusting your search or filters to find what you're looking for."
  }
};

export const WithAction: Story = {
  render: () => (
    <Empty
      title='Your inbox is empty'
      description='When you receive messages, they will appear here.'
      icon={<Inbox size={28} />}
      action={<Button size='sm'>Compose message</Button>}
    />
  )
};

export const NoFiles: Story = {
  render: () => (
    <Empty
      title='No files uploaded'
      description='Drag and drop files here, or click the button below to get started.'
      icon={<FolderOpen size={28} />}
      action={<Button size='sm'>Upload files</Button>}
    />
  )
};

export const SearchEmpty: Story = {
  render: () => (
    <Empty
      title='No matching results'
      description="We couldn't find anything for &quot;podcast equipment&quot;. Try a different search term."
      icon={<Search size={28} />}
    />
  )
};
