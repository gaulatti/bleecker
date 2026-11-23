import React from 'react';

import { renderDefaultLink } from './nav-menu';
import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  /** How many items the tab holds: a quiet pill after the label. `null` or absent hides it. */
  count?: number | null;
  /** A short skeleton in the count's place while the number loads, so it does not jump from blank. */
  countLoading?: boolean;
  href?: string;
  external?: boolean;
  panelId?: string;
}

const countFormat = new Intl.NumberFormat('en-US');

/** A count for the pill: `1.2k` for a thousand and above; the full value stays in the accessible name. */
export function formatTabCount(count: number): string {
  if (count < 1000) return countFormat.format(count);
  const thousands = count / 1000;
  return `${thousands >= 10 ? Math.round(thousands) : thousands.toFixed(1).replace(/\.0$/, '')}k`;
}

function TabCount({ count, loading }: { count?: number | null; loading?: boolean }) {
  if (loading) return <span aria-hidden='true' className='ml-2 inline-block h-4 w-6 animate-pulse rounded-full bg-sand/30 dark:bg-white/15' />;
  if (count === undefined || count === null) return null;
  return (
    <span aria-hidden='true' className='ml-2 inline-flex min-w-5 justify-center rounded-full bg-sand/25 px-1.5 text-[11px] font-semibold tabular-nums text-text-secondary dark:bg-white/10'>
      {formatTabCount(count)}
    </span>
  );
}

export type TabRenderLink = (props: { item: TabItem & { href: string }; className?: string; children: React.ReactNode }) => React.ReactNode;

export interface TabsProps {
  activeTab?: string;
  'aria-label'?: string;
  className?: string;
  onChange?: (id: string) => void;
  renderLink?: TabRenderLink;
  size?: 'sm' | 'md' | 'lg';
  stretch?: boolean;
  tabs: TabItem[];
  variant?: 'underline' | 'segmented' | 'enclosed';
}

export function Tabs({ activeTab, 'aria-label': ariaLabel = 'Tabs', className, onChange, renderLink, size = 'md', stretch = false, tabs, variant = 'underline' }: TabsProps) {
  const isNavigation = tabs.some((tab) => Boolean(tab.href));

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    const next = tabs[nextIndex];
    onChange?.(next.id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]')[nextIndex]?.focus();
  };

  return (
    <nav
      className={cn(
        'flex items-center',
        variant === 'underline' && '-mb-px gap-1 border-b border-sand/20 dark:border-white/10',
        variant === 'segmented' && 'w-fit gap-1 rounded-[10px] bg-light-sand/70 p-1 dark:bg-white/[0.06]',
        variant === 'enclosed' && 'w-fit gap-1 rounded-[10px] border border-sand/30 bg-white p-1 shadow-[0_1px_2px_rgba(21,48,66,0.04)] dark:border-white/15 dark:bg-deep-sea',
        stretch && 'w-full',
        className
      )}
      aria-label={ariaLabel}
      role={isNavigation ? undefined : 'tablist'}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const tabClassName = cn(
          'relative inline-flex translate-y-0 items-center justify-center whitespace-nowrap text-center font-medium tracking-ui outline-none transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--motion-control)] ease-premium active:translate-y-px focus-visible:ring-2 focus-visible:ring-sea/30 dark:focus-visible:ring-accent-blue/40',
          size === 'sm' && 'min-h-8 px-3 text-xs',
          size === 'md' && 'min-h-10 px-4 text-sm',
          size === 'lg' && 'min-h-12 px-5 text-[15px]',
          stretch && 'flex-1',
          variant === 'underline' && [
            'border-b-2 border-transparent',
            isActive
              ? 'border-sea text-sea dark:border-accent-blue dark:text-accent-blue'
              : 'text-text-secondary hover:border-sand/60 hover:text-text-primary dark:text-text-secondary dark:hover:border-white/25 dark:hover:text-text-primary'
          ],
          variant === 'segmented' && [
            'rounded-[7px] border border-transparent',
            isActive
              ? 'border-sand/25 bg-white text-deep-sea shadow-[0_1px_3px_rgba(21,48,66,0.10)] dark:border-white/10 dark:bg-deep-sea dark:text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          ],
          variant === 'enclosed' && [
            'rounded-[7px] border border-transparent',
            isActive
              ? 'border-sand/30 bg-light-sand/70 text-deep-sea dark:border-white/10 dark:bg-white/[0.08] dark:text-text-primary'
              : 'text-text-secondary hover:bg-light-sand/35 hover:text-text-primary dark:hover:bg-white/[0.04]'
          ]
        );

        if (tab.href) {
          const linkRenderer = renderLink ?? ((props) => renderDefaultLink({ ...props, item: { href: props.item.href, label: props.item.label, external: props.item.external } }));
          return (
            <React.Fragment key={tab.id}>
              {linkRenderer({
                item: { ...tab, href: tab.href },
                className: tabClassName,
                children: (
                  <>
                    {tab.label}
                    <TabCount count={tab.count} loading={tab.countLoading} />
                  </>
                )
              })}
            </React.Fragment>
          );
        }

        return (
          <button
            key={tab.id}
            type='button'
            role='tab'
            aria-selected={isActive}
            aria-controls={tab.panelId}
            aria-label={tab.count !== undefined && tab.count !== null ? `${tab.label}, ${countFormat.format(tab.count)} items` : undefined}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange?.(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={tabClassName}
          >
            {tab.label}
            <TabCount count={tab.count} loading={tab.countLoading} />
          </button>
        );
      })}
    </nav>
  );
}
