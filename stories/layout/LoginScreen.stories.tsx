import type { Meta, StoryObj } from '@storybook/react';
import { LoginScreen } from '../../src/login-screen';

const meta: Meta<typeof LoginScreen> = {
  title: 'Layout/LoginScreen',
  component: LoginScreen,
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;
type Story = StoryObj<typeof LoginScreen>;

export const Default: Story = {};
