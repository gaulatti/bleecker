import type { Meta, StoryObj } from '@storybook/react-vite';
import { Settings, Trash2 } from 'lucide-react';

import { Tooltip } from '../../src/components/tooltip';
import { Button } from '../../src/components/button';
import { IconButton } from '../../src/components/icon-button';

const meta = {
  component: Tooltip,
  title: 'Components/Tooltip',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip content='This is a tooltip'>
      <Button>Hover me</Button>
    </Tooltip>
  )
};

export const AllSides: Story = {
  render: () => (
    <div className='grid grid-cols-3 items-center gap-8 p-16'>
      <span />
      <Tooltip content='Top tooltip' side='top'>
        <Button size='sm' variant='secondary'>
          Top
        </Button>
      </Tooltip>
      <span />
      <Tooltip content='Left tooltip' side='left'>
        <Button size='sm' variant='secondary'>
          Left
        </Button>
      </Tooltip>
      <span />
      <Tooltip content='Right tooltip' side='right'>
        <Button size='sm' variant='secondary'>
          Right
        </Button>
      </Tooltip>
      <span />
      <Tooltip content='Bottom tooltip' side='bottom'>
        <Button size='sm' variant='secondary'>
          Bottom
        </Button>
      </Tooltip>
      <span />
    </div>
  )
};

export const OnIconButton: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Tooltip content='Settings'>
        <IconButton aria-label='Settings'>
          <Settings size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip content='Delete permanently' side='bottom'>
        <IconButton aria-label='Delete'>
          <Trash2 size={18} />
        </IconButton>
      </Tooltip>
    </div>
  )
};
