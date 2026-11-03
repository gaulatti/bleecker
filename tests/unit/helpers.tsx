import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach } from 'vitest';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mounted: Array<{ root: Root; container: HTMLElement }> = [];

export async function render(ui: React.ReactElement) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  await act(async () => root.render(ui));
  return {
    container,
    rerender: (next: React.ReactElement) => act(async () => root.render(next)),
    unmount: () => act(async () => root.unmount())
  };
}

export async function click(element: Element) {
  await act(async () => {
    (element as HTMLElement).click();
  });
}

export async function type(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  await act(async () => {
    const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

export async function keydown(element: Element | Document, key: string, init: KeyboardEventInit = {}) {
  await act(async () => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
  });
}

export async function flush() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

afterEach(async () => {
  while (mounted.length) {
    const { root, container } = mounted.pop()!;
    await act(async () => root.unmount());
    container.remove();
  }
  document.body.innerHTML = '';
});

/** Opens a Radix Select by its accessible label and chooses an option by its text. */
export async function pickSelectOption(trigger: Element, optionText: string) {
  const { userEvent } = await import('vitest/browser');
  await userEvent.click(trigger);
  const { expect } = await import('vitest');
  await expect.poll(() => document.querySelector('[role=listbox]')).not.toBeNull();
  const option = Array.from(document.querySelectorAll<HTMLElement>('[role=option]')).find(node => node.textContent === optionText);
  if (!option) throw new Error(`No option "${optionText}"`);
  await userEvent.click(option);
  await expect.poll(() => document.querySelector('[role=listbox]')).toBeNull();
}

/** Polls until the assertion passes (real timers), so tests do not depend on a fixed sleep. */
export async function eventually(assertion: () => void, timeout = 5000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      assertion();
      return;
    } catch (error) {
      if (Date.now() >= deadline) throw error;
    }
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
  }
}
