# Field placeholder contrast

Enabled Input and Textarea placeholders must retain at least 4.5:1 contrast
against their actual field background for ordinary text. They use the existing
opaque secondary-text semantic color; no new palette or theme is introduced. A
placeholder remains a hint, not a replacement for an associated label.

A native Chrome inspection of published 0.1.42 found an enabled, 14px regular
placeholder using `#595959` at 55% alpha over white: approximately 2.50:1. The
same default opacity previously occurred in both Input and Textarea. The repair
removes that alpha reduction from both shared defaults. Dark placeholders retain
their existing opaque secondary text. CommandSpotlight has a separate opaque default and
does not need this repair.

The feature path is the shared field's default class → generated Tailwind CSS →
the mounted browser `::placeholder` style → its composite over the actual field
background. Input sizes/icons/error states and Textarea sizes/error states use
that same path. SearchInput, form fields, login, tables, filters and media search
that compose these primitives inherit the default; no value, request, validation,
persistence, focus, geometry or API contract changes are needed. Existing disabled
attributes and opacity modifiers remain; these fixtures measure enabled fields.
Explicit `className` color overrides remain supported; their contrast belongs to
the caller's chosen colors and backing surface.

`Components/FieldPlaceholders` registers separate light/dark Input and Textarea
stories in the normal Storybook browser suite. Each measures four real enabled
fields, reads their computed pseudo-element/background styles, and uses the
browser's sRGB Canvas2D implementation to normalize modern CSS colors and alpha
before calculating WCAG relative luminance. An unsupported color, missing canvas
or nonopaque backing fails explicitly. The stories also verify a caller color
override and controlled Unicode typing/clearing. They do not substitute for
native consumer acceptance or claim disabled, pointer, device or complete
accessibility coverage.

The [old-source browser run](https://github.com/gaulatti/bleecker/actions/runs/39147863462)
reproduced both light-mode failures at 2.4926545:1 against the 4.5:1 requirement;
372 browser cases, including both new dark stories, passed. Its canvas
normalization uses 8-bit sRGB pixels; the separate native computed-style
calculation was approximately 2.50:1. The same four mounted stories run against
the repaired defaults in normal [PR checks](https://github.com/gaulatti/bleecker/pull/13/checks).
Exact-head browser results and repaired native consumer acceptance are distinct
evidence; no local automated browser run or repaired native acceptance is claimed
here. Package version, dependencies, tokens and release workflows are unchanged.
Publication and permanent consumer adoption remain separate release decisions.

References: [Storybook 10.3.3 interaction tests](https://github.com/storybookjs/storybook/blob/v10.3.3/docs/writing-tests/interaction-testing.mdx),
[Tailwind 4.2.2 variants](https://github.com/tailwindlabs/tailwindcss/blob/v4.2.2/packages/tailwindcss/src/variants.ts),
[WCAG 2.2 contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [relative luminance](https://www.w3.org/WAI/GL/wiki/Relative_luminance).
