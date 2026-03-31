import { ChevronDown } from 'lucide-react';
import React from 'react';

import { cn } from '../utils/cn';
import { type NavItem, renderDefaultLink, type RenderLink } from './nav-menu';

export interface NavigationMenuLink extends NavItem {
  description?: string;
}

export interface NavigationMenuGroup {
  trigger: string;
  href?: string;
  items: NavigationMenuLink[];
}

export type NavigationMenuEntry = NavigationMenuLink | NavigationMenuGroup;

function isGroup(entry: NavigationMenuEntry): entry is NavigationMenuGroup {
  return 'items' in entry;
}

export interface NavigationMenuProps<TLink extends NavigationMenuLink = NavigationMenuLink> {
  className?: string;
  entries: NavigationMenuEntry[];
  renderLink?: RenderLink<TLink>;
}

export function NavigationMenu<TLink extends NavigationMenuLink>({ className, entries, renderLink }: NavigationMenuProps<TLink>) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const linkRenderer = (renderLink ?? renderDefaultLink) as RenderLink<NavigationMenuLink>;
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setActiveIndex(null);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [activeIndex]);

  return (
    <div ref={containerRef} className={cn('relative flex items-center gap-1', className)}>
      {entries.map((entry, i) => {
        if (!isGroup(entry)) {
          return (
            <React.Fragment key={entry.href}>
              {linkRenderer({
                item: entry as NavigationMenuLink,
                className:
                  'px-3 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary rounded-lg hover:bg-sand/10 dark:text-text-secondary dark:hover:text-text-primary dark:hover:bg-sand/15',
                children: entry.label
              })}
            </React.Fragment>
          );
        }

        const isOpen = activeIndex === i;

        return (
          <div key={entry.trigger} className='relative'>
            <button
              type='button'
              onClick={() => setActiveIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={cn(
                'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sea dark:focus-visible:ring-accent-blue',
                isOpen
                  ? 'bg-sand/10 text-text-primary dark:bg-sand/15 dark:text-text-primary'
                  : 'text-text-secondary hover:bg-sand/10 hover:text-text-primary dark:text-text-secondary dark:hover:bg-sand/15 dark:hover:text-text-primary'
              )}
            >
              {entry.trigger}
              <ChevronDown size={14} className={cn('transition-transform duration-200', isOpen ? 'rotate-180' : 'rotate-0')} />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className='absolute left-0 top-full z-50 mt-1.5 min-w-[16rem] animate-in fade-in slide-in-from-top-2 duration-200 ease-out-expo rounded-[var(--radius-card)] border-0 ring-1 ring-black/5 bg-white/95 backdrop-blur-xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:ring-white/10 dark:bg-deep-sea/95 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]'>
                {entry.items.map((item) => (
                  <React.Fragment key={item.href}>
                    {linkRenderer({
                      item,
                      className: 'flex flex-col rounded-lg px-3 py-2.5 hover:bg-sand/10 dark:hover:bg-sand/15 transition-colors duration-200',
                      children: (
                        <>
                          <span className='text-sm font-medium text-text-primary dark:text-text-primary'>{item.label}</span>
                          {item.description ? (
                            <span className='mt-0.5 text-xs leading-relaxed text-text-secondary dark:text-text-secondary'>{item.description}</span>
                          ) : null}
                        </>
                      ),
                      onClick: () => setActiveIndex(null)
                    })}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
