import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Slider } from '../../src/components/slider';

const meta = {
  component: Slider,
  title: 'Components/Slider',
  parameters: { layout: 'padded' }
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [val, setVal] = React.useState(40);
    return (
      <div className='w-80'>
        <Slider value={val} onChange={setVal} />
      </div>
    );
  }
};

export const WithLabel: Story = {
  render: () => {
    const [val, setVal] = React.useState(60);
    return (
      <div className='w-80'>
        <Slider label='Volume' showValue value={val} onChange={setVal} />
      </div>
    );
  }
};

export const AllVariants: Story = {
  render: () => {
    const [volume, setVolume] = React.useState(70);
    const [brightness, setBrightness] = React.useState(45);
    const [temp, setTemp] = React.useState(22);
    return (
      <div className='w-80 space-y-6'>
        <Slider label='Volume' showValue value={volume} onChange={setVolume} />
        <Slider label='Brightness' showValue value={brightness} onChange={setBrightness} />
        <Slider label='Temperature' showValue min={16} max={30} step={0.5} value={temp} onChange={setTemp} />
      </div>
    );
  }
};

export const Disabled: Story = {
  render: () => (
    <div className='w-80'>
      <Slider label='Disabled' value={50} disabled />
    </div>
  )
};
