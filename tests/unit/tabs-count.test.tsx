import React from 'react';
import { describe, expect, test } from 'vitest';

import { Tabs } from '../../src/components/tabs';
import { render } from './helpers';

const tab = (name: string) => Array.from(document.querySelectorAll<HTMLElement>('[role=tab], a')).find((node) => node.textContent?.startsWith(name))!;

describe('Tabs counts', () => {
  test('without a count a tab renders as before', async () => {
    await render(<Tabs tabs={[{ id: 'a', label: 'Songs' }]} activeTab='a' />);
    expect(tab('Songs').innerHTML).toBe('Songs');
    expect(document.querySelector('[data-tab-count]')).toBeNull();
  });

  test('shows the count after the label and names it in full for screen readers', async () => {
    await render(<Tabs tabs={[{ id: 'a', label: 'Songs', count: 42 }, { id: 'b', label: 'Clips', count: 1 }]} activeTab='a' />);
    expect(tab('Songs').querySelector('[data-tab-count]')!.textContent).toBe('42');
    expect(tab('Songs').textContent).toBe('Songs42, 42 items');
    expect(tab('Clips').textContent).toBe('Clips1, 1 item');
    expect(tab('Songs').querySelector('[data-tab-count]')!.getAttribute('aria-hidden')).toBe('true');
  });

  test('shows zero, and hides a null count', async () => {
    await render(<Tabs tabs={[{ id: 'a', label: 'Zero', count: 0 }, { id: 'b', label: 'Null', count: null }, { id: 'c', label: 'Nan', count: Number.NaN }]} activeTab='a' />);
    expect(tab('Zero').querySelector('[data-tab-count]')!.textContent).toBe('0');
    expect(tab('Null').querySelector('[data-tab-count]')).toBeNull();
    expect(tab('Nan').querySelector('[data-tab-count]')).toBeNull();
  });

  test.each([
    [999, '999'],
    [1000, '1k'],
    [1234, '1.2k'],
    [9999, '9.9k'],
    [12_345, '12k'],
    [999_999, '999k'],
    [1_250_000, '1.2M'],
    [12_000_000, '12M']
  ])('abbreviates %i as %s and keeps the full value in the name', async (count, shown) => {
    await render(<Tabs tabs={[{ id: 'a', label: 'Big', count }]} activeTab='a' />);
    expect(tab('Big').querySelector('[data-tab-count]')!.textContent).toBe(shown);
    expect(tab('Big').textContent).toContain(`, ${count.toLocaleString('en-US')} items`);
  });

  test('shows a skeleton while a count loads, and says so', async () => {
    await render(<Tabs tabs={[{ id: 'a', label: 'Songs', count: 5, countLoading: true }]} activeTab='a' />);
    expect(tab('Songs').querySelector('[data-tab-count-loading]')).not.toBeNull();
    expect(tab('Songs').querySelector('[data-tab-count]')).toBeNull();
    expect(tab('Songs').textContent).toBe('Songs, loading count');
  });

  test('counts show on navigation tabs too, and keyboard navigation is unchanged', async () => {
    let changed = '';
    await render(
      <>
        <Tabs aria-label='nav' tabs={[{ id: 'l', label: 'Link', href: '/x', count: 3 }]} />
        <Tabs aria-label='tabs' tabs={[{ id: 'a', label: 'One', count: 1 }, { id: 'b', label: 'Two', count: 2 }]} activeTab='a' onChange={(id) => { changed = id; }} />
      </>
    );
    expect(tab('Link').querySelector('[data-tab-count]')!.textContent).toBe('3');
    tab('One').focus();
    tab('One').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(changed).toBe('b');
  });
});
