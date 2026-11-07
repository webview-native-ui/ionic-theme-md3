# Shared markup validation — 2026-11-07

This supplements the [earlier Android 16 review](android16-2026-11-07.md) for the shared-markup changes. The markup carries the same action meaning as iOS27; Android Settings remains the visual reference. `preferred` is a webview-native-ui convention, not a new Android or Ionic built-in behavior.

## Scope

- Alert: ordinary/default/confirm actions are text actions. Only `preferred` requests a primary filled action. Existing Cancel outline and destructive coloring remain separate.
- Action Sheet: `preferred` has primary/on-primary colors, rounded ends, and 24 CSS px horizontal margins. Ordinary rows retain Ionic behavior.
- Submit buttons, grouped inset lists, two-line notes, and `.item-group-header` reuse existing MD3 rendering. iOS Glass and other platform-specific effects are not introduced.

## Android 16 evidence

Built the final demo production bundle into a debug APK and installed it on the same API 36.1 emulator used for the earlier review (1080 × 2400, density 420, DPR 2.625). The experimental native color plugin revision remains `ecad9efe173203fd0ba2a129eb899e3d51427323`.

| Mode | Alert | Action Sheet |
| --- | --- | --- |
| Light | [Capture](shared-markup-2026-11-07/native-light-alert.png) | [Capture](shared-markup-2026-11-07/native-light-action-sheet.png) |
| Dark | [Capture](shared-markup-2026-11-07/native-dark-alert.png) | [Capture](shared-markup-2026-11-07/native-dark-action-sheet.png) |

For each of these four presentations, sampled computed paint and actually tapped Continue through the emulator. All four dismissals reported `preferred`; Details retained a transparent background. The Action Sheet's preferred action stays inset from the sheet edges. [Raw bounds, colors, and dismissal results](shared-markup-2026-11-07/native-results.json) and [relevant source fingerprints](shared-markup-2026-11-07/source-sha256.json) identify the tested runtime.

The added four browser cases cover both overlay types in both modes, normal versus preferred paint, optional Material role colors, component opt-out and restoration, no automatic dismissal, and the actual preferred dismissal role. Screenshot candidates were generated separately on Linux and visually inspected. This is scoped validation of the shared markup changes; it does not extend the earlier report to every component, OEM, palette, or accessibility setting.

Final-source local runs: Ionic 8 passed all 124 cases against the same baselines; Ionic 9 passed the 26 affected screenshot cases and four shared-markup cases after the final spacing/demo-link changes. Its preceding full 124-case run also passed. Supervisor review inspected all 26 affected Linux captures and four final Android captures; independent review checked the shared semantics against iOS27. Neither returned an additional finding. Final-head GitHub CI results are recorded on the PR.

The demo unit suite passed 62/62 after updating its fixed live-preview count from four to five for the new submit example. This follow-up only changes the test expectation and validation record; the runtime fingerprints above remain unchanged.
