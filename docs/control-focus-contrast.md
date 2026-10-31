# Button and icon keyboard-focus contrast

Button and IconButton replace the native outline with a 2px focus-visible ring
and a separate 2px opaque offset. The old ring uses sea at 35%/30% in light
mode and accent blue at 45%/40% in dark mode. Alpha compositing over white gives
approximately 1.775:1/1.623:1; over a dark card, 2.307:1/2.095:1. These are
ring-only source calculations until actual keyboard focus and rendered styles
are verified.

The bounded repair removes those four alpha suffixes. It preserves geometry,
offsets, palette, props, activation, disabled behavior and every other state.
All Button variants and both its button/anchor branches inherit the same base
focus classes; no variant overrides them. An explicit caller focus color still
wins through the existing class merge. IconButton supplies the same shared cue
to ThemeToggle and icon overlay triggers. DialogCloseButton already uses an
opaque ring and remains unchanged as a positive control.

## Observable boundary

`Components/ControlFocus/LightSurfaces` and `DarkSurfaces` share the actual
Button, IconButton and DialogCloseButton implementation across opaque canvas,
card, muted and dark-sand theme surfaces. Each fixture owns its controlled
ThemeProvider, so these stories skip the outer persisted provider. The helper
is not a registered story or package export. The existing story/export checker
is unchanged.

The dedicated `control-focus-contrast` Vitest browser project includes only
`tests/control-focus.browser.test.tsx`. Existing Storybook and link-hover
projects retain their scopes. The focused tests use the existing Chromium
provider, real Tab keys, activeElement and `:focus-visible`; they do not focus
the target directly or force CSS states. After the actual transition, they
inspect computed outline and every shadow layer. The ring's alpha is composited
over the verified opaque adjacent surface, and its contrast must be at least
3:1 against both that outer surface and the separate inner offset. Unsupported
colors, shadow geometry and non-opaque backing fail explicitly. The existing
close button, caller override and button/anchor/icon keyboard activation are
checked too. The browser converts actual computed CSS colors to sRGB; canvas
8-bit alpha quantization can slightly change the recorded old-rule ratios.

The first regression commit intentionally retains the old runtime for remote
RED evidence. Only after an actual keyboard-ring contrast failure is established
does the four-token repair follow on the same draft PR. Remote GREEN, source
binding and qualified native acceptance remain release gates. No local
automated browser process is run.

## Scope and standards

WCAG 2.2 [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
is AA and assesses required visual state information against adjacent colors;
[2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
requires visible keyboard focus. The area and focused-versus-unfocused pixel
requirements of [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
are AAA and are not asserted here. This is not a complete accessibility audit.

Inputs and Textarea remain unchanged. Their caret and focus border are additional
indicators; a low-contrast outer field ring alone does not establish failure.
The W3C's Non-text Contrast figure 33 explicitly accepts a sufficiently visible
caret despite a faint surrounding outline. No new token, general field-border
policy, arbitrary-background guarantee or consumer adoption is introduced.

Framework authority: locked [Vitest 4.1.1 projects](https://github.com/vitest-dev/vitest/blob/v4.1.1/docs/guide/projects.md),
[real keyboard interactivity](https://github.com/vitest-dev/vitest/blob/v4.1.1/docs/api/browser/interactivity.md#usereventtab),
and [Storybook 10.3.3's separate-project guidance](https://github.com/storybookjs/storybook/blob/v10.3.3/docs/writing-tests/integrations/vitest-addon/index.mdx).
The generated utilities use Tailwind CSS 4.2.2. The public wiki was unavailable
during the required rules refresh; this contract is maintained in-repository.

Back to the [README](../README.md).
