import React, { act } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Accordion } from '../../src/components/accordion';
import { AlertDialog } from '../../src/components/alert-dialog';
import { Drawer } from '../../src/components/drawer';
import { Modal } from '../../src/components/modal';
import { Sheet } from '../../src/components/sheet';
import { Tabs } from '../../src/components/tabs';
import { click, eventually, keydown, render } from './helpers';

const wait = (ms: number) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });
const overlay = () => document.querySelector<HTMLElement>('[data-bleecker-modal-overlay]')!;
const backdrop = () => overlay().querySelector<HTMLElement>('[aria-hidden=true]')!;

describe('Modal', () => {
  test('closes from the close button and the backdrop while open', async () => {
    const onClose = vi.fn();
    await render(<Modal isOpen onClose={onClose} title='Hello' className='x'>body</Modal>);
    expect(document.querySelector('h2')!.textContent).toBe('Hello');
    await click(document.querySelector('button[aria-label=Close]')!);
    await click(backdrop());
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  test('ignores close requests while it is animating out and unmounts afterwards', async () => {
    const onClose = vi.fn();
    const view = await render(<Modal isOpen onClose={onClose} title='Hello'>body</Modal>);
    await view.rerender(<Modal isOpen={false} onClose={onClose} title='Hello'>body</Modal>);
    expect(overlay()).not.toBeNull();
    await click(backdrop());
    await click(document.querySelector('button[aria-label=Close]')!);
    expect(onClose).not.toHaveBeenCalled();
    await eventually(() => expect(document.querySelector('[role=dialog]')).toBeNull());
  });
});

describe('open transitions', () => {
  const overlays = (isOpen: boolean) => (
    <>
      <Modal isOpen={isOpen} onClose={() => undefined} title='M'>m</Modal>
      <Sheet isOpen={isOpen} onClose={() => undefined} title='S'>s</Sheet>
      <Drawer isOpen={isOpen} onClose={() => undefined} title='D'>d</Drawer>
      <AlertDialog isOpen={isOpen} title='A' onConfirm={() => undefined} onCancel={() => undefined} />
    </>
  );

  test('every overlay reaches its visible state after mounting and fades out when closed', async () => {
    const view = await render(overlays(true));
    await eventually(() => {
      expect(document.querySelector('[role=dialog][data-state=open]')).not.toBeNull();
      expect(document.querySelector('[role=alertdialog][data-state=open]')).not.toBeNull();
      expect(document.querySelectorAll('.opacity-100').length).toBeGreaterThanOrEqual(4);
    });
    await view.rerender(overlays(false));
    expect(document.querySelector('[role=dialog][data-state=closing]')).not.toBeNull();
    expect(document.querySelectorAll('.opacity-0').length).toBeGreaterThanOrEqual(4);
    await eventually(() => expect(document.querySelector('[role=dialog]')).toBeNull());
  });
});

describe('Sheet', () => {
  test.each(['left', 'right', 'top', 'bottom'] as const)('%s sheet with title and description', async side => {
    const onClose = vi.fn();
    await render(<Sheet isOpen onClose={onClose} side={side} title='T' description='D' className='x'>content</Sheet>);
    const dialog = document.querySelector('[role=dialog]')!;
    expect(dialog.getAttribute('aria-labelledby')).not.toBeNull();
    expect(dialog.getAttribute('aria-describedby')).not.toBeNull();
    expect(dialog.getAttribute('aria-label')).toBeNull();
    await click(document.querySelector('button[aria-label=Close]')!);
    expect(onClose).toHaveBeenCalled();
  });

  test('without title shows a bare header, labels the dialog and can disable content scrolling', async () => {
    const onClose = vi.fn();
    const view = await render(<Sheet isOpen onClose={onClose} scrollContent={false}>content</Sheet>);
    const dialog = document.querySelector('[role=dialog]')!;
    expect(dialog.getAttribute('aria-label')).toBe('Dialog');
    expect(dialog.getAttribute('aria-describedby')).toBeNull();
    expect(dialog.textContent).toContain('content');
    expect(dialog.querySelector('.overflow-y-auto')).toBeNull();
    await click(backdrop());
    expect(onClose).toHaveBeenCalled();
    await view.rerender(<Sheet isOpen onClose={onClose} description='Only description'>content</Sheet>);
    expect(document.querySelector('h2')).toBeNull();
    expect(document.body.textContent).toContain('Only description');
    expect(document.querySelector('[role=dialog] .overflow-y-auto')).not.toBeNull();
  });

  test('a title without description omits the description paragraph', async () => {
    await render(<Sheet isOpen onClose={() => undefined} title='Only title'>content</Sheet>);
    expect(document.querySelector('[role=dialog] p')).toBeNull();
  });
});

describe('Drawer', () => {
  const touch = (element: Element, type: 'touchstart' | 'touchend', y: number) => act(async () => {
    const point = new Touch({ identifier: 1, target: element, clientX: 0, clientY: y });
    element.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === 'touchstart' ? [point] : [], changedTouches: [point] }));
  });

  test('renders title and description and closes from the backdrop', async () => {
    const onClose = vi.fn();
    await render(<Drawer isOpen onClose={onClose} title='T' description='D' className='x'>content</Drawer>);
    const dialog = document.querySelector('[role=dialog]')!;
    expect(dialog.getAttribute('aria-labelledby')).not.toBeNull();
    expect(dialog.getAttribute('aria-describedby')).not.toBeNull();
    await click(backdrop());
    expect(onClose).toHaveBeenCalled();
  });

  test('labels untitled drawers and handles header variants', async () => {
    const view = await render(<Drawer isOpen onClose={() => undefined}>content</Drawer>);
    expect(document.querySelector('[role=dialog]')!.getAttribute('aria-label')).toBe('Dialog');
    expect(document.querySelector('h2')).toBeNull();
    await view.rerender(<Drawer isOpen onClose={() => undefined} description='Only description'>content</Drawer>);
    expect(document.querySelector('h2')).toBeNull();
    await view.rerender(<Drawer isOpen onClose={() => undefined} title='Only title'>content</Drawer>);
    expect(document.querySelector('p')).toBeNull();
  });

  test('a long downward swipe closes it; short swipes and stray touch ends do not', async () => {
    const onClose = vi.fn();
    await render(<Drawer isOpen onClose={onClose}>content</Drawer>);
    const dialog = document.querySelector('[role=dialog]')!;
    await touch(dialog, 'touchend', 500);
    expect(onClose).not.toHaveBeenCalled();
    await touch(dialog, 'touchstart', 100);
    await touch(dialog, 'touchend', 130);
    expect(onClose).not.toHaveBeenCalled();
    await touch(dialog, 'touchstart', 100);
    await touch(dialog, 'touchend', 200);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('AlertDialog', () => {
  test('confirms and cancels, with default labels and a plain variant', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    await render(<AlertDialog isOpen title='Sure?' onConfirm={onConfirm} onCancel={onCancel} />);
    const dialog = document.querySelector('[role=alertdialog]')!;
    expect(dialog.getAttribute('aria-describedby')).toBeNull();
    expect(dialog.querySelector('p')).toBeNull();
    const buttons = Array.from(dialog.querySelectorAll('button'));
    expect(buttons.map(button => button.textContent)).toEqual(['Cancel', 'Continue']);
    await click(buttons[1]);
    expect(onConfirm).toHaveBeenCalled();
    await click(buttons[0]);
    expect(onCancel).toHaveBeenCalledTimes(1);
    await click(backdrop());
    expect(onCancel).toHaveBeenCalledTimes(2);
    await keydown(document, 'Escape');
    expect(onCancel).toHaveBeenCalledTimes(3);
  });

  test('destructive variant with description and custom labels', async () => {
    await render(<AlertDialog isOpen title='Delete?' description='Cannot undo' variant='destructive' cancelLabel='No' confirmLabel='Yes' onConfirm={() => undefined} onCancel={() => undefined} className='x' />);
    const dialog = document.querySelector('[role=alertdialog]')!;
    expect(dialog.getAttribute('aria-describedby')).not.toBeNull();
    expect(dialog.textContent).toContain('Cannot undo');
    expect(dialog.querySelector('.border-terracotta\\/15')).not.toBeNull();
    expect(Array.from(dialog.querySelectorAll('button')).map(button => button.textContent)).toEqual(['No', 'Yes']);
  });

  test('while loading it disables actions and cannot be cancelled', async () => {
    const onCancel = vi.fn();
    await render(<AlertDialog isOpen confirmLoading title='Working' confirmLabel='Save' onConfirm={() => undefined} onCancel={onCancel} />);
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[role=alertdialog] button'));
    expect(buttons.every(button => button.disabled)).toBe(true);
    expect(buttons[1].querySelector('svg')).not.toBeNull();
    await click(backdrop());
    await keydown(document, 'Escape');
    expect(onCancel).not.toHaveBeenCalled();
  });

  test('ignores cancel requests while closing', async () => {
    const onCancel = vi.fn();
    const view = await render(<AlertDialog isOpen title='T' onConfirm={() => undefined} onCancel={onCancel} />);
    await view.rerender(<AlertDialog isOpen={false} title='T' onConfirm={() => undefined} onCancel={onCancel} />);
    await click(backdrop());
    expect(onCancel).not.toHaveBeenCalled();
    await wait(250);
  });
});

describe('Accordion', () => {
  const items = [
    { id: 'a', title: 'A', subtitle: 'sub', content: <p>content a</p>, actions: <button id='act'>act</button> },
    { id: 'b', title: 'B', content: <p>content b</p> }
  ];

  test('expands one item at a time and collapses on a second click', async () => {
    await render(<Accordion items={items} className='x' />);
    const toggles = () => Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-expanded]'));
    expect(toggles().map(button => button.getAttribute('aria-expanded'))).toEqual(['false', 'false']);
    expect(document.body.textContent).toContain('sub');
    expect(document.getElementById('act')).not.toBeNull();
    await click(toggles()[0]);
    expect(toggles().map(button => button.getAttribute('aria-expanded'))).toEqual(['true', 'false']);
    await click(toggles()[1]);
    expect(toggles().map(button => button.getAttribute('aria-expanded'))).toEqual(['false', 'true']);
    await click(toggles()[1]);
    expect(toggles().map(button => button.getAttribute('aria-expanded'))).toEqual(['false', 'false']);
  });

  test('can start expanded', async () => {
    await render(<Accordion items={items} defaultExpandedId='b' />);
    expect(document.querySelectorAll('button[aria-expanded=true]')).toHaveLength(1);
  });
});

describe('Tabs', () => {
  const tabs = [{ id: 'one', label: 'One', panelId: 'p1' }, { id: 'two', label: 'Two' }, { id: 'three', label: 'Three' }];

  test.each([
    ['underline', 'sm'],
    ['segmented', 'md'],
    ['enclosed', 'lg']
  ] as const)('%s tabs at size %s mark the active tab', async (variant, size) => {
    const onChange = vi.fn();
    await render(<Tabs tabs={tabs} activeTab='two' variant={variant} size={size} stretch onChange={onChange} className='x' />);
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[role=tab]'));
    expect(document.querySelector('[role=tablist]')!.getAttribute('aria-label')).toBe('Tabs');
    expect(buttons.map(button => button.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
    expect(buttons.map(button => button.tabIndex)).toEqual([-1, 0, -1]);
    expect(buttons[0].getAttribute('aria-controls')).toBe('p1');
    await click(buttons[0]);
    expect(onChange).toHaveBeenCalledWith('one');
  });

  test('keyboard navigation wraps, jumps and ignores other keys', async () => {
    const onChange = vi.fn();
    await render(<Tabs tabs={tabs} activeTab='one' onChange={onChange} aria-label='Sections' />);
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[role=tab]'));
    await keydown(buttons[0], 'ArrowLeft');
    expect(onChange).toHaveBeenLastCalledWith('three');
    await keydown(buttons[2], 'ArrowRight');
    expect(onChange).toHaveBeenLastCalledWith('one');
    await keydown(buttons[1], 'ArrowRight');
    expect(onChange).toHaveBeenLastCalledWith('three');
    await keydown(buttons[1], 'Home');
    expect(onChange).toHaveBeenLastCalledWith('one');
    await keydown(buttons[1], 'End');
    expect(onChange).toHaveBeenLastCalledWith('three');
    const calls = onChange.mock.calls.length;
    await keydown(buttons[1], 'a');
    expect(onChange.mock.calls.length).toBe(calls);
    expect(document.activeElement).toBe(buttons[2]);
  });

  test('works without handlers', async () => {
    await render(<Tabs tabs={tabs} />);
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[role=tab]'));
    await click(buttons[0]);
    await keydown(buttons[0], 'ArrowRight');
  });

  test('link tabs render navigation links with the default or a custom renderer', async () => {
    const linkTabs = [{ id: 'a', label: 'A', href: '/a' }, { id: 'b', label: 'B', href: 'https://example.invalid', external: true }];
    await render(<Tabs tabs={linkTabs} activeTab='a' />);
    const nav = document.querySelector('nav')!;
    expect(nav.getAttribute('role')).toBeNull();
    expect(Array.from(nav.querySelectorAll('a')).map(link => link.getAttribute('href'))).toEqual(['/a', 'https://example.invalid']);
    await render(<Tabs tabs={linkTabs} renderLink={({ item, className, children }) => <span data-custom={item.href} className={className}>{children}</span>} />);
    expect(document.querySelectorAll('[data-custom]')).toHaveLength(2);
  });
});
