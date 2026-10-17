# Controlled Select reset

`Select` requires a string `value`. A parent clearing that value to `''` must
restore the supplied placeholder when there is no explicit empty-valued option.
Selecting again must update the displayed choice, callback and named native form
entry consistently. This candidate changes only the expression that passes that
required value to Radix; it adds no default choice or uncontrolled mode.

## Feature path

The parent supplies the string -> Bleecker preserves it in `Select.Root.value` ->
Radix's controlled state supplies the trigger and native select -> Radix's native
select effect updates its value and dispatches a change -> a named field supplies
the ordinary form's `FormData`. Selection callbacks continue to return public
strings. An explicit empty-valued option retains the existing internal marker,
label and callback translation; this release does not change that branch.
Sentinel serialization through a named native field in that existing mode is not
established by the no-empty-option reset test and is not repaired here.

The locked Radix Select **2.3.7** resolves its nested controllable-state **1.2.6**.
The separate top-level 1.2.2 installation is not the hook Select imports. The
resolved hook identifies controlled state with `prop !== undefined`. Select's
`shouldShowPlaceholder` accepts an empty string, and `SelectBubbleInput` updates
the native select through its actual value setter after mount. The public
[Radix documentation](https://www.radix-ui.com/primitives/docs/components/select)
currently describes 2.3.8; the exact installed 2.3.7 distribution is the authority
for this change. No dependency or React peer range changes.

Ariston's ordinary `DynamicForm` passes its React Hook Form field value as a
string and filters empty-valued options out of ordinary selects. Its
`reset(initialValues)` is an external parent reset. That consumer submits its
validated form model as JSON, rather than reading DOM `FormData`, and it owns its
required-field rules. The library's named form fixture and that application path
are separate acceptance boundaries; a hidden-field test cannot establish the
application's request behavior. The library extraction changes no Ariston source
or dependency declaration. The later temporary runtime-overlay trial below was
restored to the original normal package afterward.

## Fixtures and checks

**Controlled Empty** has no play function. Use normal input to choose Madrid,
read the form, clear the choice, read again, choose Tokyo and clear again. The
visible choice, callback history, native value and form entry must agree. An
external clear does not invent a new selection callback. Adjacent fictional
writing must remain exact. **Controlled Empty Regression** records that sequence
for the existing browser runner. **Empty Option And Reading** retains an explicit
empty option and a disabled saved choice.

`npm run test:select-reset` renders the real source Select and pinned Radix through
SSR. It observes their actual value/callback boundary and verifies real named-field
and trigger markup. The controlled-empty assertion fails against unchanged main.
The command is included before the browser suite in `npm run check`. These checks
create no browser or DOM and do not prove mounted option registration, native
reset effects, selected labels or post-reset `FormData`.

The native trial below exercises the actual packed fixture, including choose ->
clear -> reselect, the explicit empty option, disabled reading and retained
writing. Source checks, full strict affected-story types, normal prepack/runtime,
package/Storybook builds and packed public Select consumers on React 18.2.0 and
19.2.4 pass separately. The local default browser suite remains unrun under the
native-only restriction; allowed Node/build checks are not the full default
chain. Existing source head `051b6aa` passed remote quality CI with 369 browser
cases across 110 story files. A later documentation head requires its own quality
run; the earlier head's result is not evidence for that later CI state.

## Recorded mounted native acceptance

On October 17, 2026, native Chrome exercised the actual `0.1.43` archive
`3b72d0c3f40f71d47bba15090f5675964d3e9889919b8575a1d8a0a164fd48a1`
through its public root and direct Select exports in inert production-built
fixtures. React 18.2.0 and 19.2.4 each passed at desktop size and at 390×844 CSS
pixels using the Desktop engine with a 50% preview. This is responsive emulation,
not a physical-device trial. No Storybook play or automated local browser runner
operated those fixtures.

Choosing and reading Madrid produced `mad` in both the native field and actual
`FormData`. External clear restored the placeholder and empty values in both;
keyboard reselection of Tokyo produced `tyo`, and another clear returned both to
empty. Callback history contained only actual user selections, with no callback
invented by a clear. Both peers retained the exact adjacent writing
“Fictional note — café 東京. More writing.” through all transitions. The popup
remained within the narrow frame.

The explicit empty option completed All pieces -> In stock -> All pieces on
React 19 desktop and React 18 narrow. Saved city remained disabled and visibly
New York; React 19 Tab navigation skipped it. The native-field/FormData reset
claim above concerns the named City field without an explicit empty option; it
does not establish sentinel-free serialization for the other existing mode.

React 19's sampled console showed a local `favicon.ico` 404, and the server also
recorded a DevTools discovery-endpoint 404. React 18's sampled default console
had no messages after its navigation and interactions. This is not a globally
clean-console claim. The four React 18 SSR layout-effect warnings remain
qualified separately: the same fixture against normal `0.1.42` produces the same
four warnings from unchanged hooks, with none suppressed.

Automatic height was restored, device emulation turned off and DevTools closed;
bottom docking, throttling, cache and rendering settings were preserved. Both
owned fixture servers were terminated. No application or Brokaw runtime was
changed. Screenshots were emitted in the conversation only, with no standalone
image artifact claimed. The immutable native receipt has SHA-256
`1cf5c55fdcce2ff636ebe7c8cb8e7801036758e4836296a77730124f9e034d7e`.

The packed fixture proves its named native/FormData boundary. The distinct
ordinary Ariston JSON-form trial is recorded below. Neither trial makes a
physical-device, VoiceOver, IME/composition, hydration or production claim.

## Recorded ordinary Ariston consumer acceptance

The same exact unpublished archive was temporarily mounted read-only over the
package in the normal Compose-served frontend, with application source and lock
unchanged. The actual consumer used React 19.2.3, React Hook Form 7.71.1, Radix
Select 2.3.7 and its nested controllable-state 1.2.6. Its standard typecheck and
production build passed once in bounded scratch using the actual dependencies
and archive. Normal visible TEST AUTH and guarded application paths remained in
use; this was not production Cognito acceptance.

With Language and Status empty, ordinary submission displayed both required
errors, and the actual browser Network view recorded zero article POST requests.
After keyboard selection of Spanish and Draft, one actual Create request returned
201. While that real request was pending under Chrome's 3G preset, the unchanged
parent reset supplied empty values and both Select trigger child texts visibly
changed to “Select…”. This verifies the external-reset boundary rather than only
an initially empty rendering or an accessible control name.

The captured actual JSON, its 201 response and a normal guarded GET agreed on
`es`, `draft`, existing author `1`, exact Unicode writing and social flags off.
There was exactly one new retained draft, `35`; no duplicate create or deletion
was performed. The original twelve article records and protected article/page
fixtures remained exact. Ordinary desktop reopening and a native deep-link reload
at 390×844 CSS pixels showed the unchanged writing, author and selected values.
The Language and Status menus fit the narrow frame. After actual pointer focus,
Space opened Language with Spanish selected; Escape dismissed it and restored
focus. Status likewise dismissed with focus restored. No changes were saved by
those reopen checks.

The parent already resets other fields and default social controls while a create
is pending. This change does not repair that parent policy; the captured submitted
JSON, rather than pending UI defaults, establishes what was sent. A controlled-
input warning from unchanged `DynamicForm` and an `aria-hidden` retained-focus
warning during accessibility-index activation were sampled. Later actual pointer/
keyboard open-and-Escape checks passed; this is not a clean-console or broader
accessibility claim. The private capture and extracted request/response bodies
were kept separate from public evidence and are not reproduced here. Draft and
publication metadata do not prove physical S3 live-output absence; no S3/provider
operation was part of this trial.

The normal `0.1.42` package was restored afterward. The restored frontend was
healthy and served HTTP 200; a real native reload again showed retained draft
`35` unchanged. Restoration verification preserved all 53,440 original dependency
files, application source/configuration/lock and the other 98 checked containers.
Browser overrides were restored and DevTools closed. The public native acceptance
receipt has SHA-256
`f2aff052f11f4e97010138bc933d571b29ed35fb76434dbdd6cabccca0c0eec6`;
its separate root review accepts the scoped behavior and completed restoration.
This is temporary local consumer acceptance, not permanent dependency adoption.

## Release boundary

This isolated candidate starts from main `a860590`. Its prepared package version
is **0.1.43**; the registry's latest version was 0.1.42 when preparation began.
It is not published. The separate required managed-rules updater changed managed
metadata only. The public wiki was unavailable, so this document records the
contract in the repository.

The preserved Select-writing/composition, modal lifecycle/hydration and command
accessibility candidates are not included. This change makes no IME, screen-reader,
streaming hydration, broader accessibility or production claim. Package review,
release CI, tag/publication and exact registry artifact verification are separate
steps. The temporary ordinary Ariston form trial above passed and was restored;
permanent adoption of a verified published package still needs its own scoped
dependency update and delivery checks. There is no backend, API, publication-state,
infrastructure or telemetry behavior change here.
