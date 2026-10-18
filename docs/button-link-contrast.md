# Link button hover contrast

The link Button is transparent, so its text must remain readable against its
themed ancestor surface. Normal dark text uses accent blue (`#5ba3f5`). The old
dark hover utility uses light sand, which resolves to the dark background
`#0d1821`; against a card (`#182533`) that is only 1.155:1 contrast.

The repair keeps accent blue on dark hover and retains the underline
as its hover cue. On dark canvas, card, muted and dark-sand surfaces its
calculated contrast is respectively 6.841:1, 5.922:1, 6.015:1 and 4.829:1.
The light theme keeps its existing normal/hover colors. No tokens, props,
callbacks, focus styles, anchor semantics or dependency declarations change.
An explicit caller `dark:hover:` text class remains authoritative.

## Acceptance and regression boundary

`Components/Button/LinkLightSurfaces` and `LinkDarkSurfaces` render the actual
Button and its anchor branch over opaque theme surfaces, plus an explicit
caller override. Each fixture owns its controlled ThemeProvider; only these
stories skip the outer persisted provider. The shared helper is not a
`.stories.tsx` file, is not registered separately and is outside package source.
The existing export/story checker is unchanged.

The dedicated `button-link-contrast` Vitest project includes only
`tests/button-link.browser.test.tsx`. It uses the existing Chromium provider
and actual generated CSS, and runs through the existing `npm test`/`npm run
check` workflow. It does not duplicate the Storybook project or enter the
package build. Tests move the real pointer, assert `:hover`, wait for the
actual color transition, then check computed foreground, transparent control
background, opaque ancestor background, contrast of at least 4.5:1 and
underline. They also exercise button/anchor pointer and keyboard activation,
Tab order, the in-page anchor and the caller's explicit dark-hover override.
Synthetic testing-library hover or JSDOM alone does not prove this boundary.

The old runtime class is intentionally retained in the first regression commit
to obtain a remote RED result. The one-token repair follows on the same draft
PR; a terminal GREEN result, source binding and qualified native acceptance
remain required before release. No local automated browser process is run.

## Audited consumers and limits

Twelve direct link-Button uses occur in CollectionFilters, the Button hierarchy
story, ApplicationPages, five LuxuryPages locations and four PublicPages
locations. Custom template colors remain caller-owned. Sonner's link action
uses a separate raw button and has no light-sand hover rule. Transparent
consumer title and attention actions inherit the shared Button rule.

Fixed-white PublicPages islands under a globally dark document already have
insufficient normal dark-blue contrast (2.624:1). This focused dark-surface
repair does not establish a local light-surface appearance policy or restyle
those templates. In particular, globally switching hover to text-primary
would be only 1.105:1 on white. Arbitrary backgrounds, disabled controls,
physical hover, full accessibility and consumer adoption are not covered by
this targeted acceptance.

Framework authority: locked [Vitest 4.1.1 projects](https://github.com/vitest-dev/vitest/blob/v4.1.1/docs/guide/projects.md),
[real browser interactivity](https://github.com/vitest-dev/vitest/blob/v4.1.1/docs/api/browser/interactivity.md),
and [Storybook 10.3.3's separate-project guidance](https://github.com/storybookjs/storybook/blob/v10.3.3/docs/writing-tests/integrations/vitest-addon/index.mdx).
The generated utilities use Tailwind CSS 4.2.2. Contrast uses the
[WCAG 2.2 normal-text calculation and threshold](https://www.w3.org/TR/WCAG22/#contrast-minimum);
these fixture ratios are not a full-page conformance claim. The public wiki
was unavailable during the required rules refresh; this contract is maintained
in-repository.
