import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import '../src/styles/global.css';
import { themes } from '../src/tokens/source';
import { ControlFocusContrastFixture } from '../stories/components/control-focus-contrast-fixture';

let root: Root | undefined;
let container: HTMLDivElement | undefined;
const initialHash = location.hash;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

async function mount(theme: 'light' | 'dark') {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root!.render(<ControlFocusContrastFixture theme={theme} />));
  await expect.poll(() => document.documentElement.classList.contains('dark')).toBe(theme === 'dark');
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
  document.documentElement.classList.remove('dark');
  history.replaceState(null, '', `${location.pathname}${location.search}${initialHash}`);
});

type Color = [number, number, number, number];

function color(value: string): Color {
  if (!CSS.supports('color', value)) throw new Error(`Unsupported computed CSS color: ${value}`);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('An sRGB canvas is required to inspect computed CSS colors');
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  return [pixel[0], pixel[1], pixel[2], pixel[3] / 255];
}

function opaque(value: string): Color {
  const parsed = color(value);
  if (parsed[3] !== 1) throw new Error(`Expected an opaque adjacent background, received ${value}`);
  return parsed;
}

function contrast(a: Color, b: Color) {
  const luminance = (channels: Color) => channels.slice(0, 3).map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

function shadows(value: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index++) {
    if (value[index] === '(') depth++;
    if (value[index] === ')') depth--;
    if (value[index] === ',' && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  if (depth !== 0) throw new Error(`Unbalanced computed shadow: ${value}`);
  parts.push(value.slice(start).trim());
  return parts.map(part => {
    const match = /^(.*\)) (-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px$/.exec(part);
    if (!match) throw new Error(`Unsupported computed shadow layer: ${part}`);
    return { cssColor: match[1], color: color(match[1]), x: Number(match[2]), y: Number(match[3]), blur: Number(match[4]), spread: Number(match[5]) };
  });
}

async function tabTo(element: HTMLElement) {
  // Vitest 4.1.1's provider sends a real Tab key. Never focus the target
  // directly or force a pseudo-state: the keyboard boundary is the regression.
  const order = Array.from(container!.querySelectorAll<HTMLElement>('button, a[href]'));
  const index = order.indexOf(element);
  if (index < 1) throw new Error('The target must follow the fixture start button');
  await userEvent.click(page.getByRole('button', { name: 'Begin focus sequence', exact: true }));
  for (let step = 0; step < index; step++) await userEvent.tab();
  expect(document.activeElement).toBe(element);
  expect(element.matches(':focus-visible')).toBe(true);
  const style = getComputedStyle(element);
  const milliseconds = (value: string) => parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000);
  const duration = Math.max(...style.transitionDuration.split(',').map(milliseconds));
  const delay = Math.max(...style.transitionDelay.split(',').map(milliseconds));
  await new Promise(resolve => setTimeout(resolve, duration + delay + 50));
  expect(document.activeElement).toBe(element);
  expect(element.matches(':focus-visible')).toBe(true);
}

function inspectIndicator(element: HTMLElement, surface: HTMLElement, theme: 'light' | 'dark', label: string) {
  const style = getComputedStyle(element);
  expect(style.opacity).toBe('1');
  expect(style.filter).toBe('none');
  expect(style.mixBlendMode).toBe('normal');
  expect(style.outlineStyle).toBe('none');
  const backingStyle = getComputedStyle(surface);
  expect(backingStyle.opacity).toBe('1');
  expect(backingStyle.backgroundImage).toBe('none');
  expect(backingStyle.filter).toBe('none');
  expect(backingStyle.mixBlendMode).toBe('normal');
  const background = opaque(backingStyle.backgroundColor);
  const layers = shadows(style.boxShadow);
  const ringLayers = layers.filter(layer => layer.x === 0 && layer.y === 0 && layer.blur === 0 && layer.spread === 4);
  const offsetLayers = layers.filter(layer => layer.x === 0 && layer.y === 0 && layer.blur === 0 && layer.spread === 2);
  expect(ringLayers).toHaveLength(1);
  expect(offsetLayers).toHaveLength(1);
  const ring = ringLayers[0];
  const offset = offsetLayers[0];
  expect(offset.color).toEqual(color(theme === 'dark' ? themes.dark.deepSea : '#ffffff'));
  expect(offset.color[3]).toBe(1);
  // The outer ring pixel is source-over the actual opaque section. The
  // adjacent inner edge is the separate opaque 2px offset, not an invented
  // alpha fallback or the control's transparent background.
  const rendered = ring.color.map((channel, index) => index < 3 ? channel * ring.color[3] + background[index] * (1 - ring.color[3]) : 1) as Color;
  const outerContrast = contrast(rendered, background);
  const innerContrast = contrast(rendered, offset.color);
  console.info('control-focus-measurement', JSON.stringify({ theme, label, active: document.activeElement === element, focusVisible: element.matches(':focus-visible'), outline: style.outline, boxShadow: style.boxShadow, controlBackground: style.backgroundColor, surface: getComputedStyle(surface).backgroundColor, ringAlpha: ring.color[3], rendered, outerContrast, innerContrast }));
  expect(outerContrast, `${theme} ${label}: actual keyboard ring against outer surface`).toBeGreaterThanOrEqual(3);
  expect(innerContrast, `${theme} ${label}: actual keyboard ring against inner offset`).toBeGreaterThanOrEqual(3);
  return ring.color;
}

describe('control keyboard focus on themed surfaces', () => {
  for (const theme of ['light', 'dark'] as const) {
    const surfaces = [
      { label: 'Canvas', token: 'background' as const },
      { label: 'Card', token: 'card' as const },
      { label: 'Muted', token: 'muted' as const },
      ...(theme === 'dark' ? [{ label: 'Dark sand', token: 'darkSand' as const }] : [])
    ];
    for (const surface of surfaces) {
      for (const kind of ['button', 'anchor', 'icon'] as const) {
        test(`${theme} ${surface.label} ${kind} has a contrasting actual keyboard ring`, async () => {
          await mount(theme);
          const element = page.getByRole(kind === 'anchor' ? 'link' : 'button', { name: `${surface.label} ${kind}`, exact: true }).element() as HTMLElement;
          const backing = container!.querySelector<HTMLElement>(`[data-focus-surface="${surface.label}"]`)!;
          expect(opaque(getComputedStyle(backing).backgroundColor)).toEqual(color(themes[theme][surface.token]));
          await tabTo(element);
          inspectIndicator(element, backing, theme, `${surface.label} ${kind}`);
        });
      }
    }

    test(`${theme} existing close button is a keyboard-focus positive control`, async () => {
      await mount(theme);
      const element = page.getByRole('button', { name: 'Card close', exact: true }).element() as HTMLElement;
      await tabTo(element);
      inspectIndicator(element, container!.querySelector<HTMLElement>('[data-focus-surface="Card"]')!, theme, 'Card close');
    });

    test(`${theme} an explicit caller focus color remains authoritative`, async () => {
      await mount(theme);
      const element = page.getByRole('button', { name: 'Explicit focus override', exact: true }).element() as HTMLElement;
      await tabTo(element);
      const ring = inspectIndicator(element, container!.querySelector<HTMLElement>('[data-focus-surface="Card"]')!, theme, 'caller override');
      expect(ring).toEqual(color(themes[theme].textPrimary));
    });

    test(`${theme} keyboard and pointer activation remain intact`, async () => {
      await mount(theme);
      const button = page.getByRole('button', { name: 'Canvas button', exact: true }).element() as HTMLElement;
      const anchor = page.getByRole('link', { name: 'Canvas anchor', exact: true }).element() as HTMLElement;
      const icon = page.getByRole('button', { name: 'Canvas icon', exact: true }).element() as HTMLElement;
      const status = () => container!.querySelector('[role="status"]')!.textContent;
      await tabTo(button);
      await act(async () => userEvent.keyboard(' '));
      await expect.poll(status).toBe('Canvas button activated (1)');
      await userEvent.tab();
      expect(document.activeElement).toBe(anchor);
      expect(anchor.matches(':focus-visible')).toBe(true);
      await act(async () => userEvent.keyboard('{Enter}'));
      await expect.poll(status).toBe('Canvas anchor activated (2)');
      expect(location.hash).toBe('#control-focus-target');
      await tabTo(icon);
      await act(async () => userEvent.keyboard(' '));
      await expect.poll(status).toBe('Canvas icon activated (3)');
      await act(async () => userEvent.click(button));
      await expect.poll(status).toBe('Canvas button activated (4)');
    });
  }
});
