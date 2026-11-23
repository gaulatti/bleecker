# Console components (bleecker#549, #551, #568)

Seven additive components for dense, live surfaces such as a radio or TV console. Nothing existing
changes: `Kbd` and `StatusBadge` keep their API and look, and the new names sit beside them.

| Component | Replaces or extends | Props (the contract consumers code against) |
|---|---|---|
| `StatePill` | the successor of `StatusBadge` for dense rows | `tone: 'live' \| 'ok' \| 'warn' \| 'bad' \| 'arm' \| 'info' \| 'idle'`, `label`, `pulse?`, `title?`, `className?` |
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
  readout and announcement stay in that unit. `marks` are labelled scale ticks (their value rounded, or
  their own `label`, such as `−∞`). `format` replaces the readout and the announcement (for example `−∞ dB`
  at the floor). A paired `meter` stays linear on `min`–`max`, so a consumer with a taper keeps its own
  meter. Without these props the Fader is unchanged.
- **StatePill** carries its state in words; colour never carries it alone. `pulse` honours reduced motion.
- **SegmentedFilter** keeps one segment chosen: pressing the chosen one again does nothing.
