# Common color override fixes — 2026-11-07

This change is separate from the device-colored screenshot addition in PR #59.

## Fixes

- Searchbar shape styles no longer override background, text and icon roles.
  Without an optional surface role, retain the existing 8% neutral background
  instead of using the page background; a supplied surface role takes precedence.
- Toggle geometry no longer overrides checked-thumb/track role colors. Explicit
  Ionic palettes retain their neutral off-state and selected-palette borders.
- Range shape styles no longer override knob/pin colors.
- Focused preferred/destructive Alert actions retain their semantic foreground/
  background pair and show an inset focus ring. Ionic's scoped focus background
  previously replaced the filled background with gray.

## Regression checks and direct review

The suite contains 143 cases: 84 normal-color screenshots and 59 functional cases.
Two functional cases exercise all nine Searchbars on the actual demo page in
light/dark, including toolbar and inherited `color="light"` contexts. They check
8% fallback paint, optional surface application/removal and explicit `--background`.

The image update command explicitly uses `--update-snapshots=all`. The default
changed-only mode retained obsolete Searchbar images because the default pixel
comparison threshold ignored the faint 8% background difference. Searchbar image
comparisons now use a stricter threshold of 0.05 to catch that regression.

[CI regeneration and cross-version verification](https://github.com/webview-native-ui/ionic-theme-md3/actions/runs/42366089441)
passed 143 cases on Ionic 9 and 143 on Ionic 8 without flaky cases. Baselines are
CI-generated; local macOS candidates were not copied into the repository.
Unrelated Select Action Sheet recaptures were excluded; their previous baselines
are retained. Twelve normal baselines change for the component fixes and explicit
keyboard-focus scenes. Capture readiness waits for hydration, fonts and render
frames. CI logs individual cases alongside its HTML report.

Reviewed the changed light/dark images against main: Searchbar pills remain
visible, Alert actions retain readable semantic pairs and visible focus rings,
Toggle keeps its checked accent and explicit palette behavior, and Toolbar and
palette layouts retain their existing intent. No additional regression was found
in this review. Focused Alert scenes were also checked three times each with
retries and image updates disabled: 24 passed per Ionic version before separation.
Device-role and active Range pin checks belong to PR #59.
