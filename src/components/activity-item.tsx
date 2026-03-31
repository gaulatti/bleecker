import { Avatar } from './avatar';
import { cn } from '../utils/cn';

export interface ActivityItemProps {
  className?: string;
  init: string;
  time: string;
  title: string;
}

export function ActivityItem({ className, init, time, title }: ActivityItemProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer gap-4 border-b border-black/[0.04] p-4 transition-colors hover:bg-black/[0.02] dark:border-white/[0.04] dark:hover:bg-white/[0.02]',
        className
      )}
    >
      <Avatar fallback={init} size='sm' />
      <div className='flex-1 space-y-1'>
        <p className='text-sm font-medium leading-none text-text-primary'>{title}</p>
        <p className='text-xs text-text-secondary'>{time}</p>
      </div>
    </div>
  );
}
