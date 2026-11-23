import { Pencil, Play, Trash2 } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { RowActions } from '../../src/components/row-actions';
import { StatePill } from '../../src/components/state-pill';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../src/components/table';
import { InTheme } from './theme-story';

const meta = {
  component: RowActions,
  title: 'Components/RowActions',
  args: { label: 'Station ID', items: [] },
  parameters: { layout: 'centered' }
} satisfies Meta<typeof RowActions>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => undefined;

const Rows = ({ confirmStyle }: { confirmStyle: 'dialog' | 'inline' }) => (
  <Table containerClassName='min-w-[460px]'>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
        <TableHead />
      </TableRow>
    </TableHeader>
    <TableBody>
      {['Station ID', 'Applause'].map((name, index) => (
        <TableRow key={name}>
          <TableCell>{name}</TableCell>
          <TableCell>
            <StatePill tone={index === 0 ? 'ok' : 'idle'} label={index === 0 ? 'Enabled' : 'Disabled'} />
          </TableCell>
          <TableCell>
            <RowActions
              label={name}
              confirmStyle={confirmStyle}
              primary={{ label: 'Play', icon: <Play size={14} />, onSelect: noop }}
              items={[
                { label: 'Edit', icon: <Pencil size={14} />, onSelect: noop },
                { label: 'Delete', icon: <Trash2 size={14} />, destructive: true, confirm: `Delete "${name}"?`, onSelect: noop }
              ]}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** One primary action, the rest in the menu, delete last and apart. */
export const Default: Story = { render: () => <Rows confirmStyle='dialog' /> };
export const Light: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='light'><Rows confirmStyle='dialog' /></InTheme> };
export const Dark: Story = { parameters: { themeProvider: 'story' }, render: () => <InTheme theme='dark'><Rows confirmStyle='dialog' /></InTheme> };

export const TextPrimary: Story = {
  render: () => (
    <RowActions label='Morning headlines' primary={{ label: 'Edit', onSelect: noop }} items={[{ label: 'Delete', destructive: true, confirm: 'Delete "Morning headlines"?', onSelect: noop }]} />
  )
};

/** Choosing delete asks first, in a dialog; confirming is a second, deliberate action. */
export const ConfirmDialog: Story = {
  render: () => <Rows confirmStyle='dialog' />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('More actions for Station ID'));
    const body = within(document.body);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Delete' }));
    const dialog = await body.findByRole('alertdialog');
    await waitFor(() => expect(within(dialog).getByText('Delete "Station ID"?')).toBeVisible());
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  }
};

/** The inline question replaces the row's controls; Escape cancels it. */
export const ConfirmInline: Story = {
  render: () => <Rows confirmStyle='inline' />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('More actions for Applause'));
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Delete' }));
    await waitFor(() => expect(canvas.getByText('Delete "Applause"?')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByText('Delete "Applause"?')).toBeNull();
  }
};
