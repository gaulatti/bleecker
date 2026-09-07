# Kolibri Toggle parity decision

## Decision

**Proceed with an adapter, without changing Bleecker's public API or generated
source policy.** The pinned Kolibri `0.1.0` artifact is useful as a validated
intent input for Bleecker conformance. It is not sufficient to own Bleecker's
React behavior, DOM structure, focus presentation, accessibility verification,
assets, theme tokens, responsive behavior, or `ToggleGroup` semantics.

Generated output must never overwrite Bleecker's hand-authored `src/` files.
Future families should use the same pin, validate, classify, and browser-prove
gate before any additive adapter is considered.

## Pinned artifact

The proof is self-contained under `conformance/kolibri-toggle` and uses no
runtime or build-time access to the private Kolibri repository.

| Identity | Pinned value |
| --- | --- |
| Kolibri fixture commit | `6beefce0f1d2e6bbd87bd0a573753be6c9565705` |
| Neutral release merge | `f14a631a001f867e208be6053ac07df32fda4dca` |
| Release / schema | `0.1.0` / `1.0.0` |
| Release source revision | `24e6905a0a6b9e6dae08b0832781b0f06f8c0b5f` |
| Manifest SHA-256 | `aec1a74fb557ab0a5d254b5ac8d98306e552dc88cdb6ebeeb6f98d1460cfe134` |
| Toggle fixture SHA-256 | `43d00f4ca3a68a8ff3f41525285a29239acef3da626b7d1a0c634ae280f0affd` |
| Bold asset SHA-256 | `49f13d21e868cf81be3ef1b2b7a611d6bb0d2655771734db84d41f4244ea0fa8` |

The verifier checks every identity before interpreting the fixture, confines
asset resolution to the proof directory, and rejects incompatible schema
versions with the offending field, value, supported version, and release.

## Why Toggle

Toggle is the smallest Bleecker family that still exercises meaningful design
system behavior:

- `sm`, `md`, and `lg` sizes;
- `default` and `outline` visual variants;
- both pressed and disabled states;
- bidirectional activation, emitted changes, disabled suppression, and focus;
- control, icon, and label semantic parts; and
- accessible button name, `aria-pressed`, and native `disabled` semantics.

The Storybook state matrix renders all 48 combinations across Bleecker light and
dark themes. Both matrix stories request deterministic Chromatic captures at
390 and 1280 pixels wide; local browser review uses 390 by 844 and 1280 by 960.
Toggle has no responsive contract or breakpoint styling, so the browser test
also verifies stable intrinsic dimensions for each size across every state.

## Classification

The canonical machine-readable inventory is
`conformance/kolibri-toggle/expected/bleecker-parity.json`. It records 10 exact
mappings, 10 adaptations, 2 browser platform exceptions, 1 unsupported family
extension, and no Kolibri defects.

| Surface | Classification | Finding |
| --- | --- | --- |
| Size and variant vocabularies | Exact | Kolibri and Bleecker both expose `sm` / `md` / `lg` and `default` / `outline`. |
| Pressed and disabled vocabularies | Exact | Both boolean states are represented in the runtime matrix. |
| Control semantics | Exact | Bleecker renders a non-submit native button with accessible name, `aria-pressed`, and `disabled`. |
| Activation sequence | Adapted | Kolibri describes state-then-emit; Bleecker's controlled API invokes `onPressedChange` before the consumer `onClick`, while the parent owns the state write. |
| Focus target | Exact | Keyboard focus and forwarded refs land on the native control. |
| Focus appearance | Adapted | Bleecker retains its tokenized `focus-visible` ring and dark-theme color. |
| Icon and label parts | Adapted | Bleecker composes a hidden Lucide icon and visible label without exposing generated part wrappers in its public API. |
| Asset | Adapted | The neutral SVG identity is verified, while Bleecker retains icon-library substitution. |
| Light/dark and concrete sizing | Adapted | Kolibri supplies vocabulary; Bleecker owns colors, dimensions, spacing, type, and contrast. |
| Motion and responsive behavior | Platform exception | The artifact has no motion or breakpoint rules; Bleecker keeps reduced-motion-safe browser presentation and stable intrinsic sizing. |
| `ToggleGroup` single/multiple selection | Unsupported | The pinned fixture does not model group structure or selection rules, so generated output must not replace or claim parity for those hand-authored components. |
| Kolibri defect | None found | The pinned fields are internally consistent and sufficient for the bounded Toggle control proof. |

## Runtime and accessibility evidence

`KolibriKeyboardAndScreenReaderContract` uses the actual Bleecker component in a
Chromium-backed Storybook test. It verifies role/name lookup through the browser
accessibility tree, boolean `aria-pressed` changes for Space and Enter, callback
ordering, keyboard and forwarded-ref focus, a visible computed focus ring,
native disabled-event suppression, and the icon's hidden accessibility state.
`KolibriDarkFocusContract` repeats keyboard focus and computed ring checks
under Bleecker's real document-level dark theme. Both stories enable the a11y
addon in error mode.

`KolibriContractMatrix` imports Bleecker's actual public `toggleSizes` and
`toggleVariants`, compares them with the fixture, renders every state with the
exact `Bold` accessible name in light and dark presentation, and enables the
same strict a11y check. Each matrix declares 390- and 1280-pixel Chromatic
viewports. Visual review is evidence for Bleecker presentation only; the
Kolibri artifact intentionally does not promise pixel parity.

## Stop conditions and reuse

Stop rather than adapt when a future artifact has an incompatible schema,
checksum drift, an unclassified state or semantic part, a behavior Bleecker
cannot express without breaking its API, or an asset/license boundary that is
not independently approved. `ToggleGroup` remains stopped at this gate until a
versioned Kolibri group contract exists.

Sabella and Thompson may reuse the pin-and-classify process, but must implement
and verify their own native focus, input, accessibility, visual, and asset
adaptation. This PR does not integrate either consumer, publish a package,
deploy anything, or launch Kolibri.
