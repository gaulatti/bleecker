#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const proofRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const allowedClassifications = ['exact', 'adapted', 'platform-exception', 'unsupported', 'kolibri-defect'];

function argument(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return resolve(proofRoot, fallback);
  if (!process.argv[index + 1]) throw new Error(`FAIL ${name} requires a path`);
  return resolve(process.cwd(), process.argv[index + 1]);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function serialize(value) {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

function sha256(content, encoding = 'hex') {
  return createHash('sha256').update(content).digest(encoding);
}

function safeAssetPath(uri) {
  const target = resolve(proofRoot, uri);
  const pathFromRoot = relative(proofRoot, target);
  if (isAbsolute(pathFromRoot) || pathFromRoot === '..' || pathFromRoot.startsWith(`..${sep}`)) {
    throw new Error(`FAIL asset ${uri} escapes the conformance fixture root`);
  }
  return target;
}

function validateFixture(fixture, manifest) {
  if (fixture.metadata?.schemaVersion !== manifest.schemaVersion) {
    throw new Error(
      `FAIL $.metadata.schemaVersion=${fixture.metadata?.schemaVersion ?? '<missing>'}; supported=${manifest.schemaVersion}; release=${manifest.releaseVersion}`,
    );
  }
  assert.equal(fixture.metadata.releaseVersion, manifest.releaseVersion, 'fixture release differs from the manifest');
  assert.equal(fixture.metadata.sourceRevision, manifest.sourceRevision, 'fixture source revision differs from the manifest');
  assert.equal(fixture.metadata.compatibleSchemaVersions, manifest.compatibleSchemaVersions, 'fixture compatibility range differs from the manifest');
  assert.deepEqual(fixture.entrypoints, ['bleecker-toggle-family'], 'proof must have one pinned Toggle entrypoint');

  const component = fixture.components.find(({ id }) => id === fixture.entrypoints[0]);
  assert.ok(component, 'pinned Toggle entrypoint must resolve');
  assert.equal(component.name, 'Toggle');
  assert.equal(component.kind, 'atom');
  assert.equal(component.tree.length, 1, 'Toggle must have one root control');
  const root = component.tree[0];
  assert.equal(root.id, 'control');
  assert.equal(root.type, 'element');
  assert.equal(root.element, 'button');
  assert.equal(root.part, 'control');
  assert.equal(root.props?.attributes?.type, 'button');
  assert.equal(typeof root.props?.attributes?.['aria-label'], 'string');
  assert.equal(typeof root.props?.attributes?.['aria-pressed'], 'boolean');
  assert.equal(typeof root.props?.attributes?.disabled, 'boolean');
  assert.deepEqual(root.props?.variants?.size, ['sm', 'md', 'lg']);
  assert.deepEqual(root.props?.variants?.variant, ['default', 'outline']);
  assert.deepEqual(root.props?.states?.pressed, [false, true]);
  assert.deepEqual(root.props?.states?.disabled, [false, true]);

  const nodeIds = new Set();
  const parts = [];
  const assetReferences = [];
  const assets = new Map(component.assets.map((asset) => [asset.id, asset]));
  const visit = (nodes) => {
    for (const node of nodes) {
      assert.ok(!nodeIds.has(node.id), `duplicate node id: ${node.id}`);
      nodeIds.add(node.id);
      if (node.part) parts.push(node.part);
      if (node.props?.assetId) {
        const asset = assets.get(node.props.assetId);
        assert.ok(asset, `missing asset: ${node.props.assetId}`);
        assetReferences.push({ node: node.id, ...asset });
      }
      visit(node.children ?? []);
    }
  };
  visit(component.tree);
  assert.deepEqual(parts, ['control', 'icon', 'label']);

  const events = new Set(component.events.map(({ name }) => name));
  const actions = new Map(component.actions.map((action) => [action.id, action]));
  const transitions = [];
  const focusTargets = [];
  for (const behavior of component.behaviors) {
    behavior.steps.forEach((step, index) => {
      assert.equal(step.order, index + 1, `${behavior.id} action order must be consecutive`);
      assert.ok(events.has(step.event), `${behavior.id} references missing event ${step.event}`);
      assert.ok(actions.has(step.actionId), `${behavior.id} references missing action ${step.actionId}`);
    });
    const behaviorActions = behavior.steps.map(({ actionId }) => actions.get(actionId));
    const stateAction = behaviorActions.find(({ type }) => type === 'set-state');
    const emitAction = behaviorActions.find(({ type }) => type === 'emit');
    for (const action of behaviorActions.filter(({ type }) => type === 'focus')) {
      assert.ok(nodeIds.has(action.target), `${behavior.id} references missing focus target ${action.target}`);
      focusTargets.push(action.target);
    }
    if (stateAction) {
      assert.ok(emitAction, `${behavior.id} changes state without emitting`);
      assert.equal(stateAction.value.value, emitAction.value.value, `${behavior.id} state and emitted value differ`);
      transitions.push({
        behavior: behavior.id,
        emit: emitAction.value.event,
        event: behavior.steps[0].event,
        state: stateAction.value.field,
        value: stateAction.value.value,
      });
    }
  }
  transitions.sort((left, right) => left.behavior.localeCompare(right.behavior));
  assert.deepEqual(transitions.map(({ value }) => value).sort(), [false, true]);

  return {
    assetReferences,
    component,
    focusTargets: [...new Set(focusTargets)].sort(),
    parts,
    root,
    transitions,
  };
}

function comparisonMappings() {
  return [
    {
      dimension: 'asset.bold-icon',
      kolibri: 'checksummed bold.svg icon asset',
      bleecker: 'checksummed input is validated and rendered through the Lucide Bold icon',
      classification: 'adapted',
      reason: 'Bleecker retains icon-library ownership while preserving the pinned asset identity and meaning.',
    },
    {
      dimension: 'behavior.activate-pressed',
      kolibri: 'clear pressed, then emit pressed-change=false',
      bleecker: 'onPressedChange(false) precedes the consumer onClick callback',
      classification: 'adapted',
      reason: 'Bleecker is controlled, so the parent owns the state write while callback ordering preserves the sequence.',
    },
    {
      dimension: 'behavior.activate-unpressed',
      kolibri: 'set pressed, then emit pressed-change=true',
      bleecker: 'onPressedChange(true) precedes the consumer onClick callback',
      classification: 'adapted',
      reason: 'Bleecker is controlled, so the parent owns the state write while callback ordering preserves the sequence.',
    },
    {
      dimension: 'behavior.disabled-suppression',
      kolibri: 'disabled state is declared; DOM suppression is consumer-owned',
      bleecker: 'native disabled button suppresses pointer and keyboard activation',
      classification: 'exact',
      reason: 'The browser-native disabled control supplies the required observable behavior.',
    },
    {
      dimension: 'behavior.focus',
      kolibri: 'focus-control targets the control part',
      bleecker: 'the forwarded ref and native button receive keyboard focus',
      classification: 'exact',
      reason: 'Focus lands on the same semantic control.',
    },
    {
      dimension: 'family.toggle-group',
      kolibri: 'no single-select or multiple-select group contract is present',
      bleecker: 'ToggleGroup and ToggleGroupItem remain hand-authored extensions',
      classification: 'unsupported',
      reason: 'The pinned artifact cannot safely generate or validate group selection semantics.',
    },
    {
      dimension: 'identity.component',
      kolibri: 'Toggle atom at bleecker-toggle-family',
      bleecker: 'Toggle React component at @gaulatti/bleecker/components/toggle',
      classification: 'adapted',
      reason: 'The component identity matches while the renderer-owned module entrypoint stays unchanged.',
    },
    {
      dimension: 'part.control',
      kolibri: 'button element with type=button',
      bleecker: 'native button element with type=button',
      classification: 'exact',
      reason: 'Element and non-submit behavior match.',
    },
    {
      dimension: 'part.icon',
      kolibri: 'icon part references checksummed bold.svg and is aria-hidden',
      bleecker: 'consumer-composed Lucide Bold icon is explicitly aria-hidden',
      classification: 'adapted',
      reason: 'Asset identity is verified, but Bleecker retains icon-library rendering ownership.',
    },
    {
      dimension: 'part.label',
      kolibri: 'label part contains Bold',
      bleecker: 'consumer-composed visible Bold text supplies the accessible name',
      classification: 'adapted',
      reason: 'Text semantics match without adding generated part markup to the public API.',
    },
    {
      dimension: 'public.react-api',
      kolibri: 'renderer-neutral state, event, action, and part vocabulary',
      bleecker: 'pressed, onPressedChange, size, variant, children, and native button props',
      classification: 'adapted',
      reason: 'The existing controlled React API expresses the contract without an additive public adapter.',
    },
    {
      dimension: 'semantics.accessible-name',
      kolibri: 'aria-label=Bold',
      bleecker: 'visible Bold text and optional aria-label are exposed by the native button',
      classification: 'exact',
      reason: 'The browser accessibility tree resolves the same role and name.',
    },
    {
      dimension: 'semantics.disabled',
      kolibri: 'boolean disabled state',
      bleecker: 'native disabled attribute',
      classification: 'exact',
      reason: 'State and platform semantics match.',
    },
    {
      dimension: 'semantics.pressed',
      kolibri: 'boolean aria-pressed state',
      bleecker: 'aria-pressed mirrors the controlled pressed prop',
      classification: 'exact',
      reason: 'Both pressed values are observable to assistive technology.',
    },
    {
      dimension: 'state.disabled',
      kolibri: 'false and true',
      bleecker: 'false and true',
      classification: 'exact',
      reason: 'The complete declared state vocabulary is rendered.',
    },
    {
      dimension: 'state.pressed',
      kolibri: 'false and true',
      bleecker: 'false and true',
      classification: 'exact',
      reason: 'The complete declared state vocabulary is rendered.',
    },
    {
      dimension: 'variant.size',
      kolibri: 'sm, md, lg',
      bleecker: 'sm, md, lg',
      classification: 'exact',
      reason: 'The public vocabulary is identical.',
    },
    {
      dimension: 'variant.variant',
      kolibri: 'default, outline',
      bleecker: 'default, outline',
      classification: 'exact',
      reason: 'The public vocabulary is identical.',
    },
    {
      dimension: 'visual.focus-ring',
      kolibri: 'focus intent only; presentation is consumer-owned',
      bleecker: 'tokenized focus-visible ring with a dark-theme color',
      classification: 'adapted',
      reason: 'Bleecker supplies its established visual language without changing contract semantics.',
    },
    {
      dimension: 'visual.light-dark',
      kolibri: 'theme presentation is not specified',
      bleecker: 'pressed, unpressed, outline, and focus colors use Bleecker theme tokens',
      classification: 'adapted',
      reason: 'Theme ownership correctly remains with Bleecker.',
    },
    {
      dimension: 'visual.motion',
      kolibri: 'motion is not specified',
      bleecker: 'tokenized control transition with global reduced-motion suppression',
      classification: 'platform-exception',
      reason: 'Browser motion and reduced-motion behavior are platform presentation concerns.',
    },
    {
      dimension: 'visual.responsive',
      kolibri: 'no breakpoint behavior is declared',
      bleecker: 'the intrinsic control keeps the same semantics and dimensions at mobile and desktop widths',
      classification: 'platform-exception',
      reason: 'No generated responsive rule exists to map; viewport behavior remains stable.',
    },
    {
      dimension: 'visual.size-style',
      kolibri: 'size names only',
      bleecker: 'tokenized heights, spacing, and type scale per size',
      classification: 'adapted',
      reason: 'Bleecker owns the concrete size presentation.',
    },
  ].sort((left, right) => left.dimension.localeCompare(right.dimension));
}

async function buildReport({ fixture, manifest, pin, manifestDigest, fixtureDigest }) {
  assert.equal(pin.repository, 'gaulatti/kolibri');
  assert.match(pin.commit, /^[0-9a-f]{40}$/);
  assert.match(pin.releaseLandedCommit, /^[0-9a-f]{40}$/);
  assert.equal(manifest.releaseVersion, pin.releaseVersion);
  assert.equal(manifest.schemaVersion, pin.schemaVersion);
  assert.equal(manifest.sourceRevision, pin.sourceRevision);
  assert.equal(manifestDigest, pin.manifestSha256, 'release manifest checksum differs from the pin');
  assert.equal(fixtureDigest, pin.fixtureSha256, 'Toggle fixture checksum differs from the pin');

  const validated = validateFixture(fixture, manifest);
  assert.equal(validated.assetReferences.length, 1);
  const asset = validated.assetReferences[0];
  const assetContent = await readFile(safeAssetPath(asset.uri));
  assert.equal(sha256(assetContent), pin.assetSha256, 'Toggle asset checksum differs from the pin');
  assert.equal(`sha256-${sha256(assetContent, 'base64')}`, asset.integrity, 'Toggle asset integrity differs from the fixture');

  const mappings = comparisonMappings();
  const requiredDimensions = [
    ...validated.assetReferences.map(({ id }) => `asset.${id}`).sort(),
    'behavior.activate-pressed',
    'behavior.activate-unpressed',
    'behavior.disabled-suppression',
    'behavior.focus',
    'family.toggle-group',
    'identity.component',
    'part.control',
    'part.icon',
    'part.label',
    'public.react-api',
    'semantics.accessible-name',
    'semantics.disabled',
    'semantics.pressed',
    'state.disabled',
    'state.pressed',
    'variant.size',
    'variant.variant',
    'visual.focus-ring',
    'visual.light-dark',
    'visual.motion',
    'visual.responsive',
    'visual.size-style',
  ];
  assert.deepEqual(mappings.map(({ dimension }) => dimension), requiredDimensions, 'comparison inventory is incomplete');
  for (const mapping of mappings) {
    assert.ok(allowedClassifications.includes(mapping.classification), `unsupported classification: ${mapping.classification}`);
  }
  const classificationCounts = Object.fromEntries(
    allowedClassifications.map((classification) => [
      classification,
      mappings.filter((mapping) => mapping.classification === classification).length,
    ]),
  );

  return {
    artifact: {
      assetSha256: pin.assetSha256,
      commit: pin.commit,
      fixtureSha256: fixtureDigest,
      manifestSha256: manifestDigest,
      releaseLandedCommit: pin.releaseLandedCommit,
      releaseVersion: manifest.releaseVersion,
      repository: pin.repository,
      schemaVersion: manifest.schemaVersion,
      sourceRevision: manifest.sourceRevision,
    },
    classificationCounts,
    defects: [],
    family: {
      behaviors: validated.component.behaviors.map(({ id }) => id),
      entrypoint: fixture.entrypoints[0],
      focusTargets: validated.focusTargets,
      name: validated.component.name,
      semanticParts: validated.parts,
      states: validated.root.props.states,
      transitions: validated.transitions,
      variants: validated.root.props.variants,
    },
    mappings,
    recommendation: {
      decision: 'proceed-with-adapter',
      generatedSourcePolicy: 'never-overwrite-hand-authored-source',
      publicAPI: 'unchanged',
      rationale: 'Use pinned Kolibri intent as an input to conformance checks while Bleecker retains React behavior, accessibility, assets, and presentation ownership.',
    },
    visualMatrix: {
      cells: validated.root.props.variants.size.length * validated.root.props.variants.variant.length * validated.root.props.states.pressed.length * validated.root.props.states.disabled.length * 2,
      themes: ['light', 'dark'],
      viewports: ['390x844', '1280x960'],
    },
  };
}

async function main() {
  const fixturePath = argument('--fixture', 'fixtures/toggle-family.json');
  const manifestPath = argument('--manifest', 'release/manifest.json');
  const expectedPath = argument('--expected', 'expected/bleecker-parity.json');
  const pinPath = argument('--pin', 'contract-pin.json');
  const usingPinnedFixture = !process.argv.includes('--fixture');
  const [fixtureContent, manifestContent, pinContent] = await Promise.all([
    readFile(fixturePath, 'utf8'),
    readFile(manifestPath, 'utf8'),
    readFile(pinPath, 'utf8'),
  ]);
  const fixture = JSON.parse(fixtureContent);
  const manifest = JSON.parse(manifestContent);
  const pin = JSON.parse(pinContent);

  if (fixture.metadata?.schemaVersion !== manifest.schemaVersion) {
    throw new Error(
      `FAIL $.metadata.schemaVersion=${fixture.metadata?.schemaVersion ?? '<missing>'}; supported=${manifest.schemaVersion}; release=${manifest.releaseVersion}`,
    );
  }
  const fixtureDigest = sha256(fixtureContent);
  if (!usingPinnedFixture) {
    validateFixture(fixture, manifest);
    process.stdout.write(`PASS compatible fixture ${fixturePath}\n`);
    return;
  }

  const report = await buildReport({
    fixture,
    fixtureDigest,
    manifest,
    manifestDigest: sha256(manifestContent),
    pin,
  });
  if (process.argv.includes('--print')) {
    process.stdout.write(serialize(report));
    return;
  }

  const expected = JSON.parse(await readFile(expectedPath, 'utf8'));
  assert.deepEqual(canonicalize(report), canonicalize(expected), 'Bleecker parity projection differs from the checked-in snapshot');
  const reportDigest = sha256(serialize(report));
  console.log(`PASS Bleecker Toggle conforms to pinned Kolibri ${report.artifact.releaseVersion} schema ${report.artifact.schemaVersion}`);
  console.log(`artifact commit=${report.artifact.commit} manifest-sha256=${report.artifact.manifestSha256}`);
  console.log(`fixture-sha256=${report.artifact.fixtureSha256} snapshot-sha256=${reportDigest}`);
  console.log(`classifications exact=${report.classificationCounts.exact} adapted=${report.classificationCounts.adapted} platform-exception=${report.classificationCounts['platform-exception']} unsupported=${report.classificationCounts.unsupported} kolibri-defect=${report.classificationCounts['kolibri-defect']}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message.startsWith('FAIL ') ? message : `FAIL ${message}`}\n`);
  process.exitCode = 1;
});
