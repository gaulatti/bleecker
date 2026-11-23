import type { Meta, StoryObj } from '@storybook/react-vite';

import { CoverTile } from '../../src/components/cover-tile';

const meta = {
  component: CoverTile,
  title: 'Components/CoverTile',
  parameters: { layout: 'centered' },
  args: { label: 'Evening news', seed: 'evening-news', kind: 'Clip', size: 'md', ratio: '1:1' }
} satisfies Meta<typeof CoverTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: { src: 'https://picsum.photos/seed/cover-tile/240/240', label: 'Evening news' }
};

export const Fallback: Story = {
  args: { seed: 'Lucia Bianchi', label: 'Lucia Bianchi theme' }
};

export const BrokenImageFallsBack: Story = {
  args: { src: 'https://invalid.example/missing.jpg', seed: 'Broken art', label: 'Broken art' }
};

export const Small: Story = { args: { size: 'sm', seed: 'small' } };
export const Large: Story = { args: { size: 'lg', seed: 'large' } };
export const Video16x9: Story = { args: { ratio: '16:9', size: 'lg', posterSrc: 'https://picsum.photos/seed/poster/480/270', label: 'Clip poster' } };
export const OnAir: Story = { args: { badge: <span className='rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-semibold text-white'>On air</span>, label: 'Scene on air', seed: 'scene' } };
export const DarkSurface: Story = {
  args: { seed: 'dark', label: 'Dark surface' },
  decorators: [(Story) => <div className='dark rounded-xl bg-deep-sea p-6'><Story /></div>]
};
