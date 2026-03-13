import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { CollectionFilters } from '../../src/components/collection-filters';

const meta = {
  component: CollectionFilters,
  title: 'Components/CollectionFilters',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof CollectionFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [filters, setFilters] = React.useState<Record<string, boolean | string>>({});
    const [sort, setSort] = React.useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'createdAt', order: 'desc' });

    return (
      <div className='max-w-5xl'>
        <CollectionFilters
          currentFilters={filters}
          currentSort={sort}
          filterOptions={[
            {
              field: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { label: 'Published', value: 'published' },
                { label: 'Draft', value: 'draft' }
              ]
            },
            {
              field: 'featured',
              label: 'Featured',
              type: 'boolean'
            },
            {
              field: 'publishedAfter',
              label: 'Published After',
              type: 'date'
            }
          ]}
          onFilterChange={setFilters}
          onSortChange={setSort}
          sortOptions={[
            { field: 'createdAt', label: 'Created Date' },
            { field: 'updatedAt', label: 'Updated Date' },
            { field: 'title', label: 'Title' }
          ]}
        />
      </div>
    );
  }
};
