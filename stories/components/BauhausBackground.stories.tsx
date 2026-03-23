import type { Meta, StoryObj } from '@storybook/react-vite';

import { BauhausBackground, type BauhausBackgroundType } from '../../src/components/bauhaus-background';

const sampleImage = 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80';

const meta = {
  component: BauhausBackground,
  title: 'Components/BauhausBackground',
  args: {
    imageUrl: sampleImage,
    type: 'nazca'
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['nazca', 'autostrada', 'pompeii', 'monitor'] satisfies BauhausBackgroundType[]
    }
  },
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof BauhausBackground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className='mx-auto w-full max-w-3xl'>
      <div className='aspect-video overflow-hidden rounded-[28px] border border-sand/20'>
        <BauhausBackground {...args} />
      </div>
    </div>
  )
};

export const Gallery: Story = {
  render: () => {
    const variants: BauhausBackgroundType[] = ['nazca', 'autostrada', 'pompeii', 'monitor'];
    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {variants.map((variant) => (
          <div key={variant} className='space-y-3'>
            <p className='text-sm uppercase tracking-elegant text-desert'>{variant}</p>
            <div className='aspect-video overflow-hidden rounded-[20px] border border-sand/20'>
              <BauhausBackground imageUrl={sampleImage} type={variant} />
            </div>
          </div>
        ))}
      </div>
    );
  }
};
