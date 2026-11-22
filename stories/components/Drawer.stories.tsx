import { NestedBranchContract, verifyNestedBranch } from './modal-composition-contract';
import { PortaledMenusContract, verifyPortaledMenus } from './modal-composition-contract';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Drawer } from '../../src/components/drawer';
import { Button } from '../../src/components/button';
import { EmptyModalContract, ModalLayerContract, verifyEmptyModal, verifyInitiallyOpen, verifyModalLayer, verifyParentUnmount } from './modal-layer-contract';

import { MixedModalContract, SimultaneousNestedContract, NativeFocusContract, PortaledWidgetContract, FrameRealmContract, verifyMixedModals, verifySimultaneousNested, verifyNativeFocus, verifyPortaledWidget, verifyFrameRealm } from './modal-composition-contract';

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

export const MixedModalStack: Story = { render: () => <MixedModalContract />, play: async ({ canvasElement }) => verifyMixedModals(canvasElement) };
export const SimultaneousNested: Story = { render: () => <SimultaneousNestedContract />, play: async ({ canvasElement }) => verifySimultaneousNested(canvasElement) };
export const NativeFocusOrder: Story = { render: () => <NativeFocusContract />, play: async ({ canvasElement }) => verifyNativeFocus(canvasElement) };
export const PortaledWidget: Story = { render: () => <PortaledWidgetContract />, play: async ({ canvasElement }) => verifyPortaledWidget(canvasElement) };
export const FrameRealm: Story = { render: () => <FrameRealmContract />, play: async ({ canvasElement }) => verifyFrameRealm(canvasElement) };

export const ModalPortalOwnership: Story = { render: () => <PortaledMenusContract />, play: async ({ canvasElement }) => verifyPortaledMenus(canvasElement) };

export const NestedPortalFocusReturn: Story = { render: () => <NestedBranchContract />, play: async ({ canvasElement }) => verifyNestedBranch(canvasElement) };

/** variant="detail" (bleecker#549 phase 1, #552): docked beside a list, no overlay; focus stays in the list. */
export const Detail: Story = {
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: undefined, isRotated: false } },
  render: () => {
    const labels = [
      { id: '90s', name: '90s', count: 38, description: 'Songs released 1990–1999' },
      { id: 'evening', name: 'Evening', count: 18, description: 'Slow songs for the evening show' },
      { id: 'ids', name: 'Station IDs', count: 9, description: 'Short station identifiers' }
    ];
    const [open, setOpen] = React.useState<string | null>('90s');
    const label = labels.find((item) => item.id === open);
    return (
      <div className='flex h-[28rem]'>
        <ul className='flex-1 divide-y divide-sand/20 p-4'>
          {labels.map((item) => (
            <li key={item.id}>
              <button type='button' className='flex w-full justify-between px-3 py-2 text-left text-sm' onClick={() => setOpen(item.id)} aria-pressed={open === item.id}>
                <span>{item.name}</span>
                <span className='tabular-nums text-text-secondary'>{item.count}</span>
              </button>
            </li>
          ))}
        </ul>
        <Drawer variant='detail' open={!!label} onClose={() => setOpen(null)} title={label?.name} description={label?.description}>
          <p className='text-sm'>{label?.count} assets</p>
          <Button size='sm' variant='secondary' className='mt-4'>
            Rename
          </Button>
        </Drawer>
      </div>
    );
  }
};
