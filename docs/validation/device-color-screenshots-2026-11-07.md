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

## Verification status

- Initial local Chromium candidate run: all 88 added cases passed.
- Linux Ionic 9: 229 cases passed during candidate generation. After making Select
  Alert pointer selection explicit, both affected cases were regenerated and passed.
- Linux Ionic 8: final 229 cases passed against the same candidates without updating
  images (172 screenshot cases and 57 existing non-screenshot cases).
- Theme build, formatting and focused E2E TypeScript checking passed.
- The initial cross-version comparison caught only a Select Alert initial-focus
  outline difference. Capturing an actual pointer-selected option makes the states
  equivalent without hiding focus indicators or changing production accessibility.

Candidate images are kept outside the repository during review. Repository baseline
updates should use the PR `/update-screenshots` CI, generating with Ionic 9 and
comparing the same images with Ionic 8.
