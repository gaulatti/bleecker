import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, List, Underline } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../src/components/button';
import { ButtonGroup } from '../../src/components/button-group';

const meta = {
  component: ButtonGroup,
  title: 'Components/ButtonGroup',
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant='secondary'>Day</Button>
      <Button variant='secondary'>Week</Button>
      <Button variant='secondary'>Month</Button>
    </ButtonGroup>
  )
};

export const WithActive: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant='secondary'>Day</Button>
      <Button variant='primary'>Week</Button>
      <Button variant='secondary'>Month</Button>
    </ButtonGroup>
  )
};

export const IconButtons: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant='secondary' size='sm' aria-label='Bold'>
        <Bold size={14} />
      </Button>
      <Button variant='secondary' size='sm' aria-label='Italic'>
        <Italic size={14} />
      </Button>
      <Button variant='secondary' size='sm' aria-label='Underline'>
        <Underline size={14} />
      </Button>
    </ButtonGroup>
  )
};

export const AlignmentGroup: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant='secondary' size='sm' aria-label='Align left'>
        <AlignLeft size={14} />
      </Button>
      <Button variant='primary' size='sm' aria-label='Align center'>
        <AlignCenter size={14} />
      </Button>
      <Button variant='secondary' size='sm' aria-label='Align right'>
        <AlignRight size={14} />
      </Button>
    </ButtonGroup>
  )
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation='vertical'>
      <Button variant='secondary'>First</Button>
      <Button variant='secondary'>Second</Button>
      <Button variant='secondary'>Third</Button>
    </ButtonGroup>
  )
};

export const MixedWithText: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant='secondary' size='sm'>
        <List size={14} />
        List
      </Button>
      <Button variant='primary' size='sm'>
        <Bold size={14} />
        Bold
      </Button>
      <Button variant='secondary' size='sm'>
        <Italic size={14} />
        Italic
      </Button>
    </ButtonGroup>
  )
};
