# Field placeholder contrast

Enabled Input and Textarea placeholders must retain at least 4.5:1 contrast
against their actual field background for ordinary text. They use the existing
secondary-text semantic color; no new palette or theme is introduced. A
placeholder remains a hint, not a replacement for an associated label.

A native Chrome inspection of published 0.1.42 found an enabled, 14px regular
placeholder using `#595959` at 55% alpha over white: approximately 2.50:1. The
same default opacity occurs in both Input and Textarea. Dark placeholders already
use opaque secondary text. CommandSpotlight has a separate opaque default and
does not need this repair.

The feature path is the shared field's default class → generated Tailwind CSS →
the mounted browser `::placeholder` style → its composite over the actual field
background. Input sizes/icons/error states and Textarea sizes/error states use
that same path. SearchInput, form fields, login, tables, filters and media search
that compose these primitives inherit the default; no value, request, validation,
persistence, focus, geometry, disabled-state or API contract changes are needed.
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

The initial fixture commit deliberately retains the old defaults so remote CI
can establish the failing browser boundary before the two shared defaults are
repaired. Native consumer failure is already recorded; repaired browser/native
results must be reported separately. Package version, dependencies, tokens and
release workflows are unchanged. Publication and permanent consumer adoption
remain separate release decisions.

References: [Storybook 10.3.3 interaction tests](https://github.com/storybookjs/storybook/blob/v10.3.3/docs/writing-tests/interaction-testing.mdx),
[Tailwind 4.2.2 variants](https://github.com/tailwindlabs/tailwindcss/blob/v4.2.2/packages/tailwindcss/src/variants.ts),
[WCAG 2.2 contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [relative luminance](https://www.w3.org/WAI/GL/wiki/Relative_luminance).
