import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Card } from '../../src/components/card';
import { Tabs, type TabsProps } from '../../src/components/tabs';

type TabsStoryArgs = Omit<TabsProps, 'activeTab' | 'onChange'> & {
  initialActiveTab: string;
};

const meta = {
  component: Tabs,
  title: 'Components/Tabs',
  args: {
    initialActiveTab: 'url',
    tabs: [
      { id: 'url', label: 'Import via URL' },
      { id: 'file', label: 'Upload M3U File' }
    ]
  },
  argTypes: {
    activeTab: {
      control: false
    },
    onChange: {
      control: false
    },
    tabs: {
      control: 'object'
    },
    initialActiveTab: {
      control: 'text'
    }
  },
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<TabsStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ImportStyle: Story = {
  render: ({ initialActiveTab, tabs, ...args }) => {
    const [activeTab, setActiveTab] = React.useState(initialActiveTab);

    React.useEffect(() => {
      setActiveTab(initialActiveTab);
    }, [initialActiveTab]);

    return (
      <Card className='max-w-3xl overflow-hidden p-0'>
        <div className='px-6 pt-3'><Tabs {...args} activeTab={activeTab} onChange={setActiveTab} tabs={tabs} /></div>
        <div className='p-6'>
          {activeTab === 'url' ? (
            <div className='space-y-2'>
              <h3 className='text-lg'>Import from M3U URL</h3>
              <p className='text-sm text-text-secondary dark:text-text-secondary'>Enter a playlist URL and import channels directly.</p>
            </div>
          ) : (
            <div className='space-y-2'>
              <h3 className='text-lg'>Upload M3U File</h3>
              <p className='text-sm text-text-secondary dark:text-text-secondary'>Choose a local playlist file and import it into the workspace.</p>
            </div>
          )}
        </div>
      </Card>
    );
  }
};

export const VisualLanguages: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('overview');
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'editorial', label: 'Editorial' },
      { id: 'inventory', label: 'Inventory' },
      { id: 'settings', label: 'Settings' }
    ];
    return (
      <div className='w-[760px] space-y-10 rounded-[var(--radius-card)] border border-sand/25 bg-white p-8 shadow-[var(--shadow-surface)] dark:border-white/10 dark:bg-deep-sea'>
        <div className='space-y-3'><p className='text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>Editorial underline</p><Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} /></div>
        <div className='space-y-3'><p className='text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>Segmented control</p><Tabs variant='segmented' tabs={tabs.slice(0, 3)} activeTab={activeTab} onChange={setActiveTab} /></div>
        <div className='space-y-3'><p className='text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary'>Equal-width navigation</p><Tabs variant='enclosed' stretch tabs={tabs} activeTab={activeTab} onChange={setActiveTab} /></div>
      </div>
    );
  }
};

export const ThreeTabs: Story = {
  ...ImportStyle,
  args: {
    initialActiveTab: 'overview',
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'activity', label: 'Activity' },
      { id: 'settings', label: 'Settings' }
    ]
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole('tab', { name: 'Overview' });
    overview.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Activity' })).toHaveAttribute('aria-selected', 'true');
  }
};
