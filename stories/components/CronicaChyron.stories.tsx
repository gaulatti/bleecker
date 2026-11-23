import type { Meta, StoryObj } from '@storybook/react-vite';

import { CronicaChyron } from '../../src/components/cronica-chyron';

const meta = {
  component: CronicaChyron,
  title: 'Components/CronicaChyron',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof CronicaChyron>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <div className='relative h-80 w-full'><CronicaChyron text={'URGENTE\nSe cortó la luz'} /></div>
};

export const Variant: Story = {
  render: () => <div className='relative h-80 w-full'><CronicaChyron text='UNA SOLA LÍNEA' /></div>
};
