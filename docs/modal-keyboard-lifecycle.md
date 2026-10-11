# Drawer and Sheet keyboard lifecycle

Drawer and Sheet share `useModalLayer`. When an open panel attaches to the DOM,
focus moves to its first visible, enabled Tab stop, or to the panel itself when
there are no controls. Opening from a closed state must work even when entrance
presence mounts the portal in a later React commit.

Tab and Shift-Tab wrap within the active panel. The control list is recalculated
for each key event, including dynamically added or removed controls. Hidden,
inert, disabled, disabled-fieldset, and negative-tab-index controls are excluded.
Escape dismisses the topmost Bleecker modal. A nested selection popup can consume
Escape first; the panel remains open. Closing a child restores focus within its
parent. Closing the final modal restores the connected opening control.

The document has one shared body scroll lock. Closing or unmounting a parent
while a child is open does not unlock the background. Removing the final panel
restores the prior inline overflow value. Listeners and stack entries are removed
on closure or unmount. A closing panel is inert and hidden from accessibility
navigation during its retained exit animation; the backdrop no longer intercepts
pointer input.

The public Drawer, Sheet, and object-ref hook signatures are unchanged. Motion,
tokens, typography, geometry, SSR guards, and the reduced-motion stylesheet remain
the established Bleecker contract. The hook observes DOM attachment after each
commit so callers can retain the object ref; unchanged attachments do not restart
the modal effect. Custom hook consumers must attach that ref to a focusable panel
(normally `tabIndex={-1}`), and provide a meaningful accessible dialog name.

## Regression fixtures

Storybook includes these interaction fixtures:

- Drawer and Sheet / **Keyboard Lifecycle**: closed-to-open focus, forward and
  reverse Tab, disabled/hidden controls, selection-popup Escape, dynamic actions,
  nested Sheet dismissal, callback changes, reopening during exit, and unmount.
- Drawer and Sheet / **Initially Open**: activation without a trigger click.
- Drawer and Sheet / **Parent Unmount**: a nested Sheet survives parent removal
  and retains the scroll lock, then restores the original page trigger.
- Drawer / **Empty And Dynamic**: panel focus followed by a newly arriving action.

The normal Chromium suite runs all stories. A second browser instance runs the
Drawer and Sheet stories at 390 × 844 with `prefers-reduced-motion: reduce`; the
keyboard fixture checks the actual media query, viewport, and computed transition
duration. Use `npm run check`, `npm run build`, and `npm run build-storybook`.

## Evidence and delivery boundary

The previous implementation fails both closed-to-open keyboard regressions:
focus remains on **Open panel** behind the modal. The repaired browser fixtures
exercise the real components, presence hook, body portal, and keyboard events.

Manual Chrome verification at 390 × 844 checks Drawer / Default and Sheet / Right:
focus enters the panel, Shift-Tab reaches its final action, Tab wraps to its first
action, Escape closes the panel, focus returns to the trigger, and overflow is
restored. The screenshots show the visible keyboard focus ring:

![Drawer mobile keyboard focus](evidence/drawer-mobile-focus.png)
![Sheet mobile keyboard focus](evidence/sheet-mobile-focus.png)

This evidence covers local Bleecker behavior. Package publication, Ariston's
dependency update, its Compose-served application workflow, CI, and production
deployment are separate release steps. A package build does not establish that a
consumer has received the fix. No backend or telemetry behavior changes here.

Local validation on 2026-10-10: `npm run check` passed 346 tests across 110 story
files/instances, including the 12 repeated modal stories under reduced motion.
The package and Storybook builds passed. After replacing the empty-panel fixture's
timer with an explicit Arrow Down action, all 24 modal story runs passed again.
The explicit action keeps the empty-state assertion independent of CPU timing.

The public repository wiki remote was unavailable during the mandatory freshness
check; documentation is maintained here until that wiki becomes accessible.
