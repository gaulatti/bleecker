import React from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Toggle } from '../../src/components/toggle';
import { ToggleGroup, ToggleGroupItem } from '../../src/components/toggle-group';

const meta = {
  component: Toggle,
  title: 'Components/Toggle',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [pressed, setPressed] = React.useState(false);
    return (
      <Toggle pressed={pressed} onPressedChange={setPressed}>
        <Bold size={16} />
        Bold
      </Toggle>
    );
  }
};

export const Outline: Story = {
  render: () => {
    const [pressed, setPressed] = React.useState(false);
    return (
      <Toggle variant='outline' pressed={pressed} onPressedChange={setPressed}>
        <Italic size={16} />
        Italic
      </Toggle>
    );
  }
};

export const ToggleGroupSingle: Story = {
  render: () => {
    const [value, setValue] = React.useState('center');
    return (
      <ToggleGroup type='single' value={value} onValueChange={setValue}>
        <ToggleGroupItem value='left' aria-label='Align left'>
          <AlignLeft size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value='center' aria-label='Align center'>
          <AlignCenter size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value='right' aria-label='Align right'>
          <AlignRight size={16} />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }
};

export const ToggleGroupMultiple: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(['bold']);
    return (
      <ToggleGroup type='multiple' value={value} onValueChange={setValue}>
        <ToggleGroupItem value='bold' aria-label='Bold'>
          <Bold size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value='italic' aria-label='Italic'>
          <Italic size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem value='underline' aria-label='Underline'>
          <Underline size={16} />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }
};
