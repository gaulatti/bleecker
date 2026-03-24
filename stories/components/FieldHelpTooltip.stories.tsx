import type { Meta, StoryObj } from '@storybook/react-vite';

import { FieldHelpTooltip } from '../../src/components/field-help-tooltip';

const meta = {
  component: FieldHelpTooltip,
  title: 'Components/FieldHelpTooltip',
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof FieldHelpTooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'This field is required to complete your profile. Use a valid email address.'
  }
};

export const InlineWithLabel: Story = {
  render: () => (
    <div className='flex items-center gap-1.5'>
      <label className='text-sm font-medium text-text-primary dark:text-text-primary'>Email address</label>
      <FieldHelpTooltip text='We use your email to send account notifications. It will never be shared with third parties.' />
    </div>
  )
};

export const InlineWithInput: Story = {
  render: () => (
    <div className='w-72 space-y-1.5'>
      <div className='flex items-center gap-1.5'>
        <label className='text-sm font-medium text-text-primary dark:text-text-primary'>API Key</label>
        <FieldHelpTooltip text='Your API key is a secret credential. Never share it publicly or commit it to version control.' />
      </div>
      <input
        type='text'
        placeholder='sk-••••••••••••'
        className='w-full rounded-lg border border-sand/20 bg-white px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-sea dark:border-sand/40 dark:bg-sand/10 dark:text-text-primary dark:focus:ring-accent-blue'
      />
    </div>
  )
};
