import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Pagination, type PaginationProps } from '../../src/components/pagination';

type PaginationStoryArgs = Omit<PaginationProps, 'currentPage' | 'hasNextPage' | 'hasPrevPage' | 'onPageChange'> & {
  initialPage: number;
};

const meta = {
  component: Pagination,
  title: 'Components/Pagination',
  args: {
    initialPage: 4,
    totalPages: 12
  },
  argTypes: {
    initialPage: {
      control: 'number'
    },
    currentPage: {
      control: false
    },
    hasNextPage: {
      control: false
    },
    hasPrevPage: {
      control: false
    },
    onPageChange: {
      control: false
    }
  },
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<PaginationStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ initialPage, totalPages, ...args }) => {
    const [page, setPage] = React.useState(initialPage);

    React.useEffect(() => {
      setPage(initialPage);
    }, [initialPage]);

    return (
      <Pagination
        {...args}
        currentPage={page}
        hasNextPage={page < totalPages}
        hasPrevPage={page > 1}
        onPageChange={setPage}
        totalPages={totalPages}
      />
    );
  }
};
