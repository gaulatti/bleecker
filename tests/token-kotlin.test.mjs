import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync('src/tokens/source.ts', 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
const tokens = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);
const kotlin = readFileSync('android/BleeckerTokens.generated.kt', 'utf8');

function entries(objectName) {
  const body = new RegExp(`object ${objectName} \\{\\n([\\s\\S]*?)\\n\\}`).exec(kotlin);
  assert.ok(body, `${objectName} is missing from the Kotlin output`);
  return body[1].split('\n').filter(Boolean).map((line) => /(?:const )?val (\w+) = (.*)$/.exec(line.trim()));
}

test('every token group in source.ts is in the Kotlin output with the same keys', () => {
  const groups = {
    BleeckerFontFamilies: tokens.fontFamilies,
    BleeckerFontWeights: tokens.fontWeights,
    BleeckerSpacing: tokens.spacing,
    BleeckerRadii: tokens.radii,
    BleeckerDurations: tokens.durations,
    BleeckerControlHeights: tokens.controlHeights,
    BleeckerFocusRing: tokens.focusRing,
    BleeckerFontSizes: tokens.fontSizes,
    BleeckerLetterSpacing: tokens.letterSpacing,
    BleeckerEasing: tokens.easing,
    BleeckerLightColors: tokens.lightColors,
    BleeckerDarkColors: tokens.darkColors
  };
  for (const [name, group] of Object.entries(groups)) {
    assert.deepEqual(entries(name).map((match) => match[1]), Object.keys(group), name);
  }
});

test('values: lengths are floats, colours are ARGB, translucent borders keep their alpha', () => {
  const find = (name, key) => entries(name).find((match) => match[1] === key)[2];
  assert.equal(find('BleeckerRadii', 'card'), '12.0f');
  assert.equal(find('BleeckerSpacing', 'page'), '64.0f');
  assert.equal(find('BleeckerDurations', 'standard'), '200');
  assert.equal(find('BleeckerLetterSpacing', 'refined'), '-0.02f');
  assert.equal(find('BleeckerFontSizes', 'body'), '14.0f');
  assert.equal(find('BleeckerControlHeights', 'dense'), '28.0f');
  assert.equal(find('BleeckerFocusRing', 'width'), '2.0f');
  assert.equal(find('BleeckerTypography', 'monoFamily'), '"ui-monospace"');
  assert.equal(find('BleeckerLightColors', 'sea'), '0xFF2C5784L');
  assert.equal(find('BleeckerDarkColors', 'sea'), '0xFF5BA3F5L');
  assert.equal(find('BleeckerLightColors', 'border'), '0x14000000L'); // rgba(0, 0, 0, 0.08)
  assert.equal(find('BleeckerDarkColors', 'border'), '0x14FFFFFFL');
});

test('--check passes on the committed output and fails when the Kotlin file is stale', () => {
  const run = (cwd) => spawnSync('node', [join(process.cwd(), 'scripts/generate-token-css.mjs'), '--check'], { cwd, encoding: 'utf8' });
  assert.equal(run(process.cwd()).status, 0);
  const copy = mkdtempSync(join(tmpdir(), 'bleecker-tokens-'));
  cpSync('src', join(copy, 'src'), { recursive: true });
  cpSync('android', join(copy, 'android'), { recursive: true });
  writeFileSync(join(copy, 'android/BleeckerTokens.generated.kt'), kotlin.replace('12.0f', '13.0f'));
  const stale = spawnSync('node', [join(process.cwd(), 'scripts/generate-token-css.mjs'), '--check'], { cwd: copy, encoding: 'utf8' });
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /BleeckerTokens\.generated\.kt is stale/);
});
