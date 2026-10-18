import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { version as reactDOMVersion } from 'react-dom';
import { act as legacyAct } from 'react-dom/test-utils';

import { ThemeProvider, useTheme } from '../../src/theme/theme-provider';
import type { ThemeProviderOptions } from '../../src/theme/types';
import { ThemeToggle } from '../../src/components/theme-toggle';

// Runs entirely inside JSDOM's own window; no Node/browser global mixing.
const act = React.act ?? legacyAct;
export const runtimeVersions = { react: React.version, reactDOM: reactDOMVersion };
let root: Root;
let context: ReturnType<typeof useTheme>;
let strict = false;

function Probe() {
  context = useTheme();
  return <ThemeToggle />;
}

function element(props: Omit<ThemeProviderOptions, 'children'>) {
  const provider = <ThemeProvider {...(props as ThemeProviderOptions)}><Probe /></ThemeProvider>;
  return strict ? <React.StrictMode>{provider}</React.StrictMode> : provider;
}

export function mount(props: Omit<ThemeProviderOptions, 'children'>, strictMode = false) {
  strict = strictMode;
  root = createRoot(document.getElementById('root')!);
  act(() => root.render(element(props)));
}

export function update(props: Omit<ThemeProviderOptions, 'children'>) {
  act(() => root.render(element(props)));
}

export function setTheme(theme: 'light' | 'dark' | 'system') {
  act(() => context.setTheme(theme));
}

export function cycleTheme() {
  act(() => context.cycleTheme());
}

export function clickToggle() {
  act(() => document.querySelector('button')!.click());
}

export function mediaChanged() {
  act(() => window.dispatchEvent(new Event('theme-fixture-media-change')));
}

export function snapshot() {
  return {
    theme: context.theme,
    resolvedTheme: context.resolvedTheme,
    dark: document.documentElement.classList.contains('dark'),
    toggleLabel: document.querySelector('button')!.getAttribute('aria-label')
  };
}

export function unmount() {
  act(() => root.unmount());
}
