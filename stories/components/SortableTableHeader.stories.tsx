import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { SortableTableHeader } from '../../src/components/table';

const meta = {
  component: SortableTableHeader,
  title: 'Components/SortableTableHeader',
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof SortableTableHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [sort, setSort] = React.useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'title', order: 'asc' });

    return (
      <div className='overflow-x-auto rounded-xl border border-sand/10 bg-white dark:border-sand/20 dark:bg-sand/10'>
        <table className='w-full'>
          <thead className='border-b border-sand/10 bg-sand/10 dark:border-sand/20 dark:bg-sand/20'>
            <tr>
              <SortableTableHeader label='Title' field='title' currentSort={sort} onSort={setSort} />
              <SortableTableHeader label='Updated' field='updatedAt' currentSort={sort} onSort={setSort} />
              <SortableTableHeader label='Actions' field='actions' currentSort={sort} onSort={setSort} align='right' sortable={false} />
            </tr>
          </thead>
          <tbody>
            <tr className='hover:bg-sand/5 dark:hover:bg-sand/10'>
              <td className='px-6 py-4 text-text-primary dark:text-text-primary'>Homepage hero</td>
              <td className='px-6 py-4 text-text-secondary dark:text-text-secondary'>2026-03-13</td>
              <td className='px-6 py-4 text-right text-text-secondary dark:text-text-secondary'>Edit</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
};
