import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, test } from 'vitest';

import '../.storybook/storybook.css';
import { Tabs } from '../src/components/tabs';
import { ThemeProvider } from '../src/theme/theme-provider';

let root: Root | undefined;
let container: HTMLDivElement | undefined;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
  document.documentElement.classList.remove('dark');
});

type Color = [number, number, number, number];

function color(value: string): Color {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  return [pixel[0], pixel[1], pixel[2], pixel[3] / 255];
}

function over(top: Color, bottom: Color): Color {
  const alpha = top[3] + bottom[3] * (1 - top[3]);
  return [0, 1, 2].map(index => (top[index] * top[3] + bottom[index] * bottom[3] * (1 - top[3])) / alpha).concat(alpha) as Color;
}

/** The colour behind an element: every ancestor's background composited from the page surface down. */
function backdrop(element: HTMLElement, surface: HTMLElement): Color {
  const chain: HTMLElement[] = [];
  for (let node: HTMLElement | null = element; node && node !== surface.parentElement; node = node.parentElement) chain.unshift(node);
  return chain.reduce((below, node) => over(color(getComputedStyle(node).backgroundColor), below), [255, 255, 255, 1] as Color);
}

function contrast(a: Color, b: Color) {
  const luminance = (channels: Color) => channels.slice(0, 3).map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

const surfaces = ['background', 'card', 'muted'] as const;

describe('Tabs count pill contrast on themed surfaces', () => {
  for (const theme of ['light', 'dark'] as const) {
    for (const surface of surfaces) {
      test(`${theme} on ${surface}: active and inactive counts read at 4.5:1 or better in every variant`, async () => {
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
        await act(async () =>
          root!.render(
            <ThemeProvider theme={theme} onThemeChange={() => {}}>
              <div data-surface style={{ background: `var(--color-${surface})`, padding: 16 }}>
                {(['underline', 'segmented', 'enclosed'] as const).map(variant => (
                  <Tabs key={variant} variant={variant} aria-label={variant} activeTab='a' tabs={[{ id: 'a', label: 'Active', count: 42 }, { id: 'b', label: 'Idle', count: 1234 }]} />
                ))}
              </div>
            </ThemeProvider>
          )
        );
        await expect.poll(() => document.documentElement.classList.contains('dark')).toBe(theme === 'dark');
        const page = container.querySelector<HTMLElement>('[data-surface]')!;
        const pills = Array.from(container.querySelectorAll<HTMLElement>('[data-tab-count]'));
        expect(pills).toHaveLength(6);
        for (const pill of pills) {
          const behind = backdrop(pill, page);
          const text = over(color(getComputedStyle(pill).color), behind);
          const ratio = contrast(text, behind);
          console.info('tabs-count-contrast', JSON.stringify({ theme, surface, label: pill.parentElement!.firstChild!.textContent, ratio }));
          expect(ratio, `${theme} ${surface} ${pill.parentElement!.textContent}`).toBeGreaterThanOrEqual(4.5);
        }
      });
    }
  }
});
