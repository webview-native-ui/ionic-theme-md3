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

[CI regeneration and cross-version comparison](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42378795066)
passed all 231 cases on Ionic 9 and all 231 on Ionic 8 without flaky cases.
The suite consists of the base's 143 cases (84 normal screenshots and 59 functional
cases), plus this PR's 88 colored screenshots. Baselines were regenerated with
`--update-snapshots=all` through `/update-screenshots` CI; the shared command and
stricter normal Searchbar comparison belong to #60.

After inheriting #60's final images, the #59 diff was checked again: no source CSS,
normal-color PNG, shared capture setup or package/config changes remain. Two
unrelated normal Select recaptures were excluded to match #60's retained baselines.
All 88 colored images were reviewed again in light/dark contact sheets. Full-role
and six-role compatibility Searchbars were also inspected at larger size: the
optional surface and restored neutral fallback both remain visible. Background/
foreground pairing, explicit Ionic colors, overlay bodies, focused actions and
active Range pin colors showed no additional regression in this review.

This is browser rendering given a recorded native response. Android resource
lookup, real wallpaper event delivery, every possible custom palette and OEM
coverage are outside this verification scope.
