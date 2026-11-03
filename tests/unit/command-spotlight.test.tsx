import React, { act } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { CommandSpotlight, type CommandSpotlightAction } from '../../src/components/command-spotlight';
import { click, eventually, flush, keydown, render, type } from './helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

const input = () => document.querySelector<HTMLInputElement>('input[aria-label="Search commands"]')!;
const optionTitles = () => Array.from(document.querySelectorAll('[role=dialog] section button p.truncate.text-sm')).map(node => node.textContent);
const trigger = () => document.querySelector<HTMLButtonElement>('button[aria-label="Open command spotlight"]')!;
const selected = () => document.querySelector('[role=dialog] section button.text-sea')?.textContent ?? null;

const actions: CommandSpotlightAction[] = [
  { id: 'a', title: 'Alpha', description: 'First action', group: 'Letters', shortcut: ['G', 'A'], icon: <i data-testid='icon' /> },
  { id: 'b', title: 'Beta', keywords: ['second'], group: 'Letters' },
  { id: 'c', title: 'Gamma', disabled: true },
  { id: 'd', title: 'Delta', group: '  ' }
];

async function open() {
  await click(trigger());
  await eventually(() => expect(document.querySelector('[role=dialog]')!.className).toContain('opacity-100'));
}

describe('CommandSpotlight', () => {
  test('opens from the trigger, groups actions, and shows descriptions, icons and shortcuts', async () => {
    const onOpenChange = vi.fn();
    await render(<CommandSpotlight actions={actions} onOpenChange={onOpenChange} />);
    expect(document.querySelector('[role=dialog]')).toBeNull();
    await open();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(optionTitles()).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta']);
    const headings = Array.from(document.querySelectorAll('[role=dialog] section > p')).map(node => node.textContent);
    expect(headings).toEqual(['Letters', 'Actions']);
    expect(document.querySelector('[data-testid=icon]')).not.toBeNull();
    expect(document.body.textContent).toContain('First action');
    expect(document.querySelector('[role=dialog] [aria-label="G+A"]')).not.toBeNull();
    expect(selected()).toContain('Alpha');
  });

  test('filters by title, description, keywords and href, and shows the empty message', async () => {
    await render(<CommandSpotlight actions={[...actions, { id: 'e', title: 'Docs', href: '#unique-href' }]} emptyMessage='Nothing here' />);
    await open();
    await type(input(), 'second');
    expect(optionTitles()).toEqual(['Beta']);
    await type(input(), 'FIRST ');
    expect(optionTitles()).toEqual(['Alpha']);
    await type(input(), 'unique-href');
    expect(optionTitles()).toEqual(['Docs']);
    await type(input(), 'zzz');
    expect(document.querySelector('[role=dialog]')!.textContent).toContain('Nothing here');
    await type(input(), '');
    expect(optionTitles()).toHaveLength(5);
  });

  test('moves the selection with arrow keys, skipping disabled actions and wrapping', async () => {
    await render(<CommandSpotlight actions={actions} />);
    await open();
    expect(selected()).toContain('Alpha');
    await keydown(input(), 'ArrowDown');
    expect(selected()).toContain('Beta');
    await keydown(input(), 'ArrowDown');
    expect(selected()).toContain('Delta');
    await keydown(input(), 'ArrowDown');
    expect(selected()).toContain('Alpha');
    await keydown(input(), 'ArrowUp');
    expect(selected()).toContain('Delta');
    await keydown(input(), 'x');
    expect(selected()).toContain('Delta');
  });

  test('hovering selects an enabled action and ignores disabled ones', async () => {
    await render(<CommandSpotlight actions={actions} />);
    await open();
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[role=dialog] section button'));
    await act(async () => buttons[1].dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(selected()).toContain('Beta');
    await act(async () => buttons[2].dispatchEvent(new MouseEvent('mouseover', { bubbles: true })));
    expect(selected()).toContain('Beta');
  });

  test('has no selection and ignores navigation and Enter when no action is selectable', async () => {
    const onActionSelect = vi.fn();
    await render(<CommandSpotlight actions={[{ id: 'x', title: 'Off', disabled: true }]} onActionSelect={onActionSelect} />);
    await open();
    await keydown(input(), 'ArrowDown');
    await keydown(input(), 'ArrowUp');
    await keydown(input(), 'Enter');
    expect(selected()).toBeNull();
    expect(onActionSelect).not.toHaveBeenCalled();
  });

  test('runs onSelect for Enter and click, reports the action and closes', async () => {
    const onSelect = vi.fn();
    const onActionSelect = vi.fn();
    const items: CommandSpotlightAction[] = [{ id: 'run', title: 'Run', onSelect }, { id: 'off', title: 'Off', disabled: true, onSelect }];
    await render(<CommandSpotlight actions={items} onActionSelect={onActionSelect} />);
    await open();
    await keydown(input(), 'Enter');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onActionSelect).toHaveBeenCalledWith(items[0]);
    expect(document.querySelector('[role=dialog][aria-modal]')?.closest('[aria-hidden=true]')).not.toBeNull();
    await open();
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[role=dialog] section button'));
    await click(buttons[0]);
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  test('a disabled action cannot be clicked', async () => {
    const onSelect = vi.fn();
    await render(<CommandSpotlight actions={[{ id: 'off', title: 'Off', disabled: true, onSelect }]} />);
    await open();
    const button = document.querySelector<HTMLButtonElement>('[role=dialog] section button')!;
    expect(button.disabled).toBe(true);
    await click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });

  test('logs synchronous and asynchronous action failures without throwing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const items: CommandSpotlightAction[] = [
      { id: 'sync', title: 'Sync', onSelect: () => { throw new Error('sync boom'); } },
      { id: 'async', title: 'Async', onSelect: () => Promise.reject(new Error('async boom')) },
      { id: 'void', title: 'Void', onSelect: () => undefined }
    ];
    await render(<CommandSpotlight actions={items} />);
    for (const index of [0, 1, 2]) {
      await open();
      await click(document.querySelectorAll<HTMLButtonElement>('[role=dialog] section button')[index]);
      await flush();
    }
    expect(error).toHaveBeenCalledTimes(2);
    expect(error.mock.calls.map(call => String((call[1] as Error).message))).toEqual(['sync boom', 'async boom']);
  });

  test('opens external hrefs in a new window and same-window hrefs by navigation', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const items: CommandSpotlightAction[] = [
      { id: 'ext', title: 'External', href: 'https://example.invalid/', external: true },
      { id: 'int', title: 'Internal', href: '#spotlight-nav' },
      { id: 'none', title: 'Nothing' }
    ];
    await render(<CommandSpotlight actions={items} />);
    await open();
    await click(document.querySelectorAll<HTMLButtonElement>('[role=dialog] section button')[0]);
    expect(openSpy).toHaveBeenCalledWith('https://example.invalid/', '_blank', 'noopener,noreferrer');
    await open();
    await click(document.querySelectorAll<HTMLButtonElement>('[role=dialog] section button')[1]);
    expect(window.location.hash).toBe('#spotlight-nav');
    await open();
    await click(document.querySelectorAll<HTMLButtonElement>('[role=dialog] section button')[2]);
    expect(openSpy).toHaveBeenCalledTimes(1);
    history.replaceState(null, '', location.pathname + location.search);
  });

  test('toggles with the hotkey and resets the query on close', async () => {
    const onOpenChange = vi.fn();
    await render(<CommandSpotlight actions={actions} hotkey='J' onOpenChange={onOpenChange} showTrigger={false} />);
    expect(trigger()).toBeNull();
    await keydown(document.body, 'j', { ctrlKey: true });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await type(input(), 'be');
    await keydown(document.body, 'J', { metaKey: true });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await flush();
    await keydown(document.body, 'j', { metaKey: true });
    expect(input().value).toBe('');
  });

  test('ignores other keys and hotkeys pressed inside editable controls while closed', async () => {
    const onOpenChange = vi.fn();
    await render(
      <>
        <CommandSpotlight actions={actions} onOpenChange={onOpenChange} />
        <input id='field' />
        <textarea id='area' />
        <select id='pick'><option>1</option></select>
        <div id='edit' contentEditable suppressContentEditableWarning>x</div>
        <div id='plain' />
      </>
    );
    await keydown(document.body, 'x', { ctrlKey: true });
    await keydown(document.body, 'k');
    for (const id of ['field', 'area', 'pick', 'edit']) {
      await keydown(document.getElementById(id)!, 'k', { ctrlKey: true });
    }
    expect(onOpenChange).not.toHaveBeenCalled();
    await keydown(document.getElementById('plain')!, 'k', { ctrlKey: true });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await keydown(document, 'k', { ctrlKey: true });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await flush();
    await keydown(window, 'k', { ctrlKey: true });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  test('a controlled spotlight follows the open prop and only reports requests', async () => {
    const onOpenChange = vi.fn();
    const view = await render(<CommandSpotlight actions={actions} open={false} onOpenChange={onOpenChange} />);
    await click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.querySelector('[role=dialog]')).toBeNull();
    await view.rerender(<CommandSpotlight actions={actions} open onOpenChange={onOpenChange} />);
    await flush();
    expect(document.querySelector('[role=dialog]')).not.toBeNull();
    await click(document.querySelector<HTMLButtonElement>('button[aria-label="Close command spotlight"]')!);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.querySelector('[role=dialog]')).not.toBeNull();
  });

  test.each([
    ['MacIntel', '⌘'],
    ['iPhone', '⌘'],
    ['Linux x86_64', 'Ctrl'],
    ['Win32', 'Ctrl']
  ])('shows the platform modifier in the hotkey hint on %s', async (platform, modifier) => {
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'platform');
    Object.defineProperty(navigator, 'platform', { value: platform, configurable: true });
    try {
      await render(<CommandSpotlight actions={actions} hotkey='p' />);
      const hint = document.querySelector('button[aria-label="Open command spotlight"] [role=group]')!;
      expect(hint.getAttribute('aria-label')).toBe(`${modifier}+P`);
    } finally {
      if (descriptor) Object.defineProperty(navigator, 'platform', descriptor);
      else delete (navigator as unknown as Record<string, unknown>).platform;
    }
  });

  test('Escape closes the dialog and a click inside it does not reach the backdrop', async () => {
    const onOpenChange = vi.fn();
    await render(<CommandSpotlight actions={actions} onOpenChange={onOpenChange} />);
    await open();
    await click(document.querySelector('[role=dialog]')!);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    await keydown(document, 'Escape');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
