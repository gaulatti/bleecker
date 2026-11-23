import React from 'react';

import { renderDefaultLink } from './nav-menu';
import { Skeleton } from './skeleton';
import { cn } from '../utils/cn';

export interface TabItem {
  /** How many items the tab holds, shown as a quiet pill after the label; `null` or omitted hides it. */
  count?: number | null;
  /** Shows a short skeleton where the count will be, so it does not jump from blank. */
  countLoading?: boolean;
  id: string;
  label: string;
  href?: string;
  external?: boolean;
  panelId?: string;
}

/** 999 and below as is, then 1.2k, 12k, 1.2M: the pill stays narrow. The full value goes in the accessible name. */
function abbreviateCount(count: number): string {
  const trim = (value: number) => value.toFixed(1).replace(/\.0$/, '');
  if (count < 1000) return String(count);
  if (count < 10_000) return `${trim(Math.floor(count / 100) / 10)}k`;
  if (count < 1_000_000) return `${Math.floor(count / 1000)}k`;
  if (count < 10_000_000) return `${trim(Math.floor(count / 100_000) / 10)}M`;
  return `${Math.floor(count / 1_000_000)}M`;
}

function TabLabel({ tab, isActive }: { tab: TabItem; isActive: boolean }) {
  const hasCount = typeof tab.count === 'number' && Number.isFinite(tab.count);
  if (tab.countLoading) {
    return (
      <>
        <span>
          {tab.label}
          <span className='sr-only'>, loading count</span>
        </span>
        <Skeleton aria-hidden='true' data-tab-count-loading className='ml-2 h-4 w-6 rounded-full' />
      </>
    );
  }
  if (!hasCount) return <>{tab.label}</>;
  const count = tab.count as number;
  return (
    <>
      <span>
        {tab.label}
        <span className='sr-only'>{`, ${count.toLocaleString('en-US')} ${count === 1 ? 'item' : 'items'}`}</span>
      </span>
      <span
        aria-hidden='true'
        data-tab-count
        className={cn(
          'ml-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums',
          isActive ? 'bg-current/10' : 'bg-sand/25 text-text-secondary dark:bg-white/10 dark:text-text-secondary'
        )}
      >
        {abbreviateCount(count)}
      </span>
    </>
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
                children: <TabLabel tab={tab} isActive={isActive} />
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
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange?.(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={tabClassName}
          >
            <TabLabel tab={tab} isActive={isActive} />
          </button>
        );
      })}
    </nav>
  );
}
