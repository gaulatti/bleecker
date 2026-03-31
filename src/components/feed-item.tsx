import { Avatar } from './avatar';
import { cn } from '../utils/cn';

export interface FeedItemProps {
  author: string;
  className?: string;
  content: string;
  handle: string;
  init: string;
  time: string;
  verified?: boolean;
}

export function FeedItem({ author, className, content, handle, init, time, verified }: FeedItemProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer gap-3 border-b border-black/[0.04] p-4 text-left transition-colors hover:bg-black/[0.02] dark:border-white/[0.04] dark:hover:bg-white/[0.02]',
        className
      )}
    >
      <Avatar fallback={init} size='sm' className='h-10 w-10 ring-1 ring-black/5' />
      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex items-center gap-1.5'>
          <span className='truncate text-sm font-semibold text-text-primary'>{author}</span>
          {verified && <span className='rounded-full bg-sea/10 px-1 py-0.5 text-[10px] leading-none text-sea'>✓</span>}
          <span className='truncate text-xs text-text-secondary'>{handle}</span>
          <span className='whitespace-nowrap text-xs text-text-secondary'>· {time}</span>
        </div>
        <p className='break-words text-sm leading-relaxed text-text-primary'>{content}</p>

        <div className='mt-3 flex items-center gap-6 text-text-secondary'>
          <div className='flex items-center gap-1.5 transition-colors hover:text-sea'>
            <span className='text-[10px]'>💬</span> 12
          </div>
          <div className='flex items-center gap-1.5 transition-colors hover:text-emer'>
            <span className='text-[10px]'>🔄</span> 4
          </div>
          <div className='flex items-center gap-1.5 transition-colors hover:text-terracotta'>
            <span className='text-[10px]'>❤️</span> 89
          </div>
        </div>
      </div>
    </div>
  );
}
