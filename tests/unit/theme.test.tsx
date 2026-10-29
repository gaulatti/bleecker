import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ThemeToggle } from '../../src/components/theme-toggle';
import { ThemeProvider, useTheme } from '../../src/theme/theme-provider';
import { BleeckerThemeScript, getThemeScript, resolveTheme } from '../../src/theme/theme-script';
import { click, render } from './helpers';

let prefersDark = false;
const listeners = new Set<() => void>();
const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  prefersDark = false;
  listeners.clear();
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  window.matchMedia = ((query: string) => ({
    get matches() { return prefersDark; },
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb)
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

function Probe() {
  const { theme, resolvedTheme, setTheme, cycleTheme, storageKey } = useTheme();
  return (
    <div>
      <output id='state'>{`${theme}|${resolvedTheme}|${storageKey}`}</output>
      <button id='cycle' onClick={cycleTheme} />
      <button id='dark' onClick={() => setTheme('dark')} />
      <button id='light' onClick={() => setTheme('light')} />
    </div>
  );
}
const state = () => document.getElementById('state')!.textContent;
const isDark = () => document.documentElement.classList.contains('dark');
const changePreference = (value: boolean) => act(async () => { prefersDark = value; listeners.forEach(cb => cb()); });

describe('ThemeProvider (uncontrolled)', () => {
  test('defaults to system, follows the OS preference and cleans up its listener', async () => {
    const view = await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(state()).toBe('system|light|theme');
    expect(isDark()).toBe(false);
    await changePreference(true);
    expect(state()).toBe('system|dark|theme');
    expect(isDark()).toBe(true);
    await view.unmount();
    expect(listeners.size).toBe(0);
  });

  test('restores a valid stored theme and ignores an invalid one', async () => {
    localStorage.setItem('theme', 'dark');
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(state()).toBe('dark|dark|theme');
    expect(isDark()).toBe(true);
    localStorage.setItem('other', 'purple');
    await render(<ThemeProvider storageKey='other' defaultTheme='light'><Probe /></ThemeProvider>);
    expect(document.querySelectorAll('output')[1].textContent).toBe('light|light|other');
  });

  test('setTheme and cycleTheme persist the choice and update the document', async () => {
    await render(<ThemeProvider defaultTheme='light'><Probe /></ThemeProvider>);
    await click(document.getElementById('dark')!);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(isDark()).toBe(true);
    await click(document.getElementById('cycle')!);
    expect(state()).toBe('system|light|theme');
    await click(document.getElementById('cycle')!);
    expect(state()).toBe('light|light|theme');
    await click(document.getElementById('cycle')!);
    expect(state()).toBe('dark|dark|theme');
    expect(localStorage.getItem('theme')).toBe('dark');
    await click(document.getElementById('light')!);
    expect(isDark()).toBe(false);
  });
});

describe('ThemeProvider (controlled)', () => {
  test('requests changes through onThemeChange without owning state or storage', async () => {
    const onThemeChange = vi.fn();
    const view = await render(<ThemeProvider theme='dark' onThemeChange={onThemeChange}><Probe /></ThemeProvider>);
    expect(state()).toBe('dark|dark|theme');
    expect(isDark()).toBe(true);
    await click(document.getElementById('light')!);
    await click(document.getElementById('cycle')!);
    expect(onThemeChange.mock.calls).toEqual([['light'], ['system']]);
    expect(state()).toBe('dark|dark|theme');
    expect(localStorage.getItem('theme')).toBeNull();
    await view.rerender(<ThemeProvider theme='light' onThemeChange={onThemeChange}><Probe /></ThemeProvider>);
    expect(state()).toBe('light|light|theme');
    expect(isDark()).toBe(false);
  });
});

describe('useTheme and ThemeToggle', () => {
  test('useTheme outside a provider fails fast', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<Probe />)).rejects.toThrow('useTheme must be used inside a ThemeProvider');
    error.mockRestore();
  });

  test('the toggle labels the next theme and cycles through light, dark and system', async () => {
    await render(<ThemeProvider defaultTheme='light'><ThemeToggle /></ThemeProvider>);
    const toggle = () => document.querySelector<HTMLButtonElement>('button')!;
    expect(toggle().getAttribute('aria-label')).toBe('Switch to dark theme');
    await click(toggle());
    expect(toggle().getAttribute('aria-label')).toBe('Switch to system theme');
    await click(toggle());
    expect(toggle().getAttribute('aria-label')).toBe('Switch to light theme');
    await click(toggle());
    expect(toggle().getAttribute('aria-label')).toBe('Switch to dark theme');
  });
});

describe('theme script', () => {
  test('resolveTheme is re-exported from the core', () => {
    expect(resolveTheme('system', true)).toBe('dark');
  });

  test('getThemeScript embeds the storage key and applies the stored or system theme', () => {
    const run = (script: string) => new Function(script)();
    localStorage.setItem('custom', 'dark');
    run(getThemeScript('custom'));
    expect(isDark()).toBe(true);
    localStorage.setItem('theme', 'light');
    run(getThemeScript());
    expect(isDark()).toBe(false);
    localStorage.setItem('theme', 'bogus');
    prefersDark = true;
    run(getThemeScript());
    expect(isDark()).toBe(true);
  });

  test('BleeckerThemeScript renders an inline script with the default or a custom key', async () => {
    const view = await render(<><BleeckerThemeScript /><BleeckerThemeScript storageKey='k' /></>);
    const scripts = Array.from(view.container.querySelectorAll('script'));
    expect(scripts[0].textContent).toBe(getThemeScript('theme'));
    expect(scripts[1].textContent).toBe(getThemeScript('k'));
  });
});
