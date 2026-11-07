# Device-colored screenshot coverage — 2026-11-07

## PR boundary

PR #59 adds device-colored image regression coverage. Its prerequisite, PR #60,
contains all common CSS fixes, normal-color screenshot changes and shared capture
readiness/focus setup. Those changes are excluded from the #59 review diff.

The PRs are stacked: #60 targets main; #59 targets the #60 branch. After #60 is
merged, retarget #59 to main and verify the resulting head. Normal-color baselines
remain unchanged relative to #59's base.

## Input and coverage

A [recorded Android 17 response](android17-tablet-2026-11-07/cold-start-scheme.json)
passes through a mocked Capacitor transport and the real demo adapter, conversion,
theme controller and native change callback. CSS values are not installed directly.
[Fixture notes](../../demo/e2e/fixtures/README.md) describe this boundary.

The 88 added images cover:

- All 42 route variants with the device's full light/dark schemes: 84 images.
- Native updates containing only the six compatibility fields: two images, with
  stale optional roles explicitly checked for removal.
- Actively dragged Range pins: two images, with inverse-surface/inverse-on-surface pairs.

Popover, Select and Modal scenes use actual triggers. Select waits for its public
presentation event and verifies the requested interface. Its Alert scene includes
an actual pointer selection. The shared keyboard-focus setup comes from #60;
#59 checks the resulting preferred/destructive paint against raw native roles.

Rendered role-pair checks also cover button/card variants, FAB, selected chips,
Searchbar, Toggle and explicit Ionic danger. These checks deliberately fail if the
prerequisite role fixes are absent; expectations have not been weakened to accept
incorrect first-time baselines.

## Direct review and validation

Reviewed all initial route/update candidates in contact sheets and inspected
palette, Searchbar, Toggle, active pin and final focused Alert images at larger
size. Checked surface/text combinations, accents/containers, explicit Ionic colors,
disabled states and visible overlay bodies. Long route sheets were checked for
color/layout patterns; representative raw-role assertions provide exact pair checks.

Before separation, [CI image generation and cross-version comparison](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42341326054)
passed 229 cases per Ionic version without flaky cases or retries. The
[latest combined-head normal CI](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42342196632)
also passed all 229 test cases per version. Its separate report-publication check
was affected by GitHub Pages file-sync delays.

The current combined suite consists of the base's 143 cases (84 normal screenshots
and 59 functional cases, including the restored Searchbar fallback checks), plus
#59's 88 colored screenshots: 231 cases. The earlier CI links above record the
229-case suite before those two new base checks. Baselines were produced
through `/update-screenshots` CI. Separation changes ownership and documentation;
combined runtime, test behavior and image bytes are preserved.

This is browser rendering given a recorded native response. Android resource
lookup, real wallpaper event delivery, every possible custom palette and OEM
coverage are outside this verification scope.
