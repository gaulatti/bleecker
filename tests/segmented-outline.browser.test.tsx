// gaulatti/bleecker#557: in an outline segmented control, hovering or focusing a segment changes
// only its colour. Measured in a real browser: border widths and segment boxes are identical at
// rest and on hover, segments draw no border of their own, and every segment stays inside the
// group's rounded outline.
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';

import '../.storybook/storybook.css';
import { SegmentedOutlineFixture } from '../stories/components/segmented-outline-fixture';

let root: Root | undefined;
let container: HTMLDivElement | undefined;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function mount(theme: 'light' | 'dark') {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root!.render(<SegmentedOutlineFixture theme={theme} />));
  await expect.poll(() => document.documentElement.classList.contains('dark')).toBe(theme === 'dark');
  // Measure a settled layout. Encode Sans comes from a remote stylesheet imported by global.css;
  // when it arrives after the first measurement every segment narrows by a few pixels, which
  // would read as a hover change. `document.fonts.ready` can resolve before that stylesheet has
  // even registered the face, so wait instead until the group's width holds for 300 ms.
  const width = () => container!.querySelector('[data-segmented] [role=group]')!.getBoundingClientRect().width;
  let previous = -1;
  await expect
    .poll(
      async () => {
        const before = previous;
        previous = width();
        await new Promise((resolve) => setTimeout(resolve, 300));
        return before === previous && previous === width();
      },
      { timeout: 10_000, interval: 0 }
    )
    .toBe(true);
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
  document.documentElement.classList.remove('dark');
});

const group = () => container!.querySelector<HTMLElement>('[data-segmented] [role=group]')!;
const segments = () => [...group().querySelectorAll<HTMLButtonElement>('button')];

function box(element: HTMLElement) {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    borders: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].join(' '),
    rect: [rect.left, rect.top, rect.width, rect.height].map((value) => Math.round(value * 10) / 10).join(' ')
  };
}

describe.each(['light', 'dark'] as const)('outline segmented control, %s', (theme) => {
  test('a segment draws no border of its own; the group draws one outline', async () => {
    await mount(theme);
    expect(segments()).toHaveLength(3);
    for (const segment of segments()) expect(box(segment).borders).toBe('0px 0px 0px 0px');
    expect(box(group()).borders).toBe('1px 1px 1px 1px');
    expect(Number.parseFloat(getComputedStyle(group()).borderTopRightRadius)).toBeGreaterThan(0);
    expect(getComputedStyle(group()).overflow).toBe('hidden');
  });

  test('hovering any segment changes no border and moves nothing', async () => {
    await mount(theme);
    const rest = [group(), ...segments()].map(box);
    for (const [index, segment] of segments().entries()) {
      await userEvent.hover(segment);
      await expect.poll(() => segment.matches(':hover')).toBe(true);
      expect([group(), ...segments()].map(box), `while hovering segment ${index}`).toEqual(rest);
    }
    await userEvent.unhover(segments()[2]);
  });

  test('every segment stays inside the group outline, first and last included', async () => {
    await mount(theme);
    const outer = group().getBoundingClientRect();
    for (const segment of segments()) {
      const rect = segment.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(outer.left);
      expect(rect.right).toBeLessThanOrEqual(outer.right);
      expect(rect.top).toBeGreaterThanOrEqual(outer.top);
      expect(rect.bottom).toBeLessThanOrEqual(outer.bottom);
    }
  });

  test('keyboard focus is visible and moves nothing', async () => {
    await mount(theme);
    const rest = segments().map(box);
    container!.querySelector<HTMLButtonElement>('[data-focus-start]')!.focus();
    await userEvent.keyboard('{Tab}');
    const focused = segments()[0];
    await expect.poll(() => document.activeElement).toBe(focused);
    expect(focused.matches(':focus-visible')).toBe(true);
    expect(getComputedStyle(focused).boxShadow).not.toBe('none');
    expect(segments().map(box)).toEqual(rest);
  });
});
