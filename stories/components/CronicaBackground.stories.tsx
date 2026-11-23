import type { Meta, StoryObj } from '@storybook/react-vite';

import { CronicaBackground } from '../../src/components/cronica-background';

const meta = {
  component: CronicaBackground,
  title: 'Components/CronicaBackground',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof CronicaBackground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <div className='relative h-80 w-full'><CronicaBackground /></div>
};

export const Variant: Story = {
  render: () => <div className='relative h-80 w-full'><CronicaBackground /><div className='absolute inset-0 flex items-center justify-center text-white'>Program on top</div></div>
};
