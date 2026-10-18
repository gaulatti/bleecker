import type { Meta, StoryObj } from '@storybook/react-vite';

import { ControlFocusContrastFixture } from './control-focus-contrast-fixture';

const meta = {
  title: 'Components/ControlFocus',
  parameters: { layout: 'fullscreen', themeProvider: 'story' }
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LightSurfaces: Story = { render: () => <ControlFocusContrastFixture theme='light' /> };
export const DarkSurfaces: Story = { render: () => <ControlFocusContrastFixture theme='dark' /> };
