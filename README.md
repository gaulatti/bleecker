# Bleecker

Bleecker is a refined React component library built around the Encode Sans typeface and a warm, restrained palette of sand, sea, desert, and terracotta.

It is published on npm as `@gaulatti/bleecker`.

## Install

Bleecker ships ES modules only.

```sh
npm install @gaulatti/bleecker
```

Choose one stylesheet integration. Tailwind CSS v4 applications should compile
Bleecker together with their own utilities:

```css
/* app.css */
@import "@gaulatti/bleecker/styles.base.css";
@source "../node_modules/@gaulatti/bleecker/dist/**/*.js";
@source "./**/*.{ts,tsx}";
```

Do not also import `@gaulatti/bleecker/styles.css` in a Tailwind application.
Doing so loads a second compiled utility layer and can change responsive layout
behavior through the cascade.
Import only one stylesheet integration per application.

Applications that do not compile Tailwind should instead import the complete,
precompiled stylesheet once:

```ts
import '@gaulatti/bleecker/styles.css';
```

Bleecker requires React 18.2 or newer (see `peerDependencies`).

## Attention feeds

Use Bleecker's feed primitives for multi-column monitoring, event indexes, and
other continuously updated operational views:

```tsx
import { AttentionSurface } from '@gaulatti/bleecker/components/attention-surface';
import { FeedColumn } from '@gaulatti/bleecker/layout/feed-column';
import { FeedGrid } from '@gaulatti/bleecker/layout/feed-grid';

<FeedColumn accent='hsl(285 64% 66%)' count={50} title='Business'>
  <AttentionSurface hue={285} intensity={2}>
    Low-urgency item: 80% column hue, 20% red.
  </AttentionSurface>
</FeedColumn>;

<FeedGrid minColumnWidth={360}>{eventCards}</FeedGrid>;
```

`AttentionSurface` accepts a continuous intensity from 0–10. Intensity changes
both the category-to-red color mix and the distance traveled by the gradient.
Consumers decide what intensity means—relevance, magnitude, risk, confidence,
or another domain measure—but should not reimplement the visual interpolation.

Values outside 0–10 are clamped to that range, and a non-finite intensity is
treated as 0. `FeedGrid` uses a `minColumnWidth` of 340 pixels by default; a
number is read as pixels and a string is used as a CSS length.

```tsx
import { Button, Field, Input } from '@gaulatti/bleecker';

export function AccountForm() {
  return (
    <Field label='Email address' description='Used for account notifications.'>
      <Input type='email' />
    </Field>
  );
}
```

Individual component entry points are also available:

```tsx
import { Button } from '@gaulatti/bleecker/components/button';
```

## Design principles

- Encode Sans is the primary voice. Use the `font-secondary` utility to opt specific supporting or editorial copy into Libre Franklin.
- Spacing follows a deliberate 4, 8, 12, 16, 24, 32, 48, and 64 pixel rhythm.
- Prefer the spacing rhythm over ad hoc pixel values.
- Borders carry surface hierarchy; shadows are reserved for elevated surfaces and overlays.
- Controls use consistent 32, 40, and 48 pixel heights.
- Motion is brief and functional, with reduced-motion behavior included globally.
- Spacing and radii values come from the shared tokens described in Shared foundations.

## Luxury composition

Luxury in Bleecker comes from editing and proportion, not decoration. The most reliable compositions use one dominant focal plane, one quieter supporting rail, and enough negative space for the hierarchy to remain obvious.

- Start with `PageFrame` so product pages share the same gutters, readable widths, and vertical cadence.
- Use `DetailLayout` for asymmetric detail pages, editorial views, and sticky summary rails instead of assembling new grid proportions each time.
- Use `AuthShell` for focused sign-in, invitation, and onboarding moments with an optional narrative panel. It is the required outer layout for every React-DOM product login, including its loading, unavailable, and error states; see [the AuthShell standard](docs/auth-shell-standard.md).
- Prefer hairline borders for default surfaces. Reserve `Card`'s `elevated` variant and stronger shadows for the single surface that truly sits above the page.
- Keep supporting copy in `font-secondary`, eyebrow copy brief, and data labels at a readable contrast. A restrained accent should guide attention rather than tint every section.
- Avoid grids of equally weighted cards when one number, action, or story is more important. Give that item more scale or span and quiet the rest.
- One dominant focal plane per page keeps the hierarchy obvious.

Storybook's **Templates** section includes complete public, operational, commerce, hospitality, and private-client compositions. Treat them as starting points: keep their hierarchy and rhythm, then replace the domain copy and content.
Templates are examples, not required structure.

## Theming

The default light and dark themes are defined with `--app-*` custom properties in the stylesheet. Override those properties after importing Bleecker styles to adapt the theme without changing component markup.

The `ThemeProvider`, `ThemeToggle`, and `BleeckerThemeScript` exports provide persisted light, dark, and system modes. Render `BleeckerThemeScript` in the document head when server rendering to avoid a theme flash.

Pass `theme` and the required `onThemeChange` together for a parent-controlled,
storage-free provider. Requests do not change the provider until its parent
updates `theme`. Controlled hosts omit the persisted head script. See the
[controlled-theme contract](docs/controlled-theme.md).

The transparent link Button's themed-surface and hover checks are documented
in the [link contrast contract](docs/button-link-contrast.md).
Button and IconButton keyboard-focus indicators and their dedicated browser
checks are documented in the [focus contrast contract](docs/control-focus-contrast.md).

## Accessibility

Interactive overlays and selection controls use accessible behavioral primitives. Form controls forward native attributes; `Field` connects labels, descriptions, errors, and invalid state automatically.

Applications are still responsible for meaningful labels, logical page structure, and testing complete user flows in their own context.
The Accessibility section lists the supporting contracts.

Input and Textarea default placeholder contrast is covered by the mounted
[field-placeholder contract](docs/field-placeholders.md); explicit caller color
overrides remain the caller's responsibility.

`Select` stays controlled by its required string `value`, including `''`. Without
an explicit empty-valued option, clearing the parent value restores the supplied
placeholder and empty native form entry. An explicit empty-valued option keeps
its existing label and callback translation. The **Components/Select/Controlled
Empty** fixture exposes choice, callbacks, native value and submitted form value;
**Empty Option And Reading** covers the existing empty option and disabled saved
selection. See the [controlled reset contract](docs/select-controlled-reset.md)
for the feature boundary and remaining acceptance.

Modal surfaces activate keyboard focus when their panels mount, contain Tab
navigation, and restore focus and scrolling after dismissal, including nested
panels. See the [modal keyboard lifecycle](docs/modal-keyboard-lifecycle.md) for
the contract, interaction fixtures, and browser evidence.

## Shared foundations

Bleecker is the source of truth for platform-neutral component contracts and design tokens. These leaf exports do not import DOM components, CSS, Radix, Recharts, or ReactDOM:

```ts
import { buttonVariants, resolveTheme, type ButtonContract } from '@gaulatti/bleecker/core';
import { radii, spacing, themes } from '@gaulatti/bleecker/tokens';
```

`src/tokens/source.ts` is canonical. The web CSS token layer is generated from it during the build and checked for drift in CI. [Thompson](https://github.com/gaulatti/thompson), Bleecker's React Native sibling, consumes these exports and supplies native renderers.
Edit the token source rather than the generated CSS.

## Generated contract conformance

Bleecker may consume a pinned renderer-neutral artifact as conformance input,
but generated output never overwrites its hand-authored components. The
[Kolibri Toggle parity decision](docs/kolibri-toggle-parity.md) documents the
first bounded proof, its immutable fixture, browser accessibility and visual
evidence, unsupported `ToggleGroup` boundary, and proceed-with-adapter result.
Hand-authored components remain the source of truth.

## Development

```sh
npm ci
npm run check
npm run build-storybook
npm run build
```

The build cleans generated output before compilation so removed modules cannot remain in published packages.

### Tests and coverage

`npm test` runs every Vitest project: the Storybook interaction stories, the
button/focus contrast checks, the `unit` project (`tests/unit`, real Chromium
through Playwright) and the `ssr` project (`tests/ssr`, Node server rendering
for components that render nothing without a `document`). Run
`npx playwright install chromium` once before the browser projects.

`npm run test:coverage` writes an Istanbul-format V8 report to
`coverage/coverage-final.json`. The Clouseau gate requires exactly 100% line
and branch coverage over every non-test file in `src`; new behaviour needs a
test in `tests/unit` or `tests/ssr`, never a coverage pragma.

## Pull request verification

Local agent review uses the shared `clouseau` skill with the developer's
authenticated coding harness and the `.clouseau-local.json` recipe; it needs no
CI provider keys. `AGENTS.md` owns the rule: run it against the final committed
change before opening a PR, repair findings, and publish the passing signed
receipt in the initial ready PR body. Never push directly to `main`.

Every PR runs, on `ubuntu-24.04` with Chromium installed for Playwright:

- the token, type, export/story, Kolibri, select-reset and theme checks,
- `npm run test:coverage`: every Vitest project (Storybook interactions, contrast,
  unit and SSR) in one run, with exactly 100% line and branch coverage over `src`
  (CI retries a failed Storybook story twice before reporting it),
- `npm run build` and `npm run build-storybook`,
- the workflow-contract tests in `.github/tests`.

A PR carrying an authenticated local review stamp is verified by the pinned
Clouseau engine without AI credentials; unstamped PRs use the CI reviewer.
Passing reviews receive a bot approval and native auto-merge. Unresolved
product-direction questions go to the owner, and changes to review controls need
the owner's `/approve-intent <head SHA>` comment. See [the purpose
contract](.github/clouseau.md). The CI engine is resolved from protected
Clouseau `main` at the start of each run (see
[automatic Clouseau CI upgrades](https://github.com/gaulatti/clouseau/blob/main/docs/automatic-ci-upgrades.md)).

A merge to `main` is not an npm release: package publication stays a separate,
explicitly authorized tag-triggered workflow, and the Storybook deployment
workflow is outside this review contract.

CI needs these repository secrets: `DEEPSEEK_API_KEY` and `TYPESAFE_API_KEY` for
the CI reviewer, and `DEPLOYMENT_TOKEN` (a token with contents write access
from an identity other than `github-actions[bot]`) for automatic repairs.

## License

Bleecker, including its published npm versions, is available under the
[MIT License](LICENSE).
See the `LICENSE` file for the full text.
