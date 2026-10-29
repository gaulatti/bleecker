import React, { act } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Sonner, toast } from '../../src/components/sonner';
import { click, eventually, render } from './helpers';

const wait = (ms: number) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });
const alerts = () => Array.from(document.querySelectorAll('[role=alert]'));

describe('toast without a mounted Sonner', () => {
  test('returns an empty id and ignores dismissals', () => {
    expect(toast.show({ title: 'x' })).toBe('');
    expect(toast.success('x')).toBe('');
    expect(toast.error('x')).toBe('');
    expect(toast.warning('x')).toBe('');
    expect(toast.info('x')).toBe('');
    expect(toast.dismiss('nope')).toBeUndefined();
  });
});

describe('Sonner', () => {
  test('renders toasts of every variant through the imperative API and unregisters on unmount', async () => {
    const view = await render(<Sonner position='top-center' duration={0} />);
    const region = document.querySelector('[aria-label=Notifications]')!;
    expect(region.className).toContain('top-4');
    await act(async () => {
      toast.show({ title: 'plain', description: 'details' });
      toast.success('ok');
      toast.error('bad');
      toast.warning('careful');
      toast.info('fyi', { description: 'more' });
    });
    expect(alerts().map(node => node.querySelector('p')!.textContent)).toEqual(['plain', 'ok', 'bad', 'careful', 'fyi']);
    expect(alerts()[0].textContent).toContain('details');
    expect(alerts()[1].textContent).not.toContain('details');
    await view.unmount();
    expect(toast.success('after')).toBe('');
  });

  test('dismisses by id and via the dismiss button after the exit transition', async () => {
    await render(<Sonner duration={0} />);
    let id = '';
    await act(async () => {
      id = toast.show({ title: 'one' });
      toast.show({ title: 'two' });
    });
    expect(id).not.toBe('');
    await act(async () => toast.dismiss(id));
    expect(alerts()).toHaveLength(1);
    await eventually(() => expect(alerts()[0].className).toContain('opacity-100'));
    await click(document.querySelector('button[aria-label=Dismiss]')!);
    expect(alerts()[0].className).toContain('opacity-0');
    await eventually(() => expect(alerts()).toHaveLength(0));
  });

  test('auto-dismisses after the default or per-toast duration and cancels when removed early', async () => {
    await render(<Sonner duration={30} />);
    await act(async () => {
      toast.show({ title: 'default-duration' });
      toast.show({ title: 'long', duration: 5000 });
      toast.show({ title: 'negative', duration: -1 });
    });
    await eventually(() => expect(alerts()[0].className).toContain('opacity-100'));
    await eventually(() => expect(alerts().map(node => node.querySelector('p')!.textContent)).toEqual(['long', 'negative']));
  });

  test('renders link and button actions and fires their handlers', async () => {
    const onLink = vi.fn();
    const onButton = vi.fn();
    const onDefault = vi.fn();
    await render(<Sonner duration={0} />);
    await act(async () => {
      toast.show({ title: 'link', action: { label: 'Open', onClick: onLink, variant: 'link' } });
      toast.show({ title: 'button', action: { label: 'Retry', onClick: onButton, variant: 'primary' } });
      toast.show({ title: 'default-button', action: { label: 'Undo', onClick: onDefault } });
    });
    const byText = (text: string) => Array.from(document.querySelectorAll('button')).find(button => button.textContent === text)!;
    await click(byText('Open'));
    await click(byText('Retry'));
    await click(byText('Undo'));
    expect([onLink, onButton, onDefault].map(fn => fn.mock.calls.length)).toEqual([1, 1, 1]);
  });
});
