import React, { act } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Alert, AlertContainer, showAlert } from '../../src/components/alert';
import { click, eventually, render } from './helpers';

const wait = (ms: number) => act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); });
const card = () => document.querySelector('[class*="shadow-"]')!;

describe('Alert', () => {
  test('fades in, auto-closes after its duration and calls onClose after the exit animation', async () => {
    const onClose = vi.fn();
    await render(<Alert message='Saved' type='success' duration={40} onClose={onClose} className='extra' />);
    expect(document.body.textContent).toContain('Saved');
    expect(card().className).toContain('extra');
    await eventually(() => expect(card().className).toContain('opacity-100'));
    await eventually(() => expect(card().className).toContain('opacity-0'));
    await eventually(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test('stays open with a non-positive duration until dismissed manually', async () => {
    const onClose = vi.fn();
    await render(<Alert message='Sticky' type='error' duration={0} onClose={onClose} />);
    await wait(50);
    expect(onClose).not.toHaveBeenCalled();
    await click(document.querySelector('button[aria-label="Close alert"]')!);
    await eventually(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  test('defaults to the info type and cancels the timer when unmounted early', async () => {
    const onClose = vi.fn();
    const view = await render(<Alert message='Info' onClose={onClose} />);
    expect(document.body.textContent).toContain('Info');
    await view.unmount();
    await wait(20);
    expect(onClose).not.toHaveBeenCalled();
  });

  test.each(['success', 'error', 'warning', 'info'] as const)('renders the %s type', async type => {
    await render(<Alert message={type} type={type} duration={0} onClose={() => undefined} />);
    expect(document.querySelector('svg')).not.toBeNull();
  });
});

describe('AlertContainer and showAlert', () => {
  test('shows queued alerts and removes one when it closes', async () => {
    await render(<AlertContainer />);
    await act(async () => {
      showAlert('first', 'success');
      showAlert('second');
    });
    expect(document.body.textContent).toContain('first');
    expect(document.body.textContent).toContain('second');
    const closeButtons = document.querySelectorAll('button[aria-label="Close alert"]');
    expect(closeButtons).toHaveLength(2);
    await click(closeButtons[0]);
    await eventually(() => expect(document.body.textContent).not.toContain('first'));
    expect(document.body.textContent).toContain('second');
    await click(document.querySelector('button[aria-label="Close alert"]')!);
    await eventually(() => expect(document.querySelectorAll('button[aria-label="Close alert"]')).toHaveLength(0));
  });
});
