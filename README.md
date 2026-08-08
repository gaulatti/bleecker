# Bleecker

Bleecker is a refined React component library built around the Encode Sans typeface and a warm, restrained palette of sand, sea, desert, and terracotta.

## Install

```sh
npm install @gaulatti/bleecker
```

Import the compiled component styles once in your application:

```ts
import '@gaulatti/bleecker/styles.css';
```

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
