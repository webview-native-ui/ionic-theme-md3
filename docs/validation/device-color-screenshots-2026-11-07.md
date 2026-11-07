# Device-color screenshot review — 2026-11-07

## Scope

The new visual tests feed a recorded Android 17 light/dark scheme through a mocked
Capacitor native transport. The real demo adapter, theme controller, conversion,
CSS application and native change callback execute. They do not directly install
CSS fixtures or skip dynamic-color startup.

The fixed response comes from the earlier [Android 17 cold-start capture](android17-tablet-2026-11-07/cold-start-scheme.json).
It is an input fixture, not a new native measurement or proof of wallpaper event
delivery. The [fixture notes](../../demo/e2e/fixtures/README.md) describe the bridge boundary.

## Coverage and oracle

- All 42 existing route variants with the device scheme in light and dark: 84 images.
- Native change notifications reducing the scheme to the six compatibility fields:
  two images, with stale optional roles explicitly checked for removal.
- Actively dragged Range pins: two images, with inverse-surface/inverse-on-surface
  checked against the raw device response.
- Popover, Select and Modal scenes use actual trigger clicks. Select's interface is
  asserted before opening, avoiding a misleading Alert capture for a Popover case.
- Rendered colors for filled/tonal/elevated buttons, card variants, FAB, selected
  chips, explicit Ionic danger, Searchbar and Toggle are compared with raw fixture
  roles. This supplements image comparison: generating a first baseline is not
  evidence that its color assignment is correct.

## Findings and corrections

The first rendered-color checks found that shape styles had greater specificity
than optional-role styles. Searchbar retained its old background, text and icon
colors; Toggle checked-thumb and track-border colors could mask Material roles;
Range's pin background retained an older neutral value.

CI also exposed an existing one-button Alert focus race. Ionic's scoped
`.ion-focused` background could replace the filled destructive surface with gray
while retaining its contrast foreground, producing a dark gray/black pair in
Ionic-only dark mode. Focused preferred/destructive actions now retain their role
pairs and gain a visible inset focus ring. Their screenshot scenes explicitly
exercise keyboard focus; native scenes also assert the raw role pair.

Color ownership now remains in the color stylesheet. Shape styles keep dimensions,
borders and geometry; explicit Ionic Toggle palettes retain their neutral off-state
border and selected palette border. No native acquisition or conversion algorithm
was changed.

## Direct image inspection

Reviewed the 86 initial route/update candidates in labeled contact sheets. Opened
palette, Searchbar and Toggle images at larger size, and separately inspected both
active Range-pin images. Also inspected Linux palette/pin candidates and the
final pointer-selected Select Alert. Checked surface/text pairs, accent/container treatments,
explicit Ionic colors, disabled controls and visible overlay content. Long route
sheets were reviewed for color/layout patterns; the raw-role assertions provide
the precise pair checks on representative controls.

The chosen recorded scheme retains readable foregrounds in the inspected states.
No remaining missing assignment or incorrect pair was found within this scope.
This does not establish every possible custom palette, control state or OEM scheme.

## Capture readiness

Captures wait for hydrated content, loaded fonts and two animation frames instead
of sleeping for one second per image. Select triggers wait for the public overlay
`DidPresent` event before selecting a radio option. This ensures the overlay's
initial focus work completes before the pointer selection is captured.

The first [CI regeneration attempt](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42338159934)
reached the ten-minute job limit during Ionic 8 comparison. It did not commit
baselines and is not counted as successful CI validation. CI now emits per-case
list output alongside the HTML report so any comparison failure is identifiable.

The [second CI attempt](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42339946715)
committed 88 additional baselines and eight changed existing images. Ionic 9 passed
229 cases; Ionic 8 passed 228 directly with one flaky existing dark Alert case.
That retry-dependent result motivated the Alert focus correction above and is not
claimed as a clean final acceptance result.

## Verification status

- Initial local Chromium candidate run: all 88 added cases passed.
- Linux Ionic 9: 229 cases passed during candidate generation. After making Select
  Alert pointer selection explicit, both affected cases were regenerated and passed.
- Linux Ionic 8: final 229 cases passed against the same candidates without updating
  images (172 screenshot cases and 57 existing non-screenshot cases).
- Readiness changes: 229 Ionic 8 cases passed with CI-like two-worker execution
  in 2.2 minutes; all eight affected Select cases passed again after adding the
  presentation-event wait. The 88 Ionic 9 device cases passed in 23.6 seconds.
- Focus regression: eight keyboard-focused appearance/role states were verified
  three times each without updating images and with retries disabled. All 24
  passed on each Ionic version; background/foreground roles and the inset focus
  ring were also asserted on device-color scenes.
- Theme build, formatting and focused E2E TypeScript checking passed.
- The initial cross-version comparison caught only a Select Alert initial-focus
  outline difference. Capturing an actual pointer-selected option makes the states
  equivalent without hiding focus indicators or changing production accessibility.

Candidate images are kept outside the repository during review. Repository baseline
updates should use the PR `/update-screenshots` CI, generating with Ionic 9 and
comparing the same images with Ionic 8.

## Final CI result

The [final image-update CI](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42341326054)
passed all 229 cases on both Ionic 9 (2.8 minutes) and Ionic 8 (3.2 minutes), with
no flaky cases or retries reported. It generated the baselines with Ionic 9 and
compared them unchanged with Ionic 8. The final image commit is `b035351` on PR #59.

The suite contains 172 screenshot cases: 84 Ionic-default screens and 88
device-color/update/active-pin screens, alongside 57 existing functional cases.
These results supersede the incomplete and retry-dependent attempts noted above.
The final keyboard-focused Alert candidates were inspected for both their
semantic color pairs and visible focus rings.
