import React from 'react';
import { describe, expect, test } from 'vitest';

import { Tabs, formatTabCount } from '../../src/components/tabs';
import { render } from './helpers';

const tabs = [
  { id: 'songs', label: 'Songs', count: 42 },
  { id: 'clips', label: 'Clips', count: null },
  { id: 'art', label: 'Art', countLoading: true },
  { id: 'plain', label: 'Plain' }
];

describe('Tabs counts (bleecker#567)', () => {
  test('formats counts with a thousands abbreviation', () => {
    expect(formatTabCount(0)).toBe('0');
    expect(formatTabCount(42)).toBe('42');
    expect(formatTabCount(1234)).toBe('1.2k');
    expect(formatTabCount(1000)).toBe('1k');
    expect(formatTabCount(12480)).toBe('12k');
    expect(formatTabCount(987654)).toBe('988k');
  });

  test('a count shows as a pill, with the full value in the accessible name', async () => {
    const { container } = await render(<Tabs tabs={tabs} activeTab='songs' aria-label='Media' />);
    const tab = Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]')).find((t) => t.textContent?.includes('Songs'))!;
    expect(tab.getAttribute('aria-label')).toBe('Songs, 42 items');
    expect(tab.textContent).toContain('42');
  });

  test('a null count hides the pill and keeps the plain label', async () => {
    const { container } = await render(<Tabs tabs={tabs} activeTab='clips' aria-label='Media' />);
    const clips = Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]')).find((t) => t.textContent === 'Clips')!;
    expect(clips.getAttribute('aria-label')).toBeNull();
    expect(clips.querySelector('span')).toBeNull();
  });

  test('a loading count shows a hidden skeleton, not a number', async () => {
    const { container } = await render(<Tabs tabs={tabs} activeTab='art' aria-label='Media' />);
    const art = Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]')).find((t) => t.textContent?.startsWith('Art'))!;
    const skeleton = art.querySelector('span[aria-hidden="true"]');
    expect(skeleton).not.toBeNull();
    expect(skeleton!.textContent).toBe('');
  });

  test('tabs without counts render as before', async () => {
    const { container } = await render(<Tabs tabs={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }]} activeTab='a' aria-label='Plain' />);
    expect(container.querySelectorAll('[role="tab"] span').length).toBe(0);
    expect(container.querySelector('[role="tab"][aria-label]')).toBeNull();
  });
});
