import type { Meta, StoryObj } from '@storybook/react-vite';

import { SectionHeader } from '../../src/components/section-header';

const meta = {
  component: SectionHeader,
  title: 'Components/SectionHeader',
  args: {
    title: 'Component Library'
  },
  parameters: {
    layout: 'padded'
  }
} satisfies Meta<typeof SectionHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {};

export const WithDescription: Story = {
  args: {
    title: 'Component Library',
    description: 'A curated collection of reusable UI components built with Tailwind CSS and React.'
  }
};

export const WithEyebrow: Story = {
  args: {
    eyebrow: 'Design System',
    title: 'Component Library',
    description: 'A curated collection of reusable UI components built with Tailwind CSS and React.'
  }
};
