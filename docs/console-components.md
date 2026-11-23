# Console components (bleecker#549, #551, #568)

Seven additive components for dense, live surfaces such as a radio or TV console. Nothing existing
changes: `Kbd` and `StatusBadge` keep their API and look, and the new names sit beside them.

| Component | Replaces or extends | Props (the contract consumers code against) |
|---|---|---|
| `StatePill` | the successor of `StatusBadge` for dense rows | `tone: 'live' \| 'ok' \| 'warn' \| 'bad' \| 'arm' \| 'info' \| 'idle'`, `label`, `pulse?`, `size?: 'sm' \| 'md'` (default `md`, 12 px), `title?`, `className?` |
| `KeyCap` | a new styling of `Kbd` | `children` or `keys?: string[]` (a chord), `className?` |
| `SegmentedFilter` | built on `ToggleGroup` | `label`, `options: { value, label, count? }[]`, `value`, `onChange(value)` (always one chosen) |
| `Meter` | a reading and its scale | `label`, `unit?`, `value: number \| null`, `min`, `max`, `warnFrom?`, `peak?`, `hold?`, `orientation?: 'horizontal' \| 'vertical'` (default horizontal) |
| `Fader` | replaces a range input for a level (#568) | `label`, `value`, `onValueChange(value)`, `min`, `max`, `unit: 'db' \| 'percent'`, `unity?`, `step?` (0.5 dB or 1 %), `coarseStep?` (ten steps), `orientation?: 'vertical' \| 'horizontal'` (default vertical), `length?` (CSS, default `12rem`), `meter?: { value, peak?, hold?, warnFrom? }`, `disabled?`, `taper?: { toPosition, fromPosition }`, `marks?: (number \| { value, label? })[]`, `format?: (value) => string` |
| `ArmTake` | a control that cannot fire by accident | `label`, `onTake`, `holdMs = 800`, `armTimeoutMs = 5000`, `disabled?` |
| `Transport` | one shared transport for a list of audio | `title`, `subtitle?`, `position`, `duration: number \| null`, `playing`, `cues?: { at, label }[]`, `onToggle`, `onSeek?`, `onPrev?`, `onNext?`, `disabled?` |
| `OnAirStrip` | a one-row console status strip | `state: 'live' \| 'armed' \| 'idle'`, `stateLabel?`, `now?`, `next?`, `pills?: { tone, label, title? }[]`, `clock?`, `idleText?` |

## Behaviour that goes on air

- **ArmTake** never fires on a single click. Hold it for `holdMs` (a fill shows progress), or press
  it twice (the first press arms it, the second takes). An armed control disarms itself after
  `armTimeoutMs`, on Escape and on blur. With `prefers-reduced-motion: reduce` there is no hold and
  no fill, only the two presses. The click that ends a completed hold does not arm it again.
- **Transport** is presentational: the page owns the audio element. On the timeline, Space toggles,
  the left and right arrows seek five seconds, Home and End go to the ends, and a click seeks.
- **Meter** does not animate; the page feeds it values. `role="meter"` with a readable value text.
  `orientation='vertical'` fills from the bottom, for a meter beside a vertical fader.
- **Fader** is a `role="slider"` with its unit in the value text ("−6.0 dB", "75 %") and a readout in
  tabular numerals. Arrows step by `step`, Shift with an arrow or Page Up / Page Down by `coarseStep`,
  Home and End go to the limits, and **0** or a double-click returns to `unity` (drawn as a mark).
  From a value between steps, the first press of any step key (an arrow, Shift with an arrow, or
  Page Up / Page Down) lands on the nearest fine step in that direction, then steps as usual. A pointer
  sets the value where it lands on the track and drags from there. With `meter`, a `Meter` on the same
  scale sits beside the track. Mute and solo stay separate controls.
- **Fader with a taper:** `taper.toPosition(value)` gives where a value sits along the travel (0 to 1)
  and `fromPosition` is its inverse, for a console curve (for example −15 dB at half travel). The track,
  cap, unity mark, `marks` and pointer follow it; keys still step in the value's unit, and the value,
  readout and announcement stay in that unit, and `min`–`max` must cover what the taper maps (its floor and
  top). `marks` are labelled scale ticks: by default the value rounded (−80 shows as `-80`), or a mark's own
  `label` (`{ value: -80, label: '−∞' }` shows `−∞`). A value the taper cannot map (NaN) is never reported. `format` replaces the readout and the announcement (for example `−∞ dB`
  at the floor). A paired `meter` stays linear on `min`–`max`, so a consumer with a taper keeps its own
  meter. Without these props the Fader is unchanged.
- **StatePill** and **StatusBadge** take `size`: `md` (default) is 12 px, the console's minimum text size; `sm` keeps the earlier 11 px. `StatusBadge`'s `className` reaches its wrapper, not the badge.
- **StatePill** carries its state in words; colour never carries it alone. `pulse` honours reduced motion.
- **SegmentedFilter** keeps one segment chosen: pressing the chosen one again does nothing.

## List rows (bleecker#566)

Additive, for the actions of a list row:

| Export | What it is | Contract |
|---|---|---|
| `IconButton` `tone` | `neutral` (default, today's look) or `danger` (destructive colour on hover and focus, danger focus ring, `data-tone="danger"`) | `tone?: 'neutral' \| 'danger'` |
| `RowActions` | one visible primary action plus an overflow menu | `label` (names the row in every accessible label), `primary?: { icon?, label, onSelect }`, `items: { label, icon?, onSelect }[]` plus destructive items `{ label, icon?, onSelect, destructive: true, confirm: string }` (`confirm` is required on them), `confirmStyle?: 'dialog' \| 'inline'` (default dialog), `moreLabel?` |

- The primary is the safe action; the screen chooses which. With an icon it is an `IconButton` with a tooltip, without one a small button. Both are labelled `"<primary> <row label>"`.
- Destructive items sit at the bottom of the menu, apart from the others by a separator, in the danger tone.
- A destructive item always asks first (the type requires `confirm`): `dialog` opens an `AlertDialog` titled with the `confirm` text; `inline` swaps the row's controls for that question with a destructive confirm button (focused) and Cancel, and Escape cancels. Choosing the item never runs it.
- Keyboard: Tab reaches the primary, then the menu button; Enter or Space opens the menu on its first item; arrows move; Escape closes and returns focus to the menu button.

## Notice (bleecker#571)

`Notice` is a persistent inline message for a card or a section; `Alert` stays the transient toast. Additive.

- Props: `tone: 'info' | 'warn' | 'bad' | 'ok'`, `title?`, `children?`, `action?` (for example a Retry button), `icon?`, `label?` (the tone word, default Info, Warning, Error or Done), `onDismiss?` with `dismissLabel?` (default "Dismiss"), `className?`.
- `bad` announces as `role="alert"`, the others as `role="status"`. The tone is carried by the icon and the tone word as well as colour.
- Colours come from the same tone map as `StatePill` (`utils/status-tones`); `StatePill`'s output is unchanged. In the dark theme the `bad` text is lightened a little, because the pill's own colour measures 4.4:1 on a tinted card and a notice carries a sentence (`tests/notice.browser.test.tsx` measures every tone on the background, card and muted surfaces in both themes, at 4.5:1).
