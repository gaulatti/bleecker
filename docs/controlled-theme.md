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
Ordinary stories retain the original decorator. This fixture is separate from
the actual opaque-host consumer acceptance recorded below.

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

Full remote [Check CI](https://github.com/gaulatti/bleecker/actions/runs/39144177583)
passed for implementation `4f4b926bcd10135ae0be2227afa7180dbb5ce79e`:
370 browser tests across 110 story files, four mounted theme cases, three
Select-reset cases, five Kolibri cases, contract/source/public types, package
build and Storybook build. The synthetic PR merge checkout
`d1d4eb519fcf8380c5f496bc013df30f77894b85` has the same Git tree as that
implementation. This is remote browser evidence; the browser leg was not run
locally.

Native Chrome checked the source-built controlled Storybook fixture: accepted
and refused requests retained parent ownership, keyboard Space requested system
mode and resolved the OS preference, and an independent parent update added no
request. The ordinary fixture cycled and retained saved dark mode after a fresh
document reload, then was restored to system mode. One initial default-story
navigation failed a dynamic import despite asset HTTP 304/200; a normal hard
reload resolved it without a source change.

The corrected local archive also rendered in an actual opaque-origin iframe
with its unchanged `allow-scripts`-only sandbox. Explicit host light/dark changes
painted correctly at desktop and 390-width responsive preview, with 844-height
metadata, using the desktop engine at 50% canvas scale. Original branding and
UTF-8 writing rendered, and exact Unicode text remained through appearance and
viewport changes. Native keyboard interaction remained functional. No storage
SecurityError was observed in this repaired run. The host owned appearance and
the consumer omitted its local theme toggle; the provider did not gain a host
adapter or storage fallback.

That native run observed CSP-blocked DevTools and two Lucide source-map
requests, a four-warning badge and two issues. It does not establish a globally
clean console, physical touch/device behavior, contrast measurement, or complete
accessibility acceptance. These provider checks close the native controlled,
default-persistence and opaque-host appearance gates for the tested artifacts;
they do not approve the whole consumer product. A compact public
[evidence record](evidence/controlled-theme-acceptance.json) binds the source,
archive, compiled fragment and sandbox wrapper without private consumer details.

The local artifact retains version 0.1.43 for testing only. It is distinct from
the earlier Select-only release artifact and does not change that release's
approval. Main merge/deployment, version/tag selection, npm publication and
permanent consumer adoption remain separate decisions. Consumer product/human
acceptance remains open. This documentation-only follow-up does not rebuild or
repack the tested archive; its new PR head requires its own remote CI result.
No backend/infrastructure behavior changes are included.

Framework authority: the locked React 19.2.4 and minimum React 18.2.0 hook APIs
are checked against their official
[19.2.4](https://github.com/facebook/react/blob/v19.2.4/packages/react/src/ReactHooks.js)
and [18.2.0](https://github.com/facebook/react/blob/v18.2.0/packages/react/src/ReactHooks.js)
sources. The DOM test uses the exact
[JSDOM 30.1.2 documentation](https://github.com/jsdom/jsdom/blob/v30.1.2/README.md).
The public repository wiki was unavailable during the required rules refresh.

Back to the [README](../README.md).
