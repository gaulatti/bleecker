import { Filter, Plus } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Button } from '../../src/components/button';
import { MediaLibrary } from '../../src/components/media-library';

const mediaItems = [
  {
    id: '1',
    filename: 'studio-wide.jpg',
    alt: 'Studio wide shot',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
    createdAt: '2026-03-10T10:00:00.000Z'
  },
  {
    id: '2',
    filename: 'host-closeup.jpg',
    alt: 'Host closeup',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=80',
    createdAt: '2026-03-11T10:00:00.000Z'
  },
  {
    id: '3',
    filename: 'desk-detail.jpg',
    alt: 'Desk detail',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80',
    createdAt: '2026-03-12T10:00:00.000Z'
  }
];

const meta = {
  component: MediaLibrary,
  title: 'Components/MediaLibrary',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof MediaLibrary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const items = mediaItems.filter((item) => item.filename.toLowerCase().includes(searchTerm.toLowerCase()) || (item.alt || '').toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <MediaLibrary
        title='Media Library'
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        items={items}
        onDelete={() => undefined}
        actions={
          <Button>
            <Plus size={18} />
            New Media
          </Button>
        }
        filterSlot={
          <div className='relative'>
            <Filter size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary' />
            <select className='w-full appearance-none rounded-lg border border-sand/30 bg-white py-2 pl-9 pr-8 text-text-primary outline-none focus:ring-2 focus:ring-sea dark:border-sand/50 dark:bg-sand/10 dark:text-text-primary dark:focus:ring-accent-blue'>
              <option>All Assignments</option>
              <option>Homepage</option>
              <option>Politics</option>
            </select>
          </div>
        }
      />
    );
  }
};
