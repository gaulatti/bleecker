import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import { resolve } from 'node:path';
import { build } from 'vite';
import { JSDOM, VirtualConsole } from 'jsdom';

let source;
before(async () => {
  const result = await build({
    configFile: false, envDir: false, publicDir: false, logLevel: 'silent',
    define: { 'process.env.NODE_ENV': JSON.stringify('development') },
    esbuild: { jsx: 'automatic' },
    build: {
      write: false, minify: false, modulePreload: false,
      lib: { entry: resolve('tests/fixtures/theme-provider.tsx'), name: 'ThemeFixture', formats: ['iife'] }
    }
  });
  const outputs = Array.isArray(result) ? result.flatMap(item => item.output) : result.output;
  source = outputs.find(output => output.type === 'chunk').code;
});

function fixture({ opaque = true, dark = false } = {}) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  virtualConsole.on('error', (...args) => errors.push(args));
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    runScripts: 'outside-only', virtualConsole,
    ...(opaque ? {} : { url: 'https://theme.example.invalid/' })
  });
  const { window } = dom;
  window.IS_REACT_ACT_ENVIRONMENT = true;
  let preference = dark;
  let storageReads = 0;
  const listeners = new Set();
  window.matchMedia = () => ({
    get matches() { return preference; },
    media: '(prefers-color-scheme: dark)',
    addEventListener(_type, callback) { listeners.add(callback); },
    removeEventListener(_type, callback) { listeners.delete(callback); }
  });
  window.addEventListener('theme-fixture-media-change', () => {
    for (const listener of listeners) listener();
  });
  if (opaque) {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    assert.throws(() => descriptor.get.call(window), { name: 'SecurityError' });
    // Count access to the genuinely throwing opaque-origin getter. A catch-based
    // implementation would still fail the zero-access assertion below.
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { storageReads++; return descriptor.get.call(window); }
    });
  }
  window.eval(source);
  assert.equal(window.ThemeFixture.runtimeVersions.react, window.ThemeFixture.runtimeVersions.reactDOM);
  return {
    api: window.ThemeFixture, window, errors,
    snapshot() { return JSON.parse(JSON.stringify(window.ThemeFixture.snapshot())); },
    storageReads() { return storageReads; },
    listenerCount() { return listeners.size; },
    async preference(value) { preference = value; await window.ThemeFixture.mediaChanged(); },
    close() { window.close(); }
  };
}

test('controlled mount, requests and parent updates never touch opaque-origin storage', async () => {
  const f = fixture();
  try {
    const first = [], latest = [];
    await f.api.mount({ theme: 'dark', onThemeChange: value => first.push(value) }, true);
    assert.deepEqual(f.snapshot(), { theme: 'dark', resolvedTheme: 'dark', dark: true, toggleLabel: 'Switch to system theme' });
    assert.deepEqual(first, [], 'mount must not echo a request');
    await f.api.setTheme('light');
    await f.api.clickToggle();
    assert.deepEqual(first, ['light', 'system']);
    assert.equal(f.snapshot().theme, 'dark', 'a refusing parent remains authoritative');
    assert.equal(f.snapshot().dark, true);
    await f.api.update({ theme: 'light', onThemeChange: value => latest.push(value) });
    assert.equal(f.snapshot().theme, 'light');
    assert.equal(f.snapshot().resolvedTheme, 'light');
    assert.equal(f.snapshot().dark, false);
    assert.equal(f.snapshot().toggleLabel, 'Switch to dark theme');
    assert.deepEqual(latest, [], 'prop updates must not echo a request');
    await f.api.cycleTheme();
    await f.api.cycleTheme();
    assert.deepEqual(latest, ['dark', 'dark'], 'cycle uses the committed prop, not a pending request');
    assert.deepEqual(first, ['light', 'system'], 'the replaced callback is not used');
    await f.api.update({ theme: 'system', onThemeChange: value => latest.push(value) });
    assert.equal(f.snapshot().resolvedTheme, 'light');
    await f.preference(true);
    assert.deepEqual(f.snapshot(), { theme: 'system', resolvedTheme: 'dark', dark: true, toggleLabel: 'Switch to light theme' });
    await f.preference(false);
    assert.equal(f.snapshot().dark, false);
    await f.api.update({ theme: 'dark', onThemeChange: value => latest.push(value) });
    await f.preference(false);
    assert.equal(f.snapshot().dark, true, 'an explicit mode ignores OS changes');
    assert.deepEqual(latest, ['dark', 'dark']);
    assert.equal(f.storageReads(), 0);
    await f.api.unmount();
    assert.equal(f.listenerCount(), 0, 'StrictMode and unmount clean up the media listener');
    await f.api.mount({ theme: 'system', onThemeChange() {} });
    assert.equal(f.storageReads(), 0, 'remount remains storage-free');
    await f.api.unmount();
    assert.deepEqual(f.errors, []);
  } finally { f.close(); }
});

test('the default provider retains stored validation, keys, defaults, writes and cycling', async () => {
  const f = fixture({ opaque: false });
  try {
    const storage = f.window.localStorage;
    storage.setItem('theme', 'dark');
    await f.api.mount({});
    assert.equal(f.snapshot().theme, 'dark');
    await f.api.setTheme('light');
    assert.equal(storage.getItem('theme'), 'light');
    await f.api.cycleTheme();
    assert.equal(storage.getItem('theme'), 'dark');
    await f.api.cycleTheme();
    assert.equal(storage.getItem('theme'), 'system');
    await f.preference(true);
    assert.equal(f.snapshot().resolvedTheme, 'dark');
    storage.setItem('custom', 'light');
    await f.api.update({ storageKey: 'custom', defaultTheme: 'dark' });
    assert.equal(f.snapshot().theme, 'light');
    await f.api.setTheme('dark');
    assert.equal(storage.getItem('custom'), 'dark');
    assert.equal(storage.getItem('theme'), 'system', 'custom writes preserve the default key');
    storage.setItem('invalid', 'unexpected');
    await f.api.update({ storageKey: 'invalid', defaultTheme: 'light' });
    assert.equal(f.snapshot().theme, 'light');
    await f.api.update({ storageKey: 'invalid', defaultTheme: 'dark' });
    assert.equal(f.snapshot().theme, 'dark', 'default changes reread even when the key stays the same');
    await f.api.update({ storageKey: 'absent', defaultTheme: 'dark' });
    assert.equal(f.snapshot().theme, 'dark');
    await f.api.unmount();
    assert.deepEqual(f.errors, []);
  } finally { f.close(); }
});

test('explicit ownership transitions preserve persistence and use the latest callback', async () => {
  const f = fixture({ opaque: false });
  try {
    const storage = f.window.localStorage;
    storage.setItem('switch', 'dark');
    const getter = Object.getOwnPropertyDescriptor(f.window, 'localStorage').get;
    let denied = true, reads = 0;
    Object.defineProperty(f.window, 'localStorage', { configurable: true, get() {
      reads++;
      if (denied) throw new f.window.DOMException('Storage denied', 'SecurityError');
      return getter.call(f.window);
    } });
    const before = [], latest = [];
    await f.api.mount({ theme: 'light', onThemeChange: value => before.push(value) });
    assert.equal(reads, 0);
    denied = false;
    await f.api.update({ storageKey: 'switch', defaultTheme: 'light' });
    assert.equal(f.snapshot().theme, 'dark');
    await f.api.setTheme('light');
    assert.equal(storage.getItem('switch'), 'light');
    const persistedReads = reads;
    denied = true;
    await f.api.update({ theme: 'system', onThemeChange: value => before.push(value) });
    await f.api.update({ theme: 'system', onThemeChange: value => latest.push(value) });
    await f.api.setTheme('dark');
    await f.api.cycleTheme();
    assert.deepEqual(before, []);
    assert.deepEqual(latest, ['dark', 'light']);
    assert.equal(f.snapshot().theme, 'system');
    assert.equal(reads, persistedReads, 'controlled phases never evaluate storage');
    await f.api.unmount();
    assert.deepEqual(f.errors, []);
  } finally { f.close(); }
});

test('an initial controlled system mode resolves a dark OS without a request or storage read', async () => {
  const f = fixture({ dark: true });
  try {
    const requests = [];
    await f.api.mount({ theme: 'system', onThemeChange: value => requests.push(value) });
    assert.equal(f.snapshot().theme, 'system');
    assert.equal(f.snapshot().resolvedTheme, 'dark');
    assert.equal(f.snapshot().dark, true);
    assert.deepEqual(requests, []);
    assert.equal(f.storageReads(), 0);
    await f.api.unmount();
    assert.deepEqual(f.errors, []);
  } finally { f.close(); }
});
