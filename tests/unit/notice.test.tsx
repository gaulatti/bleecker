import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Notice } from '../../src/components/notice';
import { StatePill } from '../../src/components/state-pill';
import { click, render } from './helpers';

const notice = () => document.querySelector<HTMLElement>('[data-tone]')!;

describe('Notice', () => {
  test.each([
    ['info', 'status', 'Info'],
    ['warn', 'status', 'Warning'],
    ['ok', 'status', 'Done'],
    ['bad', 'alert', 'Error']
  ] as const)('the %s tone announces as %s and names itself in words', async (tone, role, word) => {
    await render(<Notice tone={tone}>Message</Notice>);
    expect(notice().getAttribute('role')).toBe(role);
    expect(notice().textContent).toContain(word);
    expect(notice().textContent).toContain('Message');
    expect(notice().querySelector('svg')).not.toBeNull();
  });

  test('shows the title after the tone word, a custom label and a custom icon', async () => {
    await render(<Notice tone='warn' title='Quota' label='Heads up' icon={<i data-testid='own'>!</i>}>Body</Notice>);
    expect(notice().textContent).toContain('Heads up · Quota');
    expect(notice().querySelector('[data-testid=own]')).not.toBeNull();
    expect(notice().querySelector('svg')).toBeNull();
  });

  test('renders without a body, and with the action beside the message', async () => {
    await render(<Notice tone='ok' title='Saved' action={<button type='button'>Undo</button>} />);
    expect(notice().textContent).toContain('Saved');
    expect(notice().textContent).toContain('Undo');
  });

  test('offers a labelled dismiss only when asked, and calls it', async () => {
    const onDismiss = vi.fn();
    const view = await render(<Notice tone='info'>Body</Notice>);
    expect(document.querySelector('button')).toBeNull();
    await view.rerender(<Notice tone='info' onDismiss={onDismiss} dismissLabel='Close notice'>Body</Notice>);
    await click(document.querySelector('button[aria-label="Close notice"]')!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await view.rerender(<Notice tone='info' onDismiss={onDismiss}>Body</Notice>);
    expect(document.querySelector('button[aria-label="Dismiss"]')).not.toBeNull();
  });

  test('uses the same tone colours as StatePill, and StatePill is unchanged', async () => {
    await render(
      <>
        <Notice tone='bad'>x</Notice>
        <StatePill tone='bad' label='Failed' />
      </>
    );
    const pill = document.querySelector<HTMLElement>('span[data-tone=bad]')!;
    const colours = ['border-terracotta/40', 'bg-terracotta/10', 'dark:text-terracotta'];
    for (const name of colours) {
      expect(notice().className).toContain(name);
      expect(pill.className).toContain(name);
    }
    expect(pill.className).toContain('h-[22px]');
    expect(pill.className).toContain('rounded-full');
  });
});
