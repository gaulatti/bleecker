import React from 'react';

import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  activeTab: string;
  className?: string;
  onChange: (id: string) => void;
  tabs: TabItem[];
}

export function Tabs({ activeTab, className, onChange, tabs }: TabsProps) {
  return (
    <nav className={cn('-mb-px flex', className)} aria-label='Tabs'>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type='button'
            onClick={() => onChange(tab.id)}
            className={cn(
              'w-1/2 border-b-2 px-1 py-4 text-center text-sm font-medium transition-colors duration-400',
              isActive
                ? 'border-sea text-sea dark:border-accent-blue dark:text-accent-blue'
                : 'border-transparent text-text-secondary hover:border-gray-300 hover:text-text-primary dark:text-text-secondary dark:hover:text-text-primary'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
