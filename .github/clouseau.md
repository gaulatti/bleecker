# Bleecker review contract

Bleecker (`@gaulatti/bleecker`) is the shared React design-system package for
Gaulatti and Fifthbell products: tokens, accessible components, layouts, theming,
and a Storybook that documents and verifies them. Products consume it as a
published npm package and rely on its public exports, original design tokens,
modal and focus ownership, and opaque-sandbox-safe behaviour staying stable.

Preserve declared public APIs and export paths, the generated token CSS, theme
provider semantics (including storage-free controlled mode), keyboard and focus
behaviour, accessible names, contrast, and server-render safety. A component
change needs a Storybook fixture or test that shows the behaviour a consumer
sees. Bug fixes, meaningful tests, accessibility corrections, documentation and
dependency maintenance serve this existing package without a new product
decision. A new component or a breaking public API needs documentation or a
linked requirement that establishes its need and its boundaries.

Assess purpose and evidence rather than the number of changed files or lines.
Ask gaulatti for a second opinion for a product-direction or authority decision:
for example a new visual language, removing or renaming public exports, a
change to the release or Storybook publication path, or a new runtime
dependency. Ordinary implementation uncertainty and repairable bugs belong to
automated investigation, not routine human code review. Changes to review
controls (this contract, `.github/clouseau.json`, the CI workflow, the local
recipe, `vitest.config.ts` coverage settings) require
explicit owner confirmation.

Every material capability and mechanism must independently score at least 80
for fit, need and proportionality under Clouseau's shared protocol. A causal
technical finding at or above 70 blocks; unrelated features or good scores
cannot average away a defect. Integrity and review-completeness gates remain
independent.

Tests must assert actual component behaviour in a real browser or real server
rendering. Reject fabricated coverage, disabled tests, coverage pragmas or
exclusions, swallowed errors, unconditional assertions and mocks that replace
the behaviour being claimed. Mocking a charting library's callback props to
exercise this package's own formatter logic is legitimate when the real
component still renders. All tests, the package build, the Storybook build and
exactly 100% line and branch coverage of `src` remain mandatory for every
contribution, including external forks. Missing or unresolved integrity evidence
holds approval; intent confirmation cannot waive it. Contributor code never
receives provider, repair or approval credentials, and fork PRs cannot trigger
automatic repairs.

Clouseau owns the shared scoring, investigation, repair bounds, evidence ledger,
native approval and auto-merge. This repository owns its purpose, real tests and
package evidence. A merge to `main` is not an npm release and does not by itself
establish a published package: publication is a separate, explicitly authorized
tag-triggered workflow, and the Storybook deployment workflow is likewise
outside this contract.

A passing local Clouseau review may be reused only through a signed receipt from
an enrolled trusted workstation and the matching native GitHub author. CI must
independently verify current protected policy, exact head/base and engine
content, expiry, evidence and deterministic scores. This route has no AI
credentials and must not fall back to paid review when verification fails. Agent
installation and account-authenticated local execution remain independent of CI
enrollment and CI provider keys.
