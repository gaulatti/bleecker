# Kolibri Toggle consumer proof

This directory is a self-contained Bleecker consumer of Kolibri's pinned
renderer-neutral Toggle artifact. It needs no Kolibri checkout, private package,
registry, branch, or network access.

The upstream inputs are copied byte-for-byte from `gaulatti/kolibri` commit
`6beefce0f1d2e6bbd87bd0a573753be6c9565705`:

- `release/manifest.json` is the immutable Kolibri `0.1.0` release manifest;
- `fixtures/toggle-family.json` is the generated neutral Toggle-family fixture;
- `assets/bold.svg` is the fixture's checksummed icon input; and
- `contract-pin.json` records the source, release, fixture, manifest, and asset
  identities.

`src/verify.mjs` fails closed on incompatible schema versions or checksum drift,
projects the fixture into Bleecker's renderer-owned comparison, and compares it
with the canonical `expected/bleecker-parity.json` snapshot. The snapshot
classifies every declared state, variant, semantic part, behavior, asset, visual
boundary, and public-API decision as `exact`, `adapted`, `platform-exception`,
`unsupported`, or `kolibri-defect`.

Run the deterministic proof from the Bleecker root:

```sh
npm run check:kolibri-toggle
npm --prefix conformance/kolibri-toggle run verify
```

Capture the required incompatible-contract result with:

```sh
npm --prefix conformance/kolibri-toggle run verify:incompatible
```

That command intentionally exits `1` with:

```text
FAIL $.metadata.schemaVersion=2.0.0; supported=1.0.0; release=0.1.0
```

The browser-owned half of the proof is in the `KolibriContractMatrix` and
`KolibriKeyboardAndScreenReaderContract` stories. They use Bleecker's actual
`Toggle` implementation and public core vocabulary; generated output never
overwrites `src/`.

See [the decision report](../../docs/kolibri-toggle-parity.md) for the complete
classification and recommendation.
