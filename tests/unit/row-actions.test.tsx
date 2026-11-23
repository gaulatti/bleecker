import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { IconButton } from '../../src/components/icon-button';
import { RowActions } from '../../src/components/row-actions';
import { eventually, render } from './helpers';

const byLabel = (label: string) => document.querySelector<HTMLElement>(`[aria-label="${label}"]`);
const menu = () => document.querySelector('[role=menu]');
const items = () => Array.from(document.querySelectorAll('[role=menuitem]')).map((node) => node.textContent?.trim());

function Row(props: Partial<React.ComponentProps<typeof RowActions>> & { onPlay?: () => void; onEdit?: () => void; onDelete?: () => void }) {
  const { onPlay = vi.fn(), onEdit = vi.fn(), onDelete = vi.fn(), ...rest } = props;
  return (
    <RowActions
      label='Station ID'
      primary={{ label: 'Play', icon: <i>p</i>, onSelect: onPlay }}
      items={[
        { label: 'Edit', onSelect: onEdit },
        { label: 'Delete', destructive: true, confirm: 'Delete "Station ID"?', onSelect: onDelete }
      ]}
      {...rest}
    />
  );
}

describe('IconButton tone', () => {
  test('renders the same without a tone as with the neutral tone', async () => {
    await render(
      <>
        <IconButton aria-label='plain'>x</IconButton>
        <IconButton aria-label='neutral' tone='neutral'>x</IconButton>
      </>
    );
    expect(byLabel('plain')!.className).toBe(byLabel('neutral')!.className);
    expect(byLabel('plain')!.hasAttribute('data-tone')).toBe(false);
  });

  test('marks the danger tone and recolours hover and focus only', async () => {
    await render(<IconButton aria-label='danger' tone='danger'>x</IconButton>);
    const button = byLabel('danger')!;
    expect(button.dataset.tone).toBe('danger');
    expect(button.className).toContain('hover:text-terracotta');
    expect(button.className).toContain('focus-visible:ring-terracotta');
    expect(button.className).not.toContain('focus-visible:ring-sea');
  });
});

describe('RowActions', () => {
  test('shows one primary and a menu trigger, each labelled with the row', async () => {
    await render(<Row />);
    expect(byLabel('Play Station ID')).not.toBeNull();
    expect(byLabel('More actions for Station ID')).not.toBeNull();
    expect(byLabel('Delete Station ID')).toBeNull();
  });

  test('keyboard: tab to the primary, open the menu with Enter, arrow to delete, Escape closes', async () => {
    const onPlay = vi.fn();
    await render(<Row onPlay={onPlay} />);
    await userEvent.tab();
    expect(document.activeElement).toBe(byLabel('Play Station ID'));
    await userEvent.keyboard('{Enter}');
    expect(onPlay).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    expect(document.activeElement).toBe(byLabel('More actions for Station ID'));
    await userEvent.keyboard('{Enter}');
    await eventually(() => expect(menu()).not.toBeNull());
    expect(items()).toEqual(['Edit', 'Delete']);
    // Opening from the keyboard focuses the first item; one arrow reaches the destructive one.
    await eventually(() => expect(document.activeElement?.textContent?.trim()).toBe('Edit'));
    await userEvent.keyboard('{ArrowDown}');
    await eventually(() => expect(document.activeElement?.textContent?.trim()).toBe('Delete'));
    await userEvent.keyboard('{Escape}');
    await eventually(() => expect(menu()).toBeNull());
    expect(document.activeElement).toBe(byLabel('More actions for Station ID'));
  });

  test('opens the menu with Space as well', async () => {
    await render(<Row />);
    byLabel('More actions for Station ID')!.focus();
    await userEvent.keyboard(' ');
    await eventually(() => expect(menu()).not.toBeNull());
  });

  test('separates the destructive item and shows it in the danger tone', async () => {
    await render(<Row />);
    await userEvent.click(byLabel('More actions for Station ID')!);
    await eventually(() => expect(menu()).not.toBeNull());
    const rows = Array.from(menu()!.children);
    expect(rows.map((node) => node.getAttribute('role'))).toEqual(['menuitem', 'separator', 'menuitem']);
    expect((rows[2] as HTMLElement).dataset.tone).toBe('danger');
  });

  test('a plain item runs at once', async () => {
    const onEdit = vi.fn();
    await render(<Row onEdit={onEdit} />);
    await userEvent.click(byLabel('More actions for Station ID')!);
    await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=menuitem]')).find((node) => node.textContent === 'Edit')!);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test('dialog confirm: choosing delete asks first, cancel runs nothing, confirm runs it once', async () => {
    const onDelete = vi.fn();
    await render(<Row onDelete={onDelete} />);
    const open = async () => {
      await userEvent.click(byLabel('More actions for Station ID')!);
      await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=menuitem]')).find((node) => node.textContent === 'Delete')!);
      await eventually(() => expect(document.querySelector('[role=alertdialog]')).not.toBeNull());
    };
    await open();
    expect(onDelete).not.toHaveBeenCalled();
    expect(document.querySelector('[role=alertdialog]')!.textContent).toContain('Delete "Station ID"?');
    await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=alertdialog] button')).find((node) => node.textContent === 'Cancel')!);
    await eventually(() => expect(document.querySelector('[role=alertdialog]')).toBeNull());
    expect(onDelete).not.toHaveBeenCalled();
    await open();
    await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=alertdialog] button')).find((node) => node.textContent === 'Delete')!);
    await eventually(() => expect(onDelete).toHaveBeenCalledTimes(1));
  });

  test('inline confirm: the question replaces the controls, Escape cancels, Confirm runs it once', async () => {
    const onDelete = vi.fn();
    await render(<Row confirmStyle='inline' onDelete={onDelete} />);
    const open = async () => {
      await userEvent.click(byLabel('More actions for Station ID')!);
      await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=menuitem]')).find((node) => node.textContent === 'Delete')!);
      await eventually(() => expect(document.querySelector('[role=group]')).not.toBeNull());
    };
    await open();
    expect(onDelete).not.toHaveBeenCalled();
    expect(document.querySelector('[role=group]')!.textContent).toContain('Delete "Station ID"?');
    expect(byLabel('Play Station ID')).toBeNull();
    await userEvent.keyboard('{Escape}');
    await eventually(() => expect(document.querySelector('[role=group]')).toBeNull());
    expect(byLabel('Play Station ID')).not.toBeNull();
    expect(onDelete).not.toHaveBeenCalled();
    await open();
    await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=group] button')).find((node) => node.textContent === 'Delete')!);
    await eventually(() => expect(onDelete).toHaveBeenCalledTimes(1));
    expect(document.querySelector('[role=group]')).toBeNull();
  });

  test('a destructive item never runs on one click, whatever the confirm style', async () => {
    const onDelete = vi.fn();
    await render(<RowActions label='Row' items={[{ label: 'Remove', destructive: true, confirm: 'Remove the row?', onSelect: onDelete }]} />);
    await userEvent.click(byLabel('More actions for Row')!);
    await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=menuitem]')).find((node) => node.textContent === 'Remove')!);
    await eventually(() => expect(document.querySelector('[role=alertdialog]')).not.toBeNull());
    expect(onDelete).not.toHaveBeenCalled();
  });

  test('a destructive item without a confirm does not type-check', () => {
    // @ts-expect-error confirm is required on a destructive item
    const bad: React.ComponentProps<typeof RowActions>['items'] = [{ label: 'Remove', destructive: true, onSelect: () => undefined }];
    expect(bad).toHaveLength(1);
  });

  test('inline confirm: a key other than Escape leaves the question open', async () => {
    await render(<Row confirmStyle='inline' />);
    await userEvent.click(byLabel('More actions for Station ID')!);
    await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('[role=menuitem]')).find((node) => node.textContent === 'Delete')!);
    await eventually(() => expect(document.querySelector('[role=group]')).not.toBeNull());
    await userEvent.keyboard('a');
    expect(document.querySelector('[role=group]')).not.toBeNull();
  });

  test('shows an item icon in the menu, for safe and destructive items', async () => {
    await render(
      <RowActions
        label='Row'
        items={[
          { label: 'Edit', icon: <i data-testid='edit-icon'>e</i>, onSelect: () => undefined },
          { label: 'Remove', icon: <i data-testid='remove-icon'>r</i>, destructive: true, confirm: 'Remove?', onSelect: () => undefined }
        ]}
      />
    );
    await userEvent.click(byLabel('More actions for Row')!);
    await eventually(() => expect(menu()).not.toBeNull());
    expect(menu()!.querySelector('[data-testid=edit-icon]')).not.toBeNull();
    expect(menu()!.querySelector('[data-testid=remove-icon]')).not.toBeNull();
  });

  test('no primary shows only the menu; no items shows no menu', async () => {
    const view = await render(<RowActions label='Row' items={[{ label: 'Edit', onSelect: () => undefined }]} />);
    expect(byLabel('Play Row')).toBeNull();
    expect(byLabel('More actions for Row')).not.toBeNull();
    await view.rerender(<RowActions label='Row' primary={{ label: 'Open', onSelect: () => undefined }} items={[]} />);
    expect(byLabel('Open Row')).not.toBeNull();
    expect(byLabel('More actions for Row')).toBeNull();
  });
});
