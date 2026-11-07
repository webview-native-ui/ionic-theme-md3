# Android 17 tablet review — 2026-11-07

Android 17 Settings is the current visual reference. Material guidelines remain supporting information; Ionic markup, sizing overrides, opt-outs, and modal behavior remain the application contract. This report supersedes the Android 16 reference for the tablet observations below, without relabeling earlier captures.

## Result and change

The tablet Alert was content-sized at approximately 402 CSS px, while Settings used 832 px at 1280×800 and 680 px at 800×1280. The theme now uses the measured 65% landscape / 85% portrait proportions for wide tablet windows. The 280 px minimum remains; public `--width` and `--max-width` independently override the defaults, through inline bindings or normal `ion-alert.custom-class` rules in global styles. Sizing selectors are intentionally less specific than the decorative theme selectors.

A height-based breakpoint initially shrank the landscape Alert from 832 to 280 px when the IME opened. The final Android-only supplement uses Ionic's `plt-android` class and CSS screen dimensions (both at least 600 px, with viewport width at least 768 px). Device aspect ratio distinguishes rotation from an IME resize. `:where()` avoids increasing selector specificity. This adds no JavaScript or Capacitor dependency. Other windows retain the ordinary viewport rules; phones, `mode="ios"`, and `md3-disabled` are not opted into this supplement.

Official emulator setup: [Get Android 17](https://developer.android.com/about/versions/17/get).

## Reference environment

- Pixel Tablet AVD, official `system-images;android-37.0;google_apis;arm64-v8a` image.
- Actual OS reports Android **17**, API **37**; build `CE2A.260420.051.A3/16571990`, security patch 2026-08-05.
- 2560×1600 physical display, density 320; WebView DPR 2. Portrait viewport 800×1280 and landscape 1280×800.
- Demo production bundle in a debug APK; target SDK remains 36. This is a rendering review on Android 17, not acceptance of all target-SDK-37 behavior changes.
- Experimental companion plugin revision `ecad9efe173203fd0ba2a129eb899e3d51427323` supplied optional native roles.

[Device metadata](android17-tablet-2026-11-07/device.json), [runtime source fingerprints](android17-tablet-2026-11-07/source-sha256.json), and [cold-start scheme](android17-tablet-2026-11-07/cold-start-scheme.json) identify the test environment.

The old AVD creation tool initially wrote `target=android-0` for API 37.0, disabling HVF. Correcting the temporary AVD metadata to 37 enabled normal boot; the official system image was unchanged. An initial app process also differed from Settings by a few RGB levels. A cold app restart resolved the difference. That earlier capture set is excluded from these measurements; its exact cause was not established. No palette-specific CSS or plugin workaround was introduced.

## Measured comparison

| Property | Android 17 Settings | Demo |
| --- | --- | --- |
| Light page / row | `#eeedf6` / `#faf8fe` | Same sampled pixels |
| Dark page / row | `#181920` / `#2a2c34` | Same sampled pixels |
| List outside corner | Approximately 20.4 dp from raster boundary | Declared 20 CSS px; approximately 20.4–20.6 from raster boundary |
| Landscape dialog width | 832 px at 1280 px viewport | 832 px, centered at x=224 |
| Portrait dialog width | 680 px at 800 px viewport | 680 px, centered at x=60 |
| Additional resized portrait probe | Approximately 870.5 px at width 1024 | Browser case covers 85% (870.4 px) |
| Alert corner | Approximately 28.1 dp from raster boundary | Declared 28 CSS px; approximately 28.1 from raster boundary |

List corner fitting uses exact flat-color pixels near the rounded edge. Antialiasing and fractional alignment introduce about one physical pixel of uncertainty; the numbers do not imply a fractional design radius. Neutral demo probes remove the page's explicit `color="light"` from its content and toolbar to inspect the theme defaults. Ordinary demo captures retain their explicit Ionic colors. Dialog labels, height, and button arrangement remain Ionic's and are not claimed to match the Settings dialog pixel for pixel.

[List raster measurements](android17-tablet-2026-11-07/measurements.json), [dialog raster measurements](android17-tablet-2026-11-07/dialog-measurements.json), and [native screen/bounds/action records](android17-tablet-2026-11-07/demo-results.json).

## Captures

| Window / mode | Settings page | Neutral list | Settings dialog | Ionic Alert |
| --- | --- | --- | --- | --- |
| Landscape light | [Image](android17-tablet-2026-11-07/settings-landscape-light.png) | [Image](android17-tablet-2026-11-07/neutral-landscape-light.png) | [Image](android17-tablet-2026-11-07/dialog-landscape-light.png) | [Image](android17-tablet-2026-11-07/demo-landscape-light-alert-preferred.png) |
| Landscape dark | [Image](android17-tablet-2026-11-07/settings-landscape-dark.png) | [Image](android17-tablet-2026-11-07/neutral-landscape-dark.png) | [Image](android17-tablet-2026-11-07/dialog-landscape-dark.png) | [Image](android17-tablet-2026-11-07/demo-landscape-dark-alert-preferred.png) |
| Portrait light | [Image](android17-tablet-2026-11-07/settings-portrait-light.png) | [Image](android17-tablet-2026-11-07/neutral-portrait-light.png) | [Image](android17-tablet-2026-11-07/dialog-portrait-light.png) | [Image](android17-tablet-2026-11-07/demo-portrait-light-alert-preferred.png) |
| Portrait dark | [Image](android17-tablet-2026-11-07/settings-portrait-dark.png) | [Image](android17-tablet-2026-11-07/neutral-portrait-dark.png) | [Image](android17-tablet-2026-11-07/dialog-portrait-dark.png) | [Image](android17-tablet-2026-11-07/demo-portrait-dark-alert-preferred.png) |

## Keyboard and public sizing

Actual IME input was shown (`mInputShown=true`). In landscape, viewport height changed from 800 to 424 while CSS screen size stayed 1280×800; Alert width stayed **832 px**. In portrait, height changed from 1280 to 904 while CSS screen size stayed 800×1280; width stayed **680 px**. The action area remained above the keyboard. Setting either public width property to 400 px produced 400 px in both orientations.

[Landscape input](android17-tablet-2026-11-07/keyboard-landscape.png), [portrait input](android17-tablet-2026-11-07/keyboard-portrait.png), [raw keyboard records](android17-tablet-2026-11-07/keyboard-results.json).

## Verification scope

- Browser review: 42 routes × two tablet orientations × light/dark = **168 passed**, with actual Popover/Select Popover opening. Non-sheet overlay bounds and page overflow were measured; screenshots and selected lower scrolled content were visually reviewed. Sheets intentionally extend below the viewport at partial breakpoints.
- Native component dataset: 15 representative routes × four configurations = **60**. Preferred actions were tapped eight times, toggles four times, and modal normal/card/sheet dismissed twelve times. Alert/Action Sheet captures were refreshed after the Alert change; other component CSS was unchanged from the initial native sweep. Input/IME probes were additional.
- Thirteen permanent regression cases cover defaults, both public sizing properties, opt-out, compact windows, Android phone exclusion, simulated IME resize, and rotation. Local final-source Ionic 8 passed all **137** cases; final Ionic 9 tablet cases passed **13/13**. Final-head CI results are recorded on PR #57.
- Demo unit suite: **62 passed**. Supervisor and independent reviewers rechecked the returned public-width and IME findings after fixes.

This is scoped acceptance of the measured reference windows. Native Android 17 phone hardware, every OEM or wallpaper, localization/font scaling, desktop windowing, multi-display, and every possible interaction state were not covered. Modal/card/sheet geometry keeps Ionic's contracts; no one-to-one Settings screen correspondence is asserted for those components. Historical Android 15/16 integration evidence remains separately labeled.
