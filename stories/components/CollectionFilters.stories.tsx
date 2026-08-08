import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { CollectionFilters } from '../../src/components/collection-filters';

const filterOptions = [
  { field: 'status', label: 'Availability', type: 'select' as const, options: [{ label: 'In stock', value: 'available' }, { label: 'Pre-order', value: 'preorder' }] },
  { field: 'featured', label: 'Featured edit', type: 'boolean' as const },
  { field: 'publishedAfter', label: 'Added after', type: 'date' as const }
];
const sortOptions = [
  { field: 'createdAt', label: 'Newest arrivals' },
  { field: 'title', label: 'Name' },
  { field: 'price', label: 'Price' }
];

const products = [
  ['Double-Faced Cashmere Coat', 'Camel', '$1,890'],
  ['Silk Twill Blouse', 'Ivory', '$540'],
  ['Pleated Wool Trouser', 'Charcoal', '$680']
];

const meta = {
  component: CollectionFilters,
  title: 'Components/CollectionFilters',
  parameters: { layout: 'fullscreen' }
} satisfies Meta<typeof CollectionFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

function CollectionExample({ active = false, expanded = false }: { active?: boolean; expanded?: boolean }) {
  const [filters, setFilters] = React.useState<Record<string, boolean | string>>(active ? { featured: true, status: 'available' } : {});
  const [sort, setSort] = React.useState<{ field: string; order: 'asc' | 'desc' }>({ field: 'createdAt', order: 'desc' });

  return (
    <main className='min-h-screen bg-light-sand/35 px-6 py-10 dark:bg-deep-sea md:px-10'>
      <div className='mx-auto max-w-5xl'>
        <header className='mb-8 flex items-end justify-between gap-6'>
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-desert'>Autumn collection</p>
            <h1 className='mt-2 text-3xl font-semibold'>Women’s new arrivals</h1>
            <p className='font-secondary mt-2 text-sm text-text-secondary'>84 considered pieces for the season ahead.</p>
          </div>
        </header>
        <CollectionFilters
          currentFilters={filters}
          currentSort={sort}
          defaultExpanded={expanded}
          filterOptions={filterOptions}
          onFilterChange={setFilters}
          onSortChange={setSort}
          sortOptions={sortOptions}
        />
        <div className='overflow-hidden rounded-[var(--radius-card)] border border-sand/25 bg-white dark:border-white/10 dark:bg-deep-sea'>
          {products.map(([name, color, price]) => (
            <div key={name} className='grid grid-cols-[1fr_auto] items-center gap-6 border-b border-sand/20 px-5 py-5 last:border-0 dark:border-white/[0.07]'>
              <div><p className='text-sm font-medium'>{name}</p><p className='font-secondary mt-1 text-xs text-text-secondary'>{color}</p></div>
              <span className='text-sm tabular-nums'>{price}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export const Default: Story = { render: () => <CollectionExample /> };
export const Expanded: Story = { render: () => <CollectionExample expanded /> };
export const ActiveFilters: Story = { render: () => <CollectionExample active /> };
