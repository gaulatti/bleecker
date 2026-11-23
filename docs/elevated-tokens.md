# Elevated tokens and type scale (bleecker#549 phase 1, bleecker#550)

Everything here is **additive**. No existing token key, name or type changes, and no component changes
size or look until it opts in. Thompson reads `radii`, `spacing` and `themes` directly; `tests/unit/tokens.test.ts`
pins every existing export, key and type, so a removal or rename fails the build.

## New in `src/tokens/source.ts`
| Export | Values | CSS variable |
|---|---|---|
| `lightColors` / `darkColors` `.statusOk`, `.statusWarn`, `.statusBad` | light `#2f7d5b` `#a8741a` `#a65d57`; dark `#5cc49a` `#e0ac69` `#d47b75` (the proposal's values) | `--app-status-ok` / `-warn` / `-bad`, utilities `*-status-ok` etc. |
| `.statusIdle` | light `#767676`, dark `#8a9bb0` | `--app-status-idle` |
| `.rail`, `.railStrong` | light `#e9e1d3` `#d4c4a9`; dark `#22324a` `#2f4562` | `--app-rail`, `--app-rail-strong` |
| `.cue` | light `#8a5735`, dark `#e0ac69` (the existing accent-text pair) | `--app-cue` |
| `controlHeights` | dense 28, compact 32, small 36, default 40, large 48 (px) | `--control-height-dense` ... `-large` |
| `focusRing` | width 2, offset 2 (px) | `--focus-ring-width`, `--focus-ring-offset` |
| `fontSizes` | caps 11, caption 12, dense 13, body 14, section 20, readout 24 (px) | `--text-caps` ... `--text-readout` |
| `capsTracking` | 0.1 (em; the proposals use .08 to .14) | `--tracking-caps` |
| `monoFamily` | `ui-monospace` | `--font-readout` |

`statusIdle` and `cue` are not in the proposal's CSS; their values are chosen here (idle: a neutral that reads
on both backgrounds; cue: the existing accent-text colour) and are the owner's to adjust.

`--font-readout` is deliberately not `--font-mono`: components already use Tailwind's `font-mono`, and redefining
it would change them.

## Not in this change
Components that use the new tokens (`size="dense"`, `StatePill`, rails) are separate tickets that code against
the prop shapes pinned in bleecker#549. A release is cut separately (`npm version`).
