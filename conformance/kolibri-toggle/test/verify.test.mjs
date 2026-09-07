import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { appendFile, cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const proofRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cli = join(proofRoot, 'src/verify.mjs');

function run(args = [], options = {}) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: proofRoot,
    encoding: 'utf8',
    ...options,
  });
}

test('emits deterministic CI-suitable parity evidence', () => {
  const first = run();
  const second = run();
  assert.equal(first, second);
  assert.match(first, /^PASS Bleecker Toggle conforms to pinned Kolibri 0\.1\.0 schema 1\.0\.0/m);
  assert.match(first, /artifact commit=6beefce0f1d2e6bbd87bd0a573753be6c9565705/);
  assert.match(first, /snapshot-sha256=[0-9a-f]{64}/);
  assert.match(first, /classifications exact=10 adapted=10 platform-exception=2 unsupported=1 kolibri-defect=0/);
});

test('runs without a Kolibri checkout, network access, or unpublished package', async () => {
  const cleanRoot = await mkdtemp(join(tmpdir(), 'bleecker-kolibri-consumer-'));
  const cleanProof = join(cleanRoot, 'proof');
  try {
    await cp(proofRoot, cleanProof, { recursive: true });
    const output = execFileSync(process.execPath, [join(cleanProof, 'src/verify.mjs')], {
      cwd: cleanRoot,
      encoding: 'utf8',
      env: { PATH: process.env.PATH ?? '' },
    });
    assert.match(output, /^PASS Bleecker Toggle/m);
  } finally {
    await rm(cleanRoot, { recursive: true, force: true });
  }
});

test('rejects incompatible schema versions with the field and supported release', () => {
  const result = spawnSync(process.execPath, [cli, '--fixture', join(proofRoot, 'fixtures/incompatible-schema-version.json')], {
    cwd: proofRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, 'FAIL $.metadata.schemaVersion=2.0.0; supported=1.0.0; release=0.1.0\n');
});

test('fails closed when the pinned generated asset changes', async () => {
  const cleanRoot = await mkdtemp(join(tmpdir(), 'bleecker-kolibri-tamper-'));
  const cleanProof = join(cleanRoot, 'proof');
  try {
    await cp(proofRoot, cleanProof, { recursive: true });
    await appendFile(join(cleanProof, 'assets/bold.svg'), '\n');
    const result = spawnSync(process.execPath, [join(cleanProof, 'src/verify.mjs')], {
      cwd: cleanRoot,
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /^FAIL Toggle asset checksum differs from the pin/m);
  } finally {
    await rm(cleanRoot, { recursive: true, force: true });
  }
});

test('snapshot classifies every declared state, variant, part, and behavior boundary', async () => {
  const report = JSON.parse(await readFile(join(proofRoot, 'expected/bleecker-parity.json'), 'utf8'));
  assert.deepEqual(report.family.variants, { size: ['sm', 'md', 'lg'], variant: ['default', 'outline'] });
  assert.deepEqual(report.family.states, { disabled: [false, true], pressed: [false, true] });
  assert.deepEqual(report.family.semanticParts, ['control', 'icon', 'label']);
  assert.deepEqual(report.family.behaviors, ['press-on', 'press-off', 'focus-control']);
  assert.equal(report.visualMatrix.cells, 48);
  assert.deepEqual(report.classificationCounts, {
    adapted: 10,
    exact: 10,
    'kolibri-defect': 0,
    'platform-exception': 2,
    unsupported: 1,
  });
  assert.deepEqual(report.defects, []);
  assert.equal(report.recommendation.decision, 'proceed-with-adapter');
  assert.equal(report.recommendation.publicAPI, 'unchanged');
});
