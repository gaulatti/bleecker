import type { Meta, StoryObj } from '@storybook/react-vite';

import { PageHeader } from '../../src/components/page-header';
import { Button } from '../../src/components/button';

const meta = {
  component: PageHeader,
  title: 'Components/PageHeader',
  tags: ['autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Dashboard',
    description: 'Welcome back, here is what is happening today.',
    actions: (
      <>
        <Button variant='secondary' size='sm'>Export</Button>
        <Button size='sm'>Create</Button>
      </>
    )
  }
};

export const TitleOnly: Story = {
  args: {
    title: 'Settings'
  }
};
