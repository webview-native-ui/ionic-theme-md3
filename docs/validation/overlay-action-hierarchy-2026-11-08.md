# Overlay action hierarchy review — 2026-11-08

## Findings and correction

The Action Sheet's `preferred` action had an inset, filled pill among full-width
text rows. Its text started farther inward than the other choices, and Cancel had
no visible group boundary. This broke the visual hierarchy of a list of actions.

The preferred action now retains the ordinary row width, height and left alignment.
Primary text/icon color and medium weight indicate recommendation. Cancellation
retains Ionic's separate group, with 8 px spacing on either side of a 1 px divider.
The container paints the same public `--background` surface as its groups so spacing
does not expose the backdrop. These spacing choices are theme design decisions,
not claimed pixel measurements of a native Cancel group. Existing 52 px Ionic rows,
24 px horizontal padding, 28 px sheet corners and 640 px maximum width remain.

State testing found another Action Sheet defect: a destructive row lost its error
color on pointer hover. Preferred/destructive roles now provide Ionic's normal,
hover, focus and activated color variables; their icons inherit the same semantic
color. Disabled, selected, cancellation and preferred dismissal semantics remain
Ionic's. No JavaScript behavior or new markup was introduced.

## Search beyond Action Sheet

Reviewed the existing component gallery and obtained the current 42 normal route
variants in light/dark plus all 88 device-response scenes. A separate live sweep
opened 13 overlay scenes at 390×844 and 1280×844, each in light/dark: **52 cases**.
This included ordinary/preferred Action Sheets, preferred/destructive Alerts,
all four Select interfaces, Popover, normal/sheet Modal, Loading and Toast.
Actual Select and Popover triggers were clicked; hidden radio-icon parts were
excluded from the capture target. The 52 final captures passed and were inspected
in contact sheets, with Action Sheet images inspected at larger size.

No additional instance of the same mixed-row/CTA problem was found outside
Action Sheet. Alert's distinct action area is different from a list of sheet
choices: the recorded Android 17 Settings [Force stop confirmation](android17-tablet-2026-11-07/dialog-portrait-light.png)
uses an outlined Cancel and filled primary confirmation. Its appearance remains
unchanged here. Select selection states, Modal action bars and Toast actions also
remain unchanged. This is a scoped hierarchy review, not a claim that every
component, interaction state or OEM is identical to Android Settings.

The freshly opened Android 17 [Internet panel](overlay-action-hierarchy-2026-11-08/android17-internet-panel.png)
also separates its filled Done action into a footer, rather than placing a CTA
among its network rows. Its selected network is a selection state, not this
project's custom `preferred` role; the screen is contextual evidence, not a
one-to-one Action Sheet specification.

## Measurements and native operation

| Browser viewport | Details / Continue / Cancel width | Row height | Left position |
| --- | --- | --- | --- |
| 390×844 | 390 px each | 52 px each | 0 px each |
| 1280×844 | 640 px each | 52 px each | 320 px each |

These values hold in both light/dark. Text starts in the same column; Cancel is
fully visible. Tests also check that the container surface fills group spacing.

Final production assets were built into a debug APK and installed on the official
Android 17/API 37 Pixel Tablet image, DPR 2. Native landscape was 1280×800 CSS px;
portrait was 800×1280. In both, all three sheet rows measured 640×52 CSS px, at
x=320 and x=80 respectively. Both overlays were opened through physical trigger taps, then Continue was tapped
in all four configurations: **eight `preferred` dismissals**.

| Native mode | Action Sheet |
| --- | --- |
| Landscape light | [Capture](overlay-action-hierarchy-2026-11-08/landscape-light-action-sheet.png) |
| Landscape dark | [Capture](overlay-action-hierarchy-2026-11-08/landscape-dark-action-sheet.png) |
| Portrait light | [Capture](overlay-action-hierarchy-2026-11-08/portrait-light-action-sheet.png) |
| Portrait dark | [Capture](overlay-action-hierarchy-2026-11-08/portrait-dark-action-sheet.png) |

[Native Alert light](overlay-action-hierarchy-2026-11-08/portrait-light-alert.png),
[native Alert dark](overlay-action-hierarchy-2026-11-08/portrait-dark-alert.png),
[Browser phone light](overlay-action-hierarchy-2026-11-08/browser-phone-light.png),
[browser phone dark](overlay-action-hierarchy-2026-11-08/browser-phone-dark.png),
[native measurements and dismissal records](overlay-action-hierarchy-2026-11-08/native-results.json),
and [tested source/APK hashes](overlay-action-hierarchy-2026-11-08/source-sha256.json).

The APK used the published companion plugin, which does not implement the
experimental dynamic-color method. Native captures therefore test Ionic fallback
colors, with the light/dark class selected explicitly. Optional role rendering is
covered separately through the recorded Android 17 bridge fixture in browser tests;
these captures do not establish native wallpaper-color delivery. A separate actual-touch
probe confirmed that Alert's outer focus outline appears for programmatic/keyboard
focus, not for the ordinary touch flow; keyboard focus cues were preserved.

## Validation and image boundary

- Full browser suite: **239 passed on Ionic 9 and 239 on Ionic 8**, including the
  eight new phone/tablet × light/dark × Ionic/device geometry cases.
- After the final destructive hover/focus correction, all **12** affected
  shared-markup/hierarchy cases passed again on each Ionic major. A dedicated
  added assertion first reproduced the old destructive hover failure.
- Build, production demo build, package/demo lint and focused E2E TypeScript checks passed.
- The 52 responsive cases and eight native operations above are additional probes.

The final Action Sheet scene subset was also recaptured on Linux/Ionic 8 after
the hover/focus correction: 22 screenshot/shared-markup cases passed.

Candidate screenshots were generated only in temporary directories. Images under
this report are visual-review evidence, not regression baselines. No normal or
`device-*` baseline PNG has been replaced locally. Once a new PR is authorized,
run `/update-screenshots` there and inspect the resulting CI images before merge.
