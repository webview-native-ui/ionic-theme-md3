# Device color fixture

`android17-device-colors.json` contains the `read` payload from
[the recorded Android 17 cold-start scheme](../../../docs/validation/android17-tablet-2026-11-07/cold-start-scheme.json).
It supplies both light and dark schemes, including all 46 Material roles. Keeping
this response fixed makes browser screenshots independent of the host wallpaper,
OS palette, and plugin release availability.

`../device-colors.ts` stubs Capacitor's native transport before the demo boots. It
lets the real demo adapter, `enableDynamicColors`, conversions, role application,
and native change listener run. The fixture is not injected directly as CSS, and
`IONIC_E2E_TESTING` is intentionally not set because it skips this startup path.
Playwright stabilizes screenshot animations instead.

Device screenshots cover the same route variants as the standard suite in light/dark. Popover,
Select, and Modal scenes use actual trigger clicks; Select verifies its interface
before opening. Additional scenes cover a six-field compatibility update with
stale-role removal, and an actively pressed Range pin. Rendered color assertions
compare raw native roles with backgrounds, foregrounds and borders so an incorrect
first screenshot cannot silently become the color oracle.

These tests verify browser rendering given a recorded native response. They do
not test the native plugin's Android resource lookup or wallpaper-change delivery.

Snapshot files remain under `screenshot.spec.ts-snapshots`, so the existing PR
`/update-screenshots` CI generates them with Ionic 9 and verifies the same images
with Ionic 8. Use temporary snapshot paths when inspecting local candidates; do
not replace CI baselines with local macOS screenshots.
