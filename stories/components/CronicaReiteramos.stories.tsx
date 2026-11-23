import type { Meta, StoryObj } from '@storybook/react-vite';

import { CronicaReiteramos } from '../../src/components/cronica-reiteramos';

const meta = {
  component: CronicaReiteramos,
  title: 'Components/CronicaReiteramos',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof CronicaReiteramos>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <div className='relative h-80 w-full'><CronicaReiteramos /></div>
};

export const Variant: Story = {
  render: () => <div className='relative h-80 w-full'><CronicaReiteramos text='OTRA VEZ' /></div>
};
