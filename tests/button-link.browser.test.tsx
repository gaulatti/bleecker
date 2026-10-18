import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import '../src/styles/global.css';
import { themes } from '../src/tokens/source';
import { ButtonLinkContrastFixture } from '../stories/components/button-link-contrast-fixture';

let root: Root | undefined;
let container: HTMLDivElement | undefined;
const initialHash = window.location.hash;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function mount(theme: 'light' | 'dark') {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root!.render(<ButtonLinkContrastFixture theme={theme} />));
  await expect.poll(() => document.documentElement.classList.contains('dark')).toBe(theme === 'dark');
  await page.getByRole('heading', { name: `Link button contrast · ${theme}`, exact: true }).hover();
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
  document.documentElement.classList.remove('dark');
  history.replaceState(null, '', `${location.pathname}${location.search}${initialHash}`);
});

function rgb(hex: string) {
  return `rgb(${[1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)).join(', ')})`;
}

function luminance(color: string) {
  const match = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(color);
  if (!match) throw new Error(`Expected an opaque computed RGB color, received ${color}`);
  const channels = match.slice(1).map(value => Number(value) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground: string, background: string) {
  const [low, high] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (high + 0.05) / (low + 0.05);
}

async function hover(element: HTMLElement) {
  // Vitest 4.1.1's provider moves the real pointer; Storybook's synthetic
  // testing-library hover alone cannot establish the CSS pseudo-state.
  await userEvent.hover(element);
  expect(element.matches(':hover')).toBe(true);
  const style = getComputedStyle(element);
  const durations = style.transitionDuration.split(',').map(value => parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000));
  const delays = style.transitionDelay.split(',').map(value => parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000));
  // Read after the actual color transition, so the old rule's initial blue
  // frame cannot make a dark-hover regression pass before it turns dark.
  await new Promise(resolve => setTimeout(resolve, Math.max(...durations) + Math.max(...delays) + 50));
}

describe('link Button on themed surfaces', () => {
  for (const theme of ['light', 'dark'] as const) {
    const surfaces = [
      { label: 'Canvas', token: 'background' as const },
      { label: 'Card', token: 'card' as const },
      { label: 'Muted', token: 'muted' as const },
      ...(theme === 'dark' ? [{ label: 'Dark sand', token: 'darkSand' as const }] : [])
    ];
    for (const surface of surfaces) {
      for (const kind of ['button', 'anchor'] as const) {
        test(`${theme} ${surface.label} ${kind} keeps readable normal and true-hover text`, async () => {
          await mount(theme);
          const element = page.getByRole(kind === 'button' ? 'button' : 'link', { name: `${surface.label} ${kind}`, exact: true }).element() as HTMLElement;
          const background = container!.querySelector<HTMLElement>(`[data-link-surface="${surface.label}"]`)!;
          expect(element.matches(':hover')).toBe(false);
          expect(getComputedStyle(element).backgroundColor).toBe('rgba(0, 0, 0, 0)');
          expect(getComputedStyle(background).backgroundColor).toBe(rgb(themes[theme][surface.token]));
          await expect.poll(() => getComputedStyle(element).color).toBe(rgb(themes[theme].sea));
          expect(contrast(getComputedStyle(element).color, getComputedStyle(background).backgroundColor)).toBeGreaterThanOrEqual(4.5);
          await hover(element);
          expect(contrast(getComputedStyle(element).color, getComputedStyle(background).backgroundColor)).toBeGreaterThanOrEqual(4.5);
          expect(getComputedStyle(element).color).toBe(rgb(theme === 'dark' ? themes.dark.accentBlue : themes.light.deepSea));
          expect(getComputedStyle(element).textDecorationLine).toContain('underline');
        });
      }
    }

    test(`${theme} button and anchor retain pointer and keyboard activation`, async () => {
      await mount(theme);
      const button = page.getByRole('button', { name: 'Canvas button', exact: true }).element() as HTMLButtonElement;
      const anchor = page.getByRole('link', { name: 'Canvas anchor', exact: true }).element() as HTMLAnchorElement;
      const status = () => container!.querySelector('[role="status"]')!.textContent;
      button.focus();
      await act(async () => userEvent.keyboard(' '));
      await expect.poll(status).toBe('Canvas button activated (1)');
      await userEvent.tab();
      expect(document.activeElement).toBe(anchor);
      await act(async () => userEvent.keyboard('{Enter}'));
      await expect.poll(status).toBe('Canvas anchor activated (2)');
      expect(location.hash).toBe('#button-link-contrast-target');
      await act(async () => userEvent.click(button));
      await expect.poll(status).toBe('Canvas button activated (3)');
      await act(async () => userEvent.click(anchor));
      await expect.poll(status).toBe('Canvas anchor activated (4)');
    });
  }

  test('an explicit caller dark-hover color still wins', async () => {
    await mount('dark');
    const element = page.getByRole('button', { name: 'Explicit dark hover override', exact: true }).element() as HTMLButtonElement;
    await hover(element);
    expect(getComputedStyle(element).color).toBe(rgb(themes.dark.textPrimary));
    expect(getComputedStyle(element).textDecorationLine).toContain('underline');
    const background = container!.querySelector<HTMLElement>('[data-link-surface="Card"]')!;
    expect(contrast(getComputedStyle(element).color, getComputedStyle(background).backgroundColor)).toBeGreaterThanOrEqual(4.5);
  });
});
