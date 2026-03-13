import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '../utils/cn';

export interface PaginationProps {
  className?: string;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export function Pagination({ className, currentPage, hasNextPage, hasPrevPage, onPageChange, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = Array.from({ length: Math.min(totalPages, 7) }, (_, index) => {
    if (totalPages <= 7) {
      return index + 1;
    }

    if (currentPage <= 4) {
      return index + 1;
    }

    if (currentPage >= totalPages - 3) {
      return totalPages - 6 + index;
    }

    return currentPage - 3 + index;
  });

  return (
    <div className={cn('mt-8 flex items-center justify-center gap-2', className)}>
      <button
        type='button'
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className='rounded-lg border border-sand/10 bg-white p-2 transition-colors hover:bg-sand/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sand/20 dark:bg-sand/10 dark:hover:bg-sand/20'
        title='Previous page'
      >
        <ChevronLeft size={20} />
      </button>

      <div className='flex items-center gap-1'>
        {visiblePages.map((pageNumber) => (
          <button
            key={pageNumber}
            type='button'
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pageNumber === currentPage
                ? 'bg-sea text-white dark:bg-accent-blue'
                : 'border border-sand/10 bg-white text-text-primary hover:bg-sand/10 dark:border-sand/20 dark:bg-sand/10 dark:text-text-primary dark:hover:bg-sand/20'
            )}
          >
            {pageNumber}
          </button>
        ))}
      </div>

      <button
        type='button'
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className='rounded-lg border border-sand/10 bg-white p-2 transition-colors hover:bg-sand/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sand/20 dark:bg-sand/10 dark:hover:bg-sand/20'
        title='Next page'
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
