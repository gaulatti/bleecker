import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

// Observe the real public Select -> pinned Radix prop/callback boundary during
// SSR. This does not mount a DOM or prove the native select's post-reset effect.
const captureKey = '__bleeckerControlledResetProps';
globalThis[captureKey] = [];
const cacheDir = await mkdtemp(join(tmpdir(), 'bleecker-select-reset-'));
const server = await createServer({
  configFile: false,
  cacheDir,
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
  esbuild: { jsx: 'automatic', jsxDev: false },
  plugins: [{
    name: 'observe-controlled-select-boundary',
    enforce: 'post',
    transform(code, id) {
      if (id.endsWith('/src/components/select.tsx')) {
        return code.replace(/from ["']react\/jsx-runtime["']/g, 'from "select-reset-jsx"');
      }
    },
    resolveId(source) {
      if (source === 'select-reset-jsx') return '\0select-reset-jsx';
    },
    load(id) {
      if (id === '\0select-reset-jsx') return `
        import {jsx as actualJsx,jsxs as actualJsxs,Fragment} from 'react/jsx-runtime';
        export {Fragment};
        function capture(props) {
          if(props.name==='controlled-reset-city' && typeof props.onValueChange==='function') {
            globalThis.${captureKey}.push(props);
          }
        }
        export function jsx(type,props,key){capture(props);return actualJsx(type,props,key);}
        export function jsxs(type,props,key){capture(props);return actualJsxs(type,props,key);}
      `;
    }
  }]
});
after(async () => {
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
  delete globalThis[captureKey];
});
const { Select } = await server.ssrLoadModule('/src/components/select.tsx');
const options = [{ label: 'Madrid', value: 'mad' }, { label: 'Tokyo', value: 'tyo' }];

function render(props = {}) {
  globalThis[captureKey] = [];
  const html = renderToStaticMarkup(createElement('form', null, createElement(Select, {
    id: 'controlled-reset-city', name: 'controlled-reset-city', 'aria-label': 'City',
    value: '', onChange() {}, options, placeholder: 'Choose a city', ...props
  })));
  assert.equal(globalThis[captureKey].length, 1, 'observe the actual Radix Root props');
  return { html, root: globalThis[captureKey][0] };
}

test('an empty parent value remains controlled at the actual Radix boundary', () => {
  assert.equal(render({ value: 'mad' }).root.value, 'mad');
  assert.equal(render({ value: '' }).root.value, '');
});

test('selection callbacks and explicit empty-option translation retain public string values', () => {
  const changes = [];
  const { root } = render({ value: 'mad', onChange: value => changes.push(value) });
  root.onValueChange('tyo');
  const empty = render({
    value: '', onChange: value => changes.push(value),
    options: [{ label: 'All cities', value: '' }, ...options]
  }).root;
  assert.equal(typeof empty.value, 'string');
  assert.notEqual(empty.value, '', 'an explicit empty option keeps its established internal marker');
  empty.onValueChange(empty.value);
  assert.deepEqual(changes, ['tyo', '']);
});

test('real SSR retains the placeholder, named native entry and trigger metadata', () => {
  const { html } = render({ required: true, error: true, 'aria-describedby': 'city-error' });
  assert.match(html, /<button[^>]*role="combobox"/);
  assert.match(html, /<button[^>]*id="controlled-reset-city"/);
  assert.match(html, /<button[^>]*aria-label="City"/);
  assert.match(html, /<button[^>]*aria-invalid="true"/);
  assert.match(html, /<button[^>]*aria-describedby="city-error"/);
  assert.match(html, /data-placeholder=""/);
  assert.match(html, />Choose a city<\/span>/);
  assert.match(html, /<select[^>]*name="controlled-reset-city"/);
  assert.match(html, /<select[^>]*required=""/);
  assert.match(render({ disabled: true, value: 'mad' }).html, /<button[^>]*disabled=""/);
});
