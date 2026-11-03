import React, { act } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Menubar, type MenubarMenu } from '../../src/components/menubar';
import { click, eventually, render } from './helpers';

const wait = (ms: number) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });
const trigger = (name: string) => Array.from(document.querySelectorAll<HTMLButtonElement>('[role=menubar] > div > button')).find(button => button.textContent === name)!;
const item = (name: string) => Array.from(document.querySelectorAll<HTMLButtonElement>('[role=menuitem], [role=menuitemcheckbox], [role=menuitemradio]')).find(button => button.textContent?.startsWith(name))!;
const pointer = (element: Element, type: 'pointerenter' | 'pointerleave') => act(async () => {
  element.dispatchEvent(type === 'pointerenter'
    ? new PointerEvent('pointerover', { bubbles: true, relatedTarget: document.body })
    : new PointerEvent('pointerout', { bubbles: true, relatedTarget: document.body }));
});

function menus(overrides: { onSelect?: () => void; onChecked?: (checked: boolean) => void; onRadio?: (value: string) => void } = {}): MenubarMenu[] {
  return [
    {
      trigger: 'File',
      items: [
        { type: 'item', label: 'New', onSelect: overrides.onSelect ?? (() => undefined), icon: <i data-testid='icon' />, shortcut: 'Ctrl+N' },
        { type: 'item', label: 'Open', onSelect: () => undefined },
        { type: 'item', label: 'Locked', onSelect: () => undefined, disabled: true },
        { type: 'separator' },
        { type: 'checkbox', label: 'Autosave', checked: true, shortcut: 'A', onCheckedChange: overrides.onChecked ?? (() => undefined) },
        { type: 'checkbox', label: 'Spellcheck', checked: false, onCheckedChange: () => undefined },
        {
          type: 'radioGroup',
          value: 'b',
          onValueChange: overrides.onRadio ?? (() => undefined),
          items: [
            { type: 'radio', label: 'Alpha', value: 'a', shortcut: 'F1' },
            { type: 'radio', label: 'Beta', value: 'b' }
          ]
        },
        { type: 'sub', label: 'Export', items: [{ type: 'item', label: 'PDF', onSelect: () => undefined }] }
      ]
    },
    { trigger: 'Edit', items: [{ type: 'item', label: 'Undo', onSelect: () => undefined }] }
  ];
}

describe('Menubar', () => {
  test('opens a menu on click, switches between menus and closes on a second click', async () => {
    await render(<Menubar menus={menus()} className='extra' />);
    expect(document.querySelector('[role=menu]')).toBeNull();
    await click(trigger('File'));
    expect(trigger('File').getAttribute('aria-expanded')).toBe('true');
    expect(trigger('File').className).toContain('bg-sea');
    expect(document.querySelector('[role=menu]')).not.toBeNull();
    await eventually(() => expect(document.querySelector('[role=menu]')!.className).toContain('opacity-100'));
    await click(trigger('Edit'));
    expect(trigger('File').getAttribute('aria-expanded')).toBe('false');
    expect(trigger('Edit').getAttribute('aria-expanded')).toBe('true');
    await click(trigger('Edit'));
    expect(trigger('Edit').getAttribute('aria-expanded')).toBe('false');
    await eventually(() => expect(document.querySelector('[role=menu]')).toBeNull());
  });

  test('renders items with icons, shortcuts, disabled state, separators and check states', async () => {
    await render(<Menubar menus={menus()} />);
    await click(trigger('File'));
    expect(document.querySelector('[data-testid=icon]')).not.toBeNull();
    expect(item('New').textContent).toContain('Ctrl+N');
    expect(item('Open').querySelector('span.w-4')).not.toBeNull();
    expect(item('Locked').disabled).toBe(true);
    expect(document.querySelector('[role=separator]')).not.toBeNull();
    expect(item('Autosave').getAttribute('aria-checked')).toBe('true');
    expect(item('Autosave').textContent).toContain('A');
    expect(item('Spellcheck').getAttribute('aria-checked')).toBe('false');
    expect(item('Spellcheck').textContent).toBe('Spellcheck');
    expect(item('Alpha').getAttribute('aria-checked')).toBe('false');
    expect(item('Alpha').textContent).toContain('F1');
    expect(item('Beta').getAttribute('aria-checked')).toBe('true');
    expect(item('Beta').textContent).toBe('Beta');
  });

  test('selecting an action, checkbox or radio runs its handler and closes the menu', async () => {
    const onSelect = vi.fn();
    const onChecked = vi.fn();
    const onRadio = vi.fn();
    await render(<Menubar menus={menus({ onSelect, onChecked, onRadio })} />);
    await click(trigger('File'));
    await click(item('New'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(trigger('File').getAttribute('aria-expanded')).toBe('false');
    await click(trigger('File'));
    await click(item('Autosave'));
    expect(onChecked).toHaveBeenCalledWith(false);
    await click(trigger('File'));
    await click(item('Alpha'));
    expect(onRadio).toHaveBeenCalledWith('a');
    expect(trigger('File').getAttribute('aria-expanded')).toBe('false');
  });

  test('submenus open on pointer enter, stay open over their surface and close on leave', async () => {
    await render(<Menubar menus={menus()} />);
    await click(trigger('File'));
    const sub = item('Export');
    expect(sub.getAttribute('aria-expanded')).toBe('false');
    await pointer(sub, 'pointerenter');
    expect(sub.getAttribute('aria-expanded')).toBe('true');
    const surface = Array.from(document.querySelectorAll<HTMLElement>('div')).find(node => node.className.includes('left-full'))!;
    expect(surface.textContent).toBe('PDF');
    await pointer(sub, 'pointerleave');
    expect(sub.getAttribute('aria-expanded')).toBe('false');
    await pointer(surface, 'pointerenter');
    expect(sub.getAttribute('aria-expanded')).toBe('true');
    await pointer(surface, 'pointerleave');
    expect(sub.getAttribute('aria-expanded')).toBe('false');
  });

  test('a pointer press outside closes the menu while presses inside keep it open', async () => {
    await render(<Menubar menus={menus()} />);
    await click(trigger('File'));
    await act(async () => { item('New').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    expect(trigger('File').getAttribute('aria-expanded')).toBe('true');
    await act(async () => { document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    expect(trigger('File').getAttribute('aria-expanded')).toBe('false');
  });
});
