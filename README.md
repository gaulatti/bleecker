# Bleecker

Bleecker is a refined React component library built around the Encode Sans typeface and a warm, restrained palette of sand, sea, desert, and terracotta.

## Install

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

Applications that do not compile Tailwind should instead import the complete,
precompiled stylesheet once:

```ts
import '@gaulatti/bleecker/styles.css';
```

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
- Borders carry surface hierarchy; shadows are reserved for elevated surfaces and overlays.
- Controls use consistent 32, 40, and 48 pixel heights.
- Motion is brief and functional, with reduced-motion behavior included globally.

## Luxury composition

Luxury in Bleecker comes from editing and proportion, not decoration. The most reliable compositions use one dominant focal plane, one quieter supporting rail, and enough negative space for the hierarchy to remain obvious.

- Start with `PageFrame` so product pages share the same gutters, readable widths, and vertical cadence.
- Use `DetailLayout` for asymmetric detail pages, editorial views, and sticky summary rails instead of assembling new grid proportions each time.
- Use `AuthShell` for focused sign-in, invitation, and onboarding moments with an optional narrative panel.
- Prefer hairline borders for default surfaces. Reserve `Card`'s `elevated` variant and stronger shadows for the single surface that truly sits above the page.
- Keep supporting copy in `font-secondary`, eyebrow copy brief, and data labels at a readable contrast. A restrained accent should guide attention rather than tint every section.
- Avoid grids of equally weighted cards when one number, action, or story is more important. Give that item more scale or span and quiet the rest.

Storybook's **Templates** section includes complete public, operational, commerce, hospitality, and private-client compositions. Treat them as starting points: keep their hierarchy and rhythm, then replace the domain copy and content.

## Theming

The default light and dark themes are defined with `--app-*` custom properties in the stylesheet. Override those properties after importing Bleecker styles to adapt the theme without changing component markup.

The `ThemeProvider`, `ThemeToggle`, and `BleeckerThemeScript` exports provide persisted light, dark, and system modes. Render `BleeckerThemeScript` in the document head when server rendering to avoid a theme flash.

## Accessibility

Interactive overlays and selection controls use accessible behavioral primitives. Form controls forward native attributes; `Field` connects labels, descriptions, errors, and invalid state automatically.

Applications are still responsible for meaningful labels, logical page structure, and testing complete user flows in their own context.

## Shared foundations

Bleecker is the source of truth for platform-neutral component contracts and design tokens. These leaf exports do not import DOM components, CSS, Radix, Recharts, or ReactDOM:

```ts
import { buttonVariants, resolveTheme, type ButtonContract } from '@gaulatti/bleecker/core';
import { radii, spacing, themes } from '@gaulatti/bleecker/tokens';
```

`src/tokens/source.ts` is canonical. The web CSS token layer is generated from it during the build and checked for drift in CI. [Thompson](https://github.com/gaulatti/thompson), Bleecker's React Native sibling, consumes these exports and supplies native renderers.

## Development

```sh
npm ci
npm run check
npm run build-storybook
npm run build
```

The build cleans generated output before compilation so removed modules cannot remain in published packages.
