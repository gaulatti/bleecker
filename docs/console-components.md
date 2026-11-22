# Console components (bleecker#549, #551)

Seven additive components for dense, live surfaces such as a radio or TV console. Nothing existing
changes: `Kbd` and `StatusBadge` keep their API and look, and the new names sit beside them.

| Component | Replaces or extends | Props (the contract consumers code against) |
|---|---|---|
| `StatePill` | the successor of `StatusBadge` for dense rows | `tone: 'live' \| 'ok' \| 'warn' \| 'bad' \| 'arm' \| 'info' \| 'idle'`, `label`, `pulse?`, `title?`, `className?` |
| `KeyCap` | a new styling of `Kbd` | `children` or `keys?: string[]` (a chord), `className?` |
| `SegmentedFilter` | built on `ToggleGroup` | `label`, `options: { value, label, count? }[]`, `value`, `onChange(value)` (always one chosen) |
| `Meter` | a reading and its scale | `label`, `unit?`, `value: number \| null`, `min`, `max`, `warnFrom?`, `peak?`, `hold?` |
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
- **StatePill** carries its state in words; colour never carries it alone. `pulse` honours reduced motion.
- **SegmentedFilter** keeps one segment chosen: pressing the chosen one again does nothing.
