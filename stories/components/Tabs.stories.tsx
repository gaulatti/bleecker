import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

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
        <div className='border-b border-sand/10 dark:border-sand/20'>
          <Tabs {...args} activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
        </div>
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
