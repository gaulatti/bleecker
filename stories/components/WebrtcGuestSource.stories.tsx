import type { Meta, StoryObj } from '@storybook/react-vite';

import { WebrtcGuestSource } from '../../src/components/webrtc-guest-source';

const meta = {
  component: WebrtcGuestSource,
  title: 'Components/WebrtcGuestSource',
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof WebrtcGuestSource>;

export default meta;

type Story = StoryObj<typeof meta>;

// Storybook has no room to join, so the credentials promise never resolves and the status card shows.
const pending = () => new Promise<never>(() => {});

export const Default: Story = {
  render: () => <div className='relative h-80 w-full'><WebrtcGuestSource getCredentials={pending} slotNumber={1} /></div>
};

export const Variant: Story = {
  render: () => <div className='relative h-80 w-full'><WebrtcGuestSource getCredentials={pending} slotNumber={2} showStatus={false} suppressAudio /></div>
};
