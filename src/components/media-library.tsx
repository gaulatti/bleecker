import { Copy, Search, Trash2, X } from 'lucide-react';
import React from 'react';

import { IconButton } from './icon-button';
import { Modal } from './modal';
import { cn } from '../utils/cn';

export interface MediaLibraryItem {
  alt?: string;
  createdAt?: string;
  filename: string;
  id: string;
  thumbnailUrl?: string;
  url?: string;
}

export interface MediaLibraryProps {
  actions?: React.ReactNode;
  className?: string;
  emptyMessage?: string;
  filterSlot?: React.ReactNode;
  items: MediaLibraryItem[];
  onCopy?: (text: string) => void;
  onDelete?: (id: string) => void;
  onSearchTermChange: (value: string) => void;
  searchPlaceholder?: string;
  searchTerm: string;
  title: string;
}

export function MediaLibrary({
  actions,
  className,
  emptyMessage = 'No media found.',
  filterSlot,
  items,
  onCopy,
  onDelete,
  onSearchTermChange,
  searchPlaceholder = 'Search media...',
  searchTerm,
  title
}: MediaLibraryProps) {
  const [selectedMedia, setSelectedMedia] = React.useState<MediaLibraryItem | null>(null);

  const handleCopy = (text: string) => {
    if (onCopy) {
      onCopy(text);
      return;
    }

    if (typeof navigator !== 'undefined') {
      void navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className={cn('p-4 md:p-8', className)}>
      <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <h1 className='text-3xl font-bold text-text-primary dark:text-text-primary'>{title}</h1>
        {actions}
      </div>

      <div className='mb-6 flex flex-col gap-4 md:flex-row'>
        <div className='relative flex-1'>
          <Search size={20} className='absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary' />
          <input
            type='text'
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className='w-full rounded-lg border border-sand/30 bg-white py-2 pl-10 pr-4 text-text-primary outline-none focus:ring-2 focus:ring-sea dark:border-sand/50 dark:bg-sand/10 dark:text-text-primary dark:focus:ring-accent-blue'
          />
        </div>

        {filterSlot ? <div className='md:w-64'>{filterSlot}</div> : null}
      </div>

      <div className='grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5'>
        {items.map((media) => (
          <div
            key={media.id}
            className='group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-sand/10 bg-white dark:border-sand/20 dark:bg-sand/10'
            onClick={() => setSelectedMedia(media)}
          >
            {media.thumbnailUrl || media.url ? (
              <img src={media.thumbnailUrl || media.url} alt={media.alt || media.filename} className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800'>No Preview</div>
            )}

            <div className='absolute inset-0 flex flex-col justify-end bg-black/50 p-4 opacity-0 transition-opacity group-hover:opacity-100'>
              <p className='mb-2 truncate text-sm text-white'>{media.filename}</p>
              {onDelete ? (
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(media.id);
                  }}
                  className='self-end rounded-lg border-0 bg-white p-2 text-terracotta shadow-none backdrop-blur-none hover:translate-y-0 hover:scale-100 hover:bg-gray-100 dark:bg-white dark:text-terracotta dark:hover:bg-gray-100'
                  title='Delete'
                  aria-label='Delete media item'
                >
                  <Trash2 size={16} />
                </IconButton>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 ? <div className='p-8 text-center text-text-secondary'>{emptyMessage}</div> : null}

      <Modal isOpen={!!selectedMedia} onClose={() => setSelectedMedia(null)} title={selectedMedia?.filename || 'Media Preview'} className='max-w-4xl'>
        {selectedMedia ? (
          <div className='space-y-4'>
            <div className='flex items-center justify-center overflow-hidden rounded-lg bg-black/5 dark:bg-black/20'>
              {selectedMedia.url ? (
                <img src={selectedMedia.url} alt={selectedMedia.alt || selectedMedia.filename} className='max-h-[60vh] w-auto object-contain' />
              ) : null}
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <h3 className='flex-1 text-xl font-bold text-text-primary dark:text-text-primary'>{selectedMedia.filename}</h3>
                <IconButton
                  onClick={() => handleCopy(selectedMedia.filename)}
                  className='border-0 bg-transparent p-2 shadow-none backdrop-blur-none hover:translate-y-0 hover:scale-100 hover:bg-sand/20 dark:bg-transparent dark:hover:bg-sand/30'
                  title='Copy filename'
                  aria-label='Copy filename'
                >
                  <Copy size={18} />
                </IconButton>
              </div>

              {selectedMedia.alt ? (
                <div>
                  <label className='text-sm font-medium text-text-secondary dark:text-text-secondary'>Alt Text:</label>
                  <p className='text-text-primary dark:text-text-primary'>{selectedMedia.alt}</p>
                </div>
              ) : null}

              <div className='grid grid-cols-1 gap-4 border-t border-sand/10 pt-2 md:grid-cols-2 dark:border-sand/20'>
                {selectedMedia.url ? (
                  <div>
                    <label className='text-sm font-medium text-text-secondary dark:text-text-secondary'>URL:</label>
                    <div className='flex items-center gap-2'>
                      <a
                        href={selectedMedia.url}
                        target='_blank'
                        rel='noreferrer noopener'
                        className='flex-1 break-all text-sm text-sea hover:underline dark:text-accent-blue'
                      >
                        {selectedMedia.url}
                      </a>
                      <IconButton
                        onClick={() => handleCopy(selectedMedia.url || '')}
                        className='shrink-0 border-0 bg-transparent p-1.5 shadow-none backdrop-blur-none hover:translate-y-0 hover:scale-100 hover:bg-sand/20 dark:bg-transparent dark:hover:bg-sand/30'
                        title='Copy URL'
                        aria-label='Copy URL'
                      >
                        <Copy size={14} />
                      </IconButton>
                    </div>
                  </div>
                ) : null}

                {selectedMedia.createdAt ? (
                  <div>
                    <label className='text-sm font-medium text-text-secondary dark:text-text-secondary'>Created:</label>
                    <p className='text-sm text-text-primary dark:text-text-primary'>{new Date(selectedMedia.createdAt).toLocaleDateString()}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
