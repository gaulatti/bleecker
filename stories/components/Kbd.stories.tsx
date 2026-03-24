import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from '../../src/components/kbd';

const meta = {
  component: Kbd,
  title: 'Components/Kbd',
  parameters: { layout: 'centered' }
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleKey: Story = {
  render: () => <Kbd>K</Kbd>
};

export const Combo: Story = {
  render: () => <Kbd keys={['⌘', 'K']} />
};

export const AllCombos: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      {[
        { label: 'Save', keys: ['⌘', 'S'] },
        { label: 'Command palette', keys: ['⌘', 'K'] },
        { label: 'Undo', keys: ['⌘', 'Z'] },
        { label: 'Select all', keys: ['⌘', 'A'] },
        { label: 'Copy', keys: ['⌘', 'C'] }
      ].map(({ label, keys }) => (
        <div key={label} className='flex items-center justify-between gap-8'>
          <span className='text-sm text-text-primary dark:text-text-primary'>{label}</span>
          <Kbd keys={keys} />
        </div>
      ))}
    </div>
  )
};

export const InText: Story = {
  render: () => (
    <p className='text-sm text-text-primary dark:text-text-primary'>
      Press <Kbd keys={['⌘', 'K']} /> to open the command palette, or <Kbd>Esc</Kbd> to close it.
    </p>
  )
};
