# Controlled themes

## Acceptance and boundary

This change adds an explicit parent-owned theme for hosts that cannot expose
browser storage. A controlled provider must mount, accept parent updates and
handle `setTheme`/`cycleTheme` without even reading the `window.localStorage`
property. Requests notify the parent; the supplied theme remains authoritative
until that parent changes it. `system` still follows the media preference, and
the resolved theme still updates the document's `dark` class.

Existing providers without a `theme` prop keep their stored-theme reads, writes,
default validation, custom keys and cycling behavior. There is no storage-error
fallback. The opaque-host regression mounts the real provider and toggle in an
opaque JSDOM document with a throwing storage getter. This establishes effects
and state ownership, not native sandbox, paint, focus or accessibility acceptance.

The feature path is parent props → ThemeProvider → useTheme/ThemeToggle requests
→ parent update → resolved mode/document class. The persisted head script is a
separate entry point; controlled hosts must not include `BleeckerThemeScript` or
`getThemeScript`, which intentionally bootstrap an uncontrolled stored theme.

## API and consumers

```tsx
const [theme, setTheme] = React.useState<ThemeMode>('light');
<ThemeProvider theme={theme} onThemeChange={setTheme}>
  <ThemeToggle />
</ThemeProvider>
```

The controlled variant requires the callback and excludes `defaultTheme` and
`storageKey`; the existing uncontrolled variant accepts both. `useTheme()` keeps
its existing fields, including `storageKey: string`. That compatibility field
does not cause controlled persistence. Consumers must not use it to access
storage when their host forbids storage. ThemeToggle only requests a mode.

The exported `ThemeProviderProps` interface retains its original uncontrolled
shape, including support for existing interfaces that extend it. New controlled
annotations use `ControlledThemeProviderProps`; wrappers accepting either mode
use the strict `ThemeProviderOptions` union consumed by the component. All are
available from the existing root and `theme/types` export paths.

Mode ownership is determined by whether `theme` is supplied. If a caller
intentionally changes to the uncontrolled variant, initialization reads that
variant's selected key/default. A change to controlled mode immediately makes
the prop authoritative and stops persistence. Existing uncontrolled key/default
changes continue to reread their stored preference.

`Components/ThemeToggle/Controlled` is an inert native fixture. Accept or reject
requests, observe the parent/provider readouts, and use the independent parent
update. This story owns its provider, so its explicit Storybook parameter skips
the outer persisted decorator and avoids two owners of the document class.
Ordinary stories retain the original decorator. This fixture does not claim to
be an opaque sandbox. Actual opaque host rendering
and host appearance ownership require their own consumer acceptance.

`npm run test:theme` compiles the real provider, hook and toggle into an IIFE and
mounts them inside JSDOM's own opaque window. `npm run typecheck:theme` checks
valid legacy/controlled calls and invalid ownership combinations through the
public root and direct imports. Both are in the normal check chain. The existing
browser leg remains in that chain; local native-only restrictions do not turn
the Node checks into a substitute for it.

## Verification and release boundary

The unchanged provider fails the controlled opaque-storage mount; its existing
persisted-default case passes. The repaired source passes four mounted cases:
controlled requests/prop updates, persisted behavior, ownership transitions, and
an initial system mode with a dark media preference. StrictMode, listener cleanup,
callback replacement, refused requests and zero storage-property evaluations are
included. No exception-based storage recovery is added.

Source types, public ownership examples (including legacy interface extension
and spreads), token/export/story checks, five Kolibri cases, three existing Select
cases, the normal package prepack/build and static Storybook build pass on Node
24.21.0. The corrected local pack passes the same four mounted cases and full
public declaration checking separately on actual React/ReactDOM 18.2.0 and
19.2.4, with their matching installed peer type declarations. These are fresh
controlled-theme checks, not inherited Select evidence. No extra peer install
was needed; isolated fixtures reuse existing peer libraries read-only.

JSDOM 30.1.2 is an exact dev-only dependency. It and its new CSS-color/DOM-selector
dependencies require `lru-cache ^11.5.3`, so the existing dev-only 11.2.7 entry
advances to 11.5.3. All other prior lock entries, runtime/peer declarations and
package version remain unchanged.

The local artifact retains version 0.1.43 for testing only. It is distinct from
the earlier Select-only release artifact and does not change that release's
approval. No npm publication, version/tag selection, consumer adoption, remote
push, deployment or backend/infrastructure behavior change is included. The
existing default browser test leg, native opaque-sandbox rendering and consumer
appearance bridge remain explicit review/acceptance gates.

Framework authority: the locked React 19.2.4 and minimum React 18.2.0 hook APIs
are checked against their official
[19.2.4](https://github.com/facebook/react/blob/v19.2.4/packages/react/src/ReactHooks.js)
and [18.2.0](https://github.com/facebook/react/blob/v18.2.0/packages/react/src/ReactHooks.js)
sources. The DOM test uses the exact
[JSDOM 30.1.2 documentation](https://github.com/jsdom/jsdom/blob/v30.1.2/README.md).
The public repository wiki was unavailable during the required rules refresh.
