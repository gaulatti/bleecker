import React, { StrictMode, act } from 'react';
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

// An alert raised before any AlertContainer is mounted (a page that shows
// its container only after loading, and reports a failed load) must not be
// lost, and an alert a container already showed must not come back on a
// later mount or appear twice.
describe('AlertContainer mounting', () => {
  const shown = (text: string) =>
    Array.from(document.querySelectorAll('button[aria-label="Close alert"]')).filter(button =>
      button.parentElement?.textContent?.includes(text)
    ).length;

  test('shows an alert raised before it mounted', async () => {
    showAlert('Loading failed before the page rendered.', 'error');
    await render(<AlertContainer />);
    await eventually(() => expect(shown('Loading failed before the page rendered.')).toBe(1));
  });

  test('keeps an alert raised before mount through a StrictMode remount', async () => {
    showAlert('Raised before a strict mount.', 'warning');
    await render(
      <StrictMode>
        <AlertContainer />
      </StrictMode>
    );
    await eventually(() => expect(shown('Raised before a strict mount.')).toBe(1));
  });

  test('shows an alert raised after mount once, and not again after the container remounts', async () => {
    const first = await render(<AlertContainer />);
    await act(async () => showAlert('Saved the first time.', 'success'));
    expect(shown('Saved the first time.')).toBe(1);
    await first.unmount();
    await render(<AlertContainer />);
    await act(async () => showAlert('Saved again.', 'success'));
    expect(shown('Saved again.')).toBe(1);
    expect(shown('Saved the first time.')).toBe(0);
  });

  test('does not duplicate an alert across two mounted containers', async () => {
    showAlert('Queued for two containers.', 'info');
    await render(<AlertContainer />);
    await render(<AlertContainer />);
    await eventually(() => expect(shown('Queued for two containers.')).toBe(1));
    await act(async () => showAlert('Raised with two containers.', 'info'));
    expect(shown('Raised with two containers.')).toBe(1);
    // Closing it in one container leaves nothing behind in the other.
    await click(
      Array.from(document.querySelectorAll('button[aria-label="Close alert"]')).find(button =>
        button.parentElement?.textContent?.includes('Raised with two containers.')
      )!
    );
    await eventually(() => expect(shown('Raised with two containers.')).toBe(0));
  });
});
