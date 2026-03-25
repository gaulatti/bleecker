import React from 'react';

import { renderDefaultLink } from './nav-menu';
import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  href?: string;
  external?: boolean;
}

export type TabRenderLink = (props: { item: TabItem & { href: string }; className?: string; children: React.ReactNode }) => React.ReactNode;

export interface TabsProps {
  activeTab?: string;
  className?: string;
  onChange?: (id: string) => void;
  renderLink?: TabRenderLink;
  tabs: TabItem[];
}

export function Tabs({ activeTab, className, onChange, renderLink, tabs }: TabsProps) {
  const tabCount = tabs.length;

  return (
    <nav className={cn('-mb-px flex', className)} aria-label='Tabs'>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const tabClassName = cn(
          'border-b-2 px-1 py-4 text-center text-sm font-medium transition-colors duration-400',
          tabCount > 0 && `w-1/${Math.min(tabCount, 6)}`,
          isActive
            ? 'border-sea text-sea dark:border-accent-blue dark:text-accent-blue'
            : 'border-transparent text-text-secondary hover:border-gray-300 hover:text-text-primary dark:text-text-secondary dark:hover:text-text-primary'
        );

        if (tab.href) {
          const linkRenderer = renderLink ?? ((props) => renderDefaultLink({ ...props, item: { href: props.item.href, label: props.item.label } }));
          return (
            <React.Fragment key={tab.id}>
              {linkRenderer({
                item: { ...tab, href: tab.href },
                className: tabClassName,
                children: tab.label
              })}
            </React.Fragment>
          );
        }

        return (
          <button
            key={tab.id}
            type='button'
            onClick={() => onChange?.(tab.id)}
            className={tabClassName}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
