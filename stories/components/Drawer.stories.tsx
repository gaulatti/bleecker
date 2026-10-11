import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Drawer } from '../../src/components/drawer';
import { Button } from '../../src/components/button';
import { EmptyModalContract, ModalLayerContract, verifyEmptyModal, verifyInitiallyOpen, verifyModalLayer, verifyParentUnmount } from './modal-layer-contract';

const meta = {
  component: Drawer,
  title: 'Components/Drawer',
  parameters: {
    layout: 'centered',
    viewport: { options: { modalMobile: { name: 'Mobile modal', styles: { width: '390px', height: '844px' } } } }
  },
  globals: { viewport: { value: 'modalMobile', isRotated: false } }
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeyboardLifecycle: Story = {
  render: () => <ModalLayerContract kind='drawer' />,
  play: async ({ canvasElement }) => verifyModalLayer(canvasElement)
};

export const InitiallyOpen: Story = {
  render: () => <ModalLayerContract kind='drawer' initiallyOpen />,
  play: async ({ canvasElement }) => verifyInitiallyOpen(canvasElement)
};

export const EmptyAndDynamic: Story = {
  render: () => <EmptyModalContract />,
  play: async ({ canvasElement }) => verifyEmptyModal(canvasElement)
};

export const ParentUnmount: Story = {
  render: () => <ModalLayerContract kind='drawer' />,
  play: async ({ canvasElement }) => verifyParentUnmount(canvasElement)
};

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer isOpen={open} onClose={() => setOpen(false)} title='Quick actions' description='Choose an action to perform.'>
          <div className='space-y-2'>
            {['Edit profile', 'Change password', 'Export data', 'Delete account'].map((item) => (
              <Button key={item} variant='ghost' className='w-full justify-start'>
                {item}
              </Button>
            ))}
          </div>
        </Drawer>
      </>
    );
  }
};

export const WithContent: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Filter results</Button>
        <Drawer isOpen={open} onClose={() => setOpen(false)} title='Filters'>
          <div className='space-y-6'>
            <div>
              <p className='mb-2 text-sm font-medium text-text-primary dark:text-text-primary'>Category</p>
              <div className='flex flex-wrap gap-2'>
                {['Music', 'News', 'Sports', 'Technology', 'Science'].map((cat) => (
                  <Button
                    key={cat}
                    variant='secondary'
                    size='sm'
                    className='rounded-full bg-transparent px-3 py-1 text-xs text-text-secondary hover:border-sea hover:bg-transparent hover:text-sea dark:bg-transparent dark:text-text-secondary dark:hover:border-accent-blue dark:hover:bg-transparent dark:hover:text-accent-blue'
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            <Button className='w-full'>Apply filters</Button>
          </div>
        </Drawer>
      </>
    );
  }
};
